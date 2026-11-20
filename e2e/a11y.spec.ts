import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const pages = [
  ["home", "/"],
  ["category", "/products/wigs"],
  ["product", "/products/wigs/brazilian-body-wave-wig"],
  ["services", "/services"],
  ["book", "/book"],
  ["contact", "/contact"],
  ["about", "/about"],
  ["login", "/login"],
  ["register", "/register"],
  ["checkout", "/checkout"],
] as const

for (const [name, path] of pages) {
  test(`a11y: ${name}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1200) // let fade-in animations finish so contrast is measured on final colours
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
    const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical")
    expect(
      blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes) e.g. ${v.nodes[0]?.target.join(" ")}`),
    ).toEqual([])
  })
}
