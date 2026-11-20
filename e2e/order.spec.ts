import { expect, test } from "@playwright/test"

// Places a REAL order, so it is opt-in and should only point at a staging Supabase project.
test.skip(!process.env.E2E_ALLOW_ORDERS, "set E2E_ALLOW_ORDERS=1 (staging project only)")

test("customer places an order and is handed to WhatsApp", async ({ page }) => {
  await page.goto("/products/tools/wig-cap")
  await page.getByRole("button", { name: "Add to cart" }).first().click()
  await page.getByRole("link", { name: "Checkout" }).click()

  await page.getByLabel("Full name").fill("E2E Test")
  await page.getByLabel("Phone number").fill("08012345678")
  await page.getByLabel("Delivery address").fill("1 Test Street, Ikorodu")
  await page.getByRole("button", { name: "Place order" }).click()

  await expect(page.getByRole("heading", { name: /Order PH-[A-Z0-9]{6} received/ })).toBeVisible()
  const link = page.getByRole("link", { name: /Continue on WhatsApp/ })
  await expect(link).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/)
})
