import { expect, test } from "@playwright/test"

test.describe("keyboard-only walkthrough", () => {
  test("first Tab reveals a skip link that jumps past the header", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle") // wait for hydration before using the keyboard
    await page.keyboard.press("Tab")
    const skip = page.getByRole("link", { name: "Skip to content" })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/#main$/)
  })

  test("header controls show a visible focus ring", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle") // wait for hydration before using the keyboard
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab")
      const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        return el ? getComputedStyle(el).outlineStyle : ""
      })
      expect(outline, `tab stop ${i + 1}`).not.toBe("none")
    }
  })

  test("cart drawer traps focus, closes with Escape and returns focus", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle") // wait for hydration before using the keyboard
    const trigger = page.getByRole("button", { name: "Cart", exact: true })
    await trigger.focus()
    await page.keyboard.press("Enter")
    const dialog = page.getByRole("dialog", { name: "Your cart" })
    await expect(dialog).toBeVisible()

    for (let i = 0; i < 6; i++) await page.keyboard.press("Tab")
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("variant options and quantity work without a mouse", async ({ page }) => {
    await page.goto("/products/wigs/brazilian-body-wave-wig")
    await page.waitForLoadState("networkidle")
    const option = page.getByRole("button", { name: '22"' })
    await option.focus()
    await page.keyboard.press("Enter")
    await expect(option).toHaveAttribute("aria-pressed", "true")
    await page.getByRole("button", { name: "Increase quantity" }).focus()
    await page.keyboard.press("Enter")
    await expect(page.getByText("2", { exact: true }).first()).toBeVisible()
  })
})
