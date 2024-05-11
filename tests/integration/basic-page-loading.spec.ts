import { test, expect } from '@playwright/test';
test.describe('Basic Page Loading', () => {
  test(`no plugins break graphiql`, async ({ page }) => {
    await page.goto(`index.html`);
    await expect(page.locator('.graphiql-container')).not.toBeEmpty();
  });
});
