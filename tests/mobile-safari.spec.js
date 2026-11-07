const { test, expect, devices } = require('@playwright/test');

test.use({
  ...devices['iPhone 13'],
  browserName: 'webkit',
});

test('renders and remains interactive in an iPhone-sized WebKit viewport', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:4173/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Four-Quail Garden Habitat' })).toBeVisible();
  await page.waitForTimeout(500);

  const before = await canvas.screenshot();

  const bounds = await canvas.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 80, bounds.y + bounds.height / 2 + 25, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const rotated = await canvas.screenshot();
  expect(rotated.equals(before)).toBe(false);

  await page.getByRole('button', { name: 'Front', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Front', exact: true })).toHaveClass(/active/);
  await page.waitForTimeout(500);
  const front = await canvas.screenshot();
  expect(front.equals(rotated)).toBe(false);

  await page.getByRole('button', { name: 'Open front doors' }).click();
  await expect(page.getByRole('button', { name: 'Close front doors' })).toBeVisible();

  await canvas.dispatchEvent('wheel', { deltaY: -300 });
  await page.waitForTimeout(500);
  const zoomed = await canvas.screenshot();
  expect(zoomed.equals(front)).toBe(false);

  const fitsViewport = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  expect(fitsViewport).toBe(true);
  expect(errors).toEqual([]);
});
