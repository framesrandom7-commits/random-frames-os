import { test, expect } from '@playwright/test';

test.describe('Random Frames OS Functional Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:3000/login');
  });

  test('Dashboard loads', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

});
