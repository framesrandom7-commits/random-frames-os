import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = process.env.ARTIFACTS_DIR || '/Users/savansomaiahtp/.gemini/antigravity-ide/brain/8fd0638a-d4e8-4c1b-8bb7-be13cb8d2385';

test.describe('UI Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'frames.random.7@gmail.com');
    await page.fill('input[type="password"]', 'Ponnappa@14');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('**/home**', { timeout: 10000 });
  });

  test('Lead Validation', async ({ page }) => {
    await page.goto('http://localhost:3000/leads');
    await page.waitForLoadState('networkidle');

    // Click "New Lead" or "Add Lead"
    const addBtn = page.getByRole('button', { name: /New Lead/i }).or(page.getByRole('button', { name: /Add Lead/i }));
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
    }

    // Submit empty form
    const saveBtn = page.getByRole('button', { name: /Save Lead/i });
    if (await saveBtn.count() > 0) {
      await saveBtn.first().click();
    }
    
    // Wait a bit for validation errors to appear
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactsDir, 'lead_validation.png') });
  });

  test('Project Quotation Amount Disabled', async ({ page }) => {
    await page.goto('http://localhost:3000/projects');
    await page.waitForLoadState('networkidle');

    // Click "New Project"
    const addBtn = page.getByRole('button', { name: /New Project/i }).or(page.getByRole('button', { name: /Add Project/i }));
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
    }
    
    // Find Quotation Amount input
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactsDir, 'project_form_disabled_field.png') });
  });

  test('Quotation Validation', async ({ page }) => {
    await page.goto('http://localhost:3000/quotations');
    await page.waitForLoadState('networkidle');

    // Click "New Quotation"
    const addBtn = page.getByRole('button', { name: /New Quotation/i }).or(page.getByRole('button', { name: /Create Quotation/i }));
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
    }

    // Submit empty
    const saveBtn = page.getByRole('button', { name: /Save/i }).or(page.getByRole('button', { name: /Create/i }));
    if (await saveBtn.count() > 0) {
      await saveBtn.first().click();
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactsDir, 'quotation_validation.png') });
  });
});
