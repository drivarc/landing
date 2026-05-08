import { test, expect } from '@playwright/test';

test('gizlilik politikası sayfası yükleniyor', async ({ page }) => {
  await page.goto('/privacy.html');
  await expect(page).toHaveTitle('Drivarc - Gizlilik Politikası');
});

test('kullanım şartları sayfası yükleniyor', async ({ page }) => {
  await page.goto('/terms.html');
  await expect(page).toHaveTitle('Drivarc - Kullanım Şartları');
});

test('404 sayfası yükleniyor', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle(/404/);
});
