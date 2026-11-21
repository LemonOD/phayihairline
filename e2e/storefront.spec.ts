import { expect, test } from "@playwright/test"

const PRODUCT = "/products/wigs/brazilian-body-wave-wig"

test("browse → choose variant → cart → checkout summary", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("affordably")

  await page.goto(PRODUCT)
  await expect(page.getByRole("heading", { level: 1, name: /Brazilian Body Wave/ })).toBeVisible()

  // Price follows the selected variant.
  const price = page.locator("main").getByText(/^₦[\d,]+$/).first()
  const before = await price.textContent()
  await page.getByRole("button", { name: '26"' }).click()
  await expect(price).not.toHaveText(before ?? "")

  // On phones a sticky copy of this button can be on screen too, so take the inline one.
  await page.getByRole("button", { name: "Add to cart" }).first().click()
  const cart = page.getByRole("dialog", { name: "Your cart" })
  await expect(cart).toBeVisible()
  await expect(cart.getByText(/26"/)).toBeVisible()

  await cart.getByRole("link", { name: "Checkout" }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByText("Order summary")).toBeVisible()
  await expect(page.getByText(/1 × Brazilian Body Wave Wig/).first()).toBeVisible()
})

test("checkout validates before submitting", async ({ page }) => {
  await page.goto(PRODUCT)
  await page.getByRole("button", { name: "Add to cart" }).first().click()
  await page.keyboard.press("Escape")
  await page.goto("/checkout")

  await page.getByRole("button", { name: "Place order" }).click()
  await expect(page.getByText("Enter your name")).toBeVisible()
  await expect(page.getByText("Enter a valid Nigerian phone number")).toBeVisible()
  await expect(page.getByText("Enter your delivery address")).toBeVisible()
})

test("cart survives a reload", async ({ page }) => {
  await page.goto("/products/tools/wig-cap")
  await page.getByRole("button", { name: "Add to cart" }).first().click()
  await page.keyboard.press("Escape")
  await page.reload()
  await page.getByRole("button", { name: /^Cart(,|$)/ }).click()
  await expect(page.getByRole("dialog", { name: "Your cart" }).getByText("Wig Cap").first()).toBeVisible()
})

test("unknown category and product 404", async ({ page }) => {
  expect((await page.goto("/products/nope"))?.status()).toBe(404)
  expect((await page.goto("/products/wigs/does-not-exist"))?.status()).toBe(404)
})

test("admin and account routes redirect anonymous visitors to login", async ({ page }) => {
  await page.goto("/admin")
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin/)
  await page.goto("/account")
  await expect(page).toHaveURL(/\/login\?next=%2Faccount/)
})

test("robots and sitemap are served", async ({ request }) => {
  const robots = await request.get("/robots.txt")
  expect(await robots.text()).toContain("Disallow: /admin")
  const sitemap = await request.get("/sitemap.xml")
  expect(await sitemap.text()).toContain("/products/wigs")
})
