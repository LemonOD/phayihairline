import { expect, test, type Page } from "@playwright/test"

/** Phone-only behaviour. Runs in the `mobile` project (Pixel 7); skipped on desktop. */
test.skip(({ isMobile }) => !isMobile, "phone layout only")

const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)

async function openFirstProduct(page: Page) {
  await page.goto("/products/wigs")
  const link = page.locator("article h2 a, article h3 a").first()
  await link.click()
  await page.waitForURL(/\/products\/wigs\/.+/)
}

test("nothing overflows horizontally on the main pages", async ({ page }) => {
  for (const path of ["/", "/products/wigs", "/about", "/contact", "/book", "/login"]) {
    await page.goto(path)
    expect(await noHorizontalScroll(page), `horizontal scroll on ${path}`).toBe(true)
  }
})

test("header fits: menu, cart and account are all reachable", async ({ page }) => {
  await page.goto("/")
  for (const name of ["Open menu", "Cart", "Sign in"]) {
    const box = await page.getByRole("button", { name, exact: true }).or(page.getByRole("link", { name, exact: true })).first().boundingBox()
    expect(box, name).not.toBeNull()
    expect(box!.x + box!.width, `${name} is on screen`).toBeLessThanOrEqual(page.viewportSize()!.width)
    expect(box!.height, `${name} is a comfortable tap target`).toBeGreaterThanOrEqual(40)
  }
})

test("menu drawer: opens, traps focus, closes with Escape and returns focus", async ({ page }) => {
  await page.goto("/")
  // Located by label: while the modal is open the page behind it is (correctly) hidden from the accessibility tree.
  const trigger = page.locator('button[aria-label="Open menu"]')
  await trigger.click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()
  await expect(trigger).toHaveAttribute("aria-expanded", "true")
  await expect(dialog.getByRole("link", { name: "Wigs" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test("menu drawer navigates and closes", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Open menu" }).click()
  await page.getByRole("dialog").getByRole("link", { name: "About" }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.getByRole("dialog")).toBeHidden()
})

test("form fields are at least 16px so iOS does not zoom the page", async ({ page }) => {
  await page.goto("/contact")
  const sizes = await page.locator("input:not([type=hidden]), textarea, select").evaluateAll((els) =>
    els.map((e) => parseFloat(getComputedStyle(e).fontSize)),
  )
  expect(sizes.length).toBeGreaterThan(0)
  for (const size of sizes) expect(size).toBeGreaterThanOrEqual(16)
})

test("product page: sticky buy bar is pinned to the screen, then hides when the real button shows", async ({ page }) => {
  await openFirstProduct(page)
  const bar = page.locator("div.fixed", { hasText: "Add to cart" }).filter({ hasText: "₦" })
  await expect(bar).toBeVisible()
  const vh = page.viewportSize()!.height
  const box = await bar.boundingBox()
  expect(box!.y + box!.height).toBeGreaterThanOrEqual(vh - 1) // sits on the bottom edge, not at the page's end

  await page.getByRole("button", { name: "Increase quantity" }).scrollIntoViewIfNeeded()
  await expect(bar).toBeHidden()
})

test("adding to cart opens a bottom sheet that can be closed", async ({ page }) => {
  await openFirstProduct(page)
  await page.getByRole("button", { name: /Add to cart/ }).last().click()
  const cart = page.getByRole("dialog", { name: "Your cart" })
  await expect(cart).toBeVisible()
  const box = await cart.boundingBox()
  const vh = page.viewportSize()!.height
  expect(box!.y + box!.height).toBeGreaterThanOrEqual(vh - 1) // docked to the bottom
  expect(box!.y).toBeGreaterThan(vh * 0.1) // leaves the page visible behind it
  await cart.getByRole("button", { name: "Close" }).click()
  await expect(cart).toBeHidden()
})

test("checkout: place-order button stays reachable at the bottom of the screen", async ({ page }) => {
  await openFirstProduct(page)
  await page.getByRole("button", { name: /Add to cart/ }).last().click()
  await page.getByRole("dialog", { name: "Your cart" }).getByRole("link", { name: /Checkout/ }).click()
  await page.waitForURL(/checkout/)
  const place = page.getByRole("button", { name: /Place order/ })
  await expect(place).toBeVisible()
  const box = await place.boundingBox()
  expect(box!.y + box!.height).toBeGreaterThan(page.viewportSize()!.height - 120)
  await place.click()
  await expect(page.getByText("Enter your name")).toBeVisible()
})
