import { expect, test, type Page } from "@playwright/test"

/**
 * Layout regression sweep: every page is rendered at phone, tablet, laptop and wide-desktop widths and
 * checked for the things that make a UI look "distorted": horizontal overflow, content poking past the
 * screen edge, product-card content spilling out of its card, clipped text, and header items overlapping.
 *
 * Runs in the desktop project (it sets its own viewport). The admin pages need credentials:
 * set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to include them.
 */
const WIDTHS = [360, 390, 600, 768, 1024, 1280, 1536, 1920]

const audit = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = []
    const vw = innerWidth
    if (document.documentElement.scrollWidth > vw + 1) out.push(`horizontal overflow (${document.documentElement.scrollWidth} > ${vw})`)

    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      const scrollable = el.closest(".overflow-x-auto, [class*='snap-x']")
      if (r.width && r.right > vw + 2 && cs.position !== "fixed" && !el.closest("[aria-hidden='true']") && !scrollable) {
        out.push(`past the right edge: <${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}">`)
        break
      }
    }

    for (const card of document.querySelectorAll("article")) {
      const cr = card.getBoundingClientRect()
      for (const el of card.querySelectorAll("button, a, p")) {
        const r = el.getBoundingClientRect()
        if (r.width && (r.right > cr.right + 1 || r.left < cr.left - 1)) {
          out.push(`card content outside its card: "${(el.textContent ?? "").trim().slice(0, 24)}"`)
          break
        }
      }
    }

    // Clipped text: the text itself extends past a box that hides overflow. (Decorative shapes that are
    // clipped on purpose, like the blurred circle on a category tile, don't count.)
    const range = document.createRange()
    for (const el of document.querySelectorAll("h1,h2,h3,p,button,a,span,label")) {
      if (el.closest(".sr-only")) continue // visually hidden on purpose (skip link, screen-reader text)
      const cs = getComputedStyle(el)
      if (cs.overflow !== "hidden" || el.clientWidth === 0) continue
      const lineClamped = /\d/.test((cs as CSSStyleDeclaration & { webkitLineClamp?: string }).webkitLineClamp ?? "")
      if (lineClamped || cs.textOverflow === "ellipsis") continue
      const box = el.getBoundingClientRect()
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent?.trim()) continue
        range.selectNodeContents(n)
        const t = range.getBoundingClientRect()
        if (t.width && (t.right > box.right + 2 || t.left < box.left - 2)) {
          out.push(`clipped text: "${n.textContent.trim().slice(0, 30)}"`)
          break
        }
      }
    }

    const header = document.querySelector("header")
    if (header) {
      const boxes = [...header.querySelectorAll("a, button")]
        .filter((e) => e.getBoundingClientRect().width > 0 && !e.closest("nav"))
        .map((e) => e.getBoundingClientRect())
      outer: for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i]!, b = boxes[j]!
          const overlaps = Math.min(a.right, b.right) - Math.max(a.left, b.left) > 4 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4
          const nested = (a.left <= b.left && a.right >= b.right) || (b.left <= a.left && b.right >= a.right)
          if (overlaps && !nested) { out.push("header items overlap"); break outer }
        }
      }
    }
    return out
  })

async function sweep(page: Page, path: string) {
  const problems: string[] = []
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: width < 700 ? 800 : 900 })
    await page.goto(path)
    await page.waitForLoadState("load")
    await page.waitForTimeout(500)
    for (const issue of await audit(page)) problems.push(`@${width}px ${issue}`)
  }
  return problems
}

for (const [name, path] of [["home", "/"], ["category", "/products/wigs"], ["contact", "/contact"], ["book", "/book"], ["sign in", "/login"], ["register", "/register"]] as const) {
  test(`${name}: no overflow, clipping or overlap from 360px to 1920px`, async ({ page }) => {
    expect(await sweep(page, path)).toEqual([])
  })
}

test("product page: no overflow, clipping or overlap from 360px to 1920px", async ({ page }) => {
  await page.goto("/products/wigs")
  const href = await page.locator("article h2 a, article h3 a").first().getAttribute("href")
  expect(href).toBeTruthy()
  expect(await sweep(page, href!)).toEqual([])
})

test("the desktop header only appears when it fits (1024px+); smaller screens get the menu button", async ({ page }) => {
  for (const [width, desktop] of [[768, false], [1023, false], [1024, true], [1440, true]] as const) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/")
    const nav = await page.locator('header nav[aria-label="Main"]').isVisible()
    const menu = await page.locator('button[aria-label="Open menu"]').isVisible()
    expect({ width, nav, menu }).toEqual({ width, nav: desktop, menu: !desktop })
  }
})

test("product cards: 2 across on phones, 3 on tablets, 4 on wide screens", async ({ page }) => {
  const acrossAt = async (width: number) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/products/wigs")
    await page.waitForLoadState("load")
    return page.evaluate(() => {
      const tops = [...document.querySelectorAll("article")].map((a) => Math.round(a.getBoundingClientRect().top))
      return tops.filter((t) => t === tops[0]).length
    })
  }
  expect(await acrossAt(390)).toBe(2)
  expect(await acrossAt(768)).toBe(3)
  expect(await acrossAt(1440)).toBe(4)
})

const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test.describe("admin area", () => {
  test.skip(!email || !password, "set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD")
  // Signing in hits the real Supabase auth service, which can be slow when several tests do it at once.
  test.describe.configure({ retries: 2 })

  for (const [name, path] of [["overview", "/admin"], ["products", "/admin/products"], ["orders", "/admin/orders"], ["bookings", "/admin/bookings"]] as const) {
    test(`${name}: no overflow, clipping or overlap from 360px to 1920px`, async ({ page }) => {
      await page.goto("/login")
      await page.getByLabel(/email/i).fill(email!)
      await page.getByLabel(/password/i).first().fill(password!)
      await page.getByRole("button", { name: /sign in/i }).last().click()
      await page.waitForURL((u) => u.pathname !== "/login")
      expect(await sweep(page, path)).toEqual([])
    })
  }

  test("sidebar on desktop, menu drawer below it", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(email!)
    await page.getByLabel(/password/i).first().fill(password!)
    await page.getByRole("button", { name: /sign in/i }).last().click()
    await page.waitForURL((u) => u.pathname !== "/login")
    for (const [width, sidebar] of [[768, false], [1023, false], [1024, true], [1440, true]] as const) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/admin")
      const nav = await page.locator('aside nav[aria-label="Admin"]').isVisible()
      const menu = await page.locator('button[aria-label="Open menu"]').isVisible()
      expect({ width, nav, menu }).toEqual({ width, nav: sidebar, menu: !sidebar })
    }
  })
})
