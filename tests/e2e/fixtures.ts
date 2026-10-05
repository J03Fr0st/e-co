import AxeBuilder from '@axe-core/playwright'
import { test as base, expect, type Page } from '@playwright/test'

/** WCAG 2.2 A and AA, the release gate in AC-046. */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']

export async function expectNoA11yViolations(page: Page, include?: string): Promise<void> {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS)
  if (include) builder = builder.include(include)
  const { violations } = await builder.analyze()
  const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.help} [${v.nodes.length} node(s)]`)
  expect(summary, 'axe WCAG 2.2 AA violations').toEqual([])
}

export const test = base.extend<{ expectNoA11yViolations: (include?: string) => Promise<void> }>({
  expectNoA11yViolations: async ({ page }, use) => {
    await use((include) => expectNoA11yViolations(page, include))
  },
})

export { expect }
