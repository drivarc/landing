import { test, expect } from '@playwright/test';
import siteData from './site-data.cjs';

const { getLocalizedPageCases } = siteData;

const pages = getLocalizedPageCases(['privacy.html', 'terms.html', '404.html']);

for (const { path, title } of pages) {
  test(`sayfa yükleniyor: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
  });
}
