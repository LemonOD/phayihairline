import { expect, test } from "@playwright/test"

for (const path of ["/login", "/register"]) {
  test(`${path}: password can be revealed and hidden`, async ({ page }) => {
    await page.goto(path)
    const password = page.getByLabel("Password", { exact: true })
    await password.fill("s3cret-pass")
    await expect(password).toHaveAttribute("type", "password")

    await page.getByRole("button", { name: "Show password" }).click()
    await expect(password).toHaveAttribute("type", "text")
    await expect(password).toHaveValue("s3cret-pass")

    await page.getByRole("button", { name: "Hide password" }).click()
    await expect(password).toHaveAttribute("type", "password")
  })
}

test("the reveal button is reachable by keyboard and does not submit the form", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("Password", { exact: true }).focus()
  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Show password" })).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text")
  await expect(page).toHaveURL(/\/login/)
})
