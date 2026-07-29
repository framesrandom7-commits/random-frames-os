import { test, expect } from '@playwright/test';

test.describe('Workflow Validations', () => {
  // Use a shared state or just login in beforeEach
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@randomframes.in');
    await page.fill('input[type="password"]', 'Ponnappa@14');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('Lead Workflow: Create -> Edit -> Convert', async ({ page }) => {
    // 1. Navigate to Leads
    await page.goto('http://localhost:3000/leads');
    await expect(page.locator('text=Leads').first()).toBeVisible();

    // 2. Click "Add Lead"
    // Find button containing "Add Lead" or similar
    const addBtn = page.getByRole('button', { name: /add lead/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
    } else {
      // Maybe just an icon? Try clicking the primary button
      await page.locator('button.bg-primary').click();
    }

    // 3. Fill the Lead Form
    // Wait for dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.fill('input[name="contactPerson"]', 'Playwright Test Lead');
    await page.fill('input[name="businessName"]', 'Playwright Inc');
    await page.fill('input[name="email"]', 'playwright@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Submit
    await page.getByRole('button', { name: /save/i }).click();

    // Wait for the modal to close and the new lead to appear
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page.locator('text=Playwright Inc')).toBeVisible();

    // The rest of the workflow (Edit -> Convert) can be added once we verify creation works.
  });
});
