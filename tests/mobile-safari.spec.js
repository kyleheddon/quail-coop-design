const { test, expect, devices } = require('@playwright/test');

test.use({
  ...devices['iPhone 13'],
  browserName: 'webkit',
});
test.setTimeout(60_000);

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
  await expect(page.getByRole('button', { name: 'Front', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(500);
  const front = await canvas.screenshot();
  expect(front.equals(rotated)).toBe(false);

  await page.getByLabel('Open doors').check({ force: true });
  await expect(page.getByLabel('Open doors')).toBeChecked();

  await canvas.dispatchEvent('wheel', { deltaY: -300 });
  await page.waitForTimeout(500);
  const zoomed = await canvas.screenshot();
  expect(zoomed.equals(front)).toBe(false);

  await page.getByRole('button', { name: 'Floor tray', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Floor tray', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Floor tray', exact: true }).click();

  await page.getByRole('tab', { name: 'Build steps' }).click();
  await page.getByRole('button', { name: 'Show in 3D' }).first().click();
  await expect(page.getByText(/Step 1 of 8/)).toBeVisible();

  await page.getByRole('tab', { name: 'Cut list' }).click();
  await expect(page.getByRole('columnheader', { name: 'Part' })).toBeVisible();

  await page.getByRole('tab', { name: /Porch coop/ }).click();
  await expect(page.getByRole('heading', { name: 'Four-Quail Porch Coop' })).toBeVisible();
  await page.getByRole('tab', { name: /Outdoor habitat/ }).click();
  await expect(page.getByRole('heading', { name: 'Four-Quail Garden Habitat' })).toBeVisible();

  const fitsViewport = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  expect(fitsViewport).toBe(true);
  expect(errors).toEqual([]);
});
