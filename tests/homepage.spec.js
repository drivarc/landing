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

test('tüm hreflang linkleri head\'de mevcut', async ({ page }) => {
  await page.goto('/');
  const hreflangs = await page.locator('link[rel="alternate"][hreflang]').all();
  const codes = await Promise.all(hreflangs.map(el => el.getAttribute('hreflang')));
  expect(codes).toContain('tr');
  expect(codes).toContain('en');
  expect(codes).toContain('de');
  expect(codes).toContain('ru');
  expect(codes).toContain('ar');
  expect(codes).toContain('zh');
  expect(codes).toContain('x-default');
});

test('mobile görünümde navigasyon gizli', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('.nav')).toBeHidden();
});
