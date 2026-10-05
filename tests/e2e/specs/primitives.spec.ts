import type { Locator, Page } from '@playwright/test'
import { expect, test } from '../fixtures'

/** S2 checks against the primitives showcase (built with VITE_SHOWCASE=true). */
test.describe('primitives showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev/primitives')
    await expect(page.getByRole('heading', { level: 1, name: 'Primitives' })).toBeVisible()
  })

  test('has no WCAG 2.2 AA violations in its resting state', async ({ expectNoA11yViolations }) => {
    await expectNoA11yViolations()
  })

  test('has no violations with the select open', async ({ page, expectNoA11yViolations }) => {
    await page.getByRole('combobox', { name: 'Country' }).click()
    await expect(page.getByRole('listbox')).toBeVisible()
    // A modal listbox hides the page with aria-hidden while trapping focus inside itself;
    // axe cannot see the trap, so this state is scanned at the popup. The page is scanned at rest.
    await expectNoA11yViolations('[role="listbox"]')
  })

  test('has no violations with the dialog open', async ({ page, expectNoA11yViolations }) => {
    await page.getByRole('button', { name: 'Refund this order' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expectNoA11yViolations()
  })

  test('has no violations with notices showing', async ({ page, expectNoA11yViolations }) => {
    await page.getByRole('button', { name: 'Show confirmation' }).click()
    await page.getByRole('button', { name: 'Show failure' }).click()
    await expect(page.getByRole('region', { name: /Notifications/ }).getByText('Could not save address')).toBeVisible()
    await expectNoA11yViolations()
  })

  test('has no violations with search suggestions open', async ({ page, expectNoA11yViolations }) => {
    await page.getByRole('combobox', { name: 'Search the shop' }).fill('wo')
    await expect(page.getByRole('listbox')).toBeVisible()
    await expectNoA11yViolations()
  })

  test('has no violations when search finds nothing', async ({ page, expectNoA11yViolations }) => {
    const input = page.getByRole('combobox', { name: 'Search the shop' })
    await input.fill('zzz')
    await expect(page.getByTestId('search').getByText('No matches')).toBeVisible()
    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expectNoA11yViolations()
  })

  test('picking the same suggestion twice reports both picks', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Search the shop' })
    for (const pick of [1, 2]) {
      await input.fill('merino')
      await page.getByRole('option', { name: 'Merino crew jumper' }).click()
      await expect(page.getByTestId('search-chosen')).toHaveText(`Chosen: Merino crew jumper (pick ${pick})`)
    }
  })

  test('dialog traps focus and returns it to the trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Refund this order' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('search suggestions work with arrows, Enter and Escape', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Search the shop' })

    await input.fill('w')
    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(input).toHaveAttribute('aria-expanded', 'false')

    await input.fill('wool')
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()
    await expect(listbox.getByRole('option')).toHaveText(['Lambswool cardigan', 'Pleated wool trousers'])

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('search-chosen')).toHaveText('Chosen: Pleated wool trousers (pick 1)')

    await input.fill('wool')
    await expect(listbox).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(listbox).toBeHidden()
  })

  test('size buttons move by arrow key and skip the sold-out size', async ({ page }) => {
    const sizes = page.getByTestId('choices').getByRole('radiogroup', { name: 'Size' })
    await sizes.getByRole('radio', { name: 'S', exact: true }).focus()

    await pressArrowUntilFocused(page, sizes.getByRole('radio', { name: 'L', exact: true }))

    await expect(sizes.getByRole('radio', { name: 'L', exact: true })).toBeChecked()
    await expect(sizes.getByRole('radio', { name: 'M, Sold out' })).toBeDisabled()
  })

  test('the colour dial names each colour and moves by arrow key', async ({ page }) => {
    const dial = page.getByRole('radiogroup', { name: /^Colour/ })
    await dial.getByRole('radio', { name: 'Ink' }).focus()

    await pressArrowUntilFocused(page, dial.getByRole('radio', { name: 'Oat' }))

    await expect(dial.getByRole('radio', { name: 'Oat' })).toBeChecked()
    await expect(dial.getByRole('radio', { name: 'Rust, Sold out' })).toBeDisabled()
    await expect(page.getByRole('img', { name: /Heavyweight crew tee in Oat/ })).toBeVisible()
  })

  test('Add to bag plays the porthole quarter-turn, and only then', async ({ page }) => {
    const turning = page.locator('[class*="drum-turn"]')
    await expect(turning).toHaveCount(0)

    await page.getByTestId('machine-panel').getByRole('button', { name: 'Add to bag' }).click()

    await expect(turning).toHaveCount(1)
    await expect(page.getByRole('region', { name: /Notifications/ }).getByText('Added to bag')).toBeVisible()
  })

  test('every control clears the target-size minimum, and primary actions reach 44px', async ({ page }) => {
    const undersized = await page.evaluate(() => {
      const selector = 'button, a[href], input, [role="radio"], [role="checkbox"], [role="combobox"]'
      return [...document.querySelectorAll<HTMLElement>(selector)]
        .filter((el) => el.offsetParent !== null && !el.closest('p'))
        .map((el) => {
          const { width, height } = el.getBoundingClientRect()
          const primary = el.matches('button.bg-enamel')
          const min = primary ? 44 : 24
          return width < 24 || height < min ? `${el.tagName} "${el.textContent?.trim() || el.getAttribute('aria-label')}" ${Math.round(width)}x${Math.round(height)}` : null
        })
        .filter(Boolean)
    })
    expect(undersized).toEqual([])
  })

  test('reduced motion removes every transition and animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.getByRole('button', { name: 'Refund this order' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    expect(await movingElements(page)).toEqual([])
  })
})

test('the skip link is the first stop and moves focus to the main content', async ({ page, browserName }) => {
  await page.goto('/')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  const firstFocusable = await page.evaluate(
    () => document.querySelector('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')?.textContent,
  )
  expect(firstFocusable).toBe('Skip to content')

  if (browserName === 'webkit') {
    // Playwright's WebKit, like Safari by default, does not Tab to links.
    await skip.focus()
  } else {
    await page.keyboard.press('Tab')
  }
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()

  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
})

/**
 * A real key press: Radix checks the next radio only while the arrow is held when focus lands,
 * so hold the key until focus has moved instead of tapping it instantly.
 */
async function pressArrowUntilFocused(page: Page, target: Locator): Promise<void> {
  await page.keyboard.down('ArrowRight')
  await expect(target).toBeFocused()
  await page.keyboard.up('ArrowRight')
}

async function movingElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const moving = (value: string) => value.split(',').some((part) => parseFloat(part) > 0)
    return [...document.querySelectorAll<HTMLElement>('*')]
      .filter((el) => {
        const style = getComputedStyle(el)
        return moving(style.transitionDuration) || moving(style.animationDuration)
      })
      .map((el) => `${el.tagName}.${el.className}`.slice(0, 80))
  })
}
