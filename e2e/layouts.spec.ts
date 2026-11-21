import { expect, test, type Page } from "@playwright/test"

/**
 * Sign-in/register and the admin area live outside the storefront frame, and admins land on the dashboard.
 * The signed-in checks need real admin credentials: set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run them.
 */
/** What is actually on screen. Elements hidden by CSS (e.g. the admin's phone-only menu button) don't count. */
const chrome = (page: Page) =>
  page.evaluate(() => {
    const visible = (sel: string) => [...document.querySelectorAll(sel)].some((e) => (e as HTMLElement).getClientRects().length > 0)
    return {
      storefrontNav: visible('header nav[aria-label="Main"], footer nav[aria-label="Footer"]') || visible('header button[aria-label="Open menu"]'),
      footer: visible("footer"),
      adminNav: visible('nav[aria-label="Admin"]'),
    }
  })

for (const path of ["/login", "/register", "/forgot-password"]) {
  test(`${path} has no storefront navigation or footer, but a way back`, async ({ page }) => {
    await page.goto(path)
    expect(await chrome(page)).toMatchObject({ storefrontNav: false, footer: false })
    await expect(page.getByRole("link", { name: /Back to store/ })).toBeVisible()
  })
}

test("an unknown URL still shows the storefront header and footer", async ({ page }) => {
  await page.goto("/definitely-not-a-page")
  const c = await chrome(page)
  expect(c.storefrontNav && c.footer).toBe(true)
})

test("anonymous visitors to /admin are sent to sign in and returned afterwards", async ({ page }) => {
  await page.goto("/admin")
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin/)
})

const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test.describe("signed-in admin", () => {
  test.skip(!email || !password, "set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD")
  // Signing in hits the real Supabase auth service, which can be slow when several tests do it at once.
  test.describe.configure({ retries: 2 })

  async function signIn(page: Page) {
    await page.goto("/login")
    await page.getByLabel(/email/i).fill(email!)
    await page.getByLabel(/password/i).first().fill(password!)
    await page.getByRole("button", { name: /sign in/i }).last().click()
    await page.waitForURL((u) => u.pathname !== "/login")
  }

  test("signing in lands straight on the dashboard, in its own shell", async ({ page }) => {
    await signIn(page)
    await expect(page).toHaveURL(/\/admin$/, { timeout: 20_000 })
    expect(await chrome(page)).toMatchObject({ adminNav: true, storefrontNav: false, footer: false })
  })

  test("opening /login while signed in goes to the dashboard", async ({ page }) => {
    await signIn(page)
    await page.goto("/login")
    // The proxy looks up the user's role before redirecting, so allow for a slow database.
    await expect(page).toHaveURL(/\/admin$/, { timeout: 20_000 })
  })

  test("signing out from the admin menu returns to the storefront", async ({ page }) => {
    await signIn(page)
    await page.getByRole("button", { name: "Account menu" }).click()
    await page.getByRole("menuitem", { name: /Sign out/ }).click()
    await expect(page).toHaveURL(/\/$/, { timeout: 20_000 })
  })
})
