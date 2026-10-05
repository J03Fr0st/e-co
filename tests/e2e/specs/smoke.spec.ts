import { expect, test } from '../fixtures'

test('the placeholder home page loads and is accessible', async ({ page, expectNoA11yViolations }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Long Cycle')
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
  await expectNoA11yViolations()
})

test('the health endpoint reports a reachable database', async ({ request }) => {
  const response = await request.get('/api/v1/health')

  expect(response.status()).toBe(200)
  const body = await response.json()
  expect(body.status).toBe('Healthy')
  expect(body.checks).toContainEqual({ name: 'database', status: 'Healthy' })
})
