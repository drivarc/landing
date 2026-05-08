import { test, expect } from '@playwright/test';

test('ana sayfa yükleniyor ve başlık doğru', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Drivarc - Araç Takip ve Yönetim');
});

test('hero bölümü mevcut', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-section')).toBeVisible();
});

test('dil değiştirici butonu mevcut', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.language-selector, #languageSelector, [aria-label*="Dil"], [class*="lang"]').first()).toBeVisible();
});
