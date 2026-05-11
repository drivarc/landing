import { test, expect } from '@playwright/test';
import siteData from './site-data.cjs';

const { getAlternateHref, languageMetadata, getLocalizedSourcePath, readTitleFromHtml } = siteData;

const rootTitle = readTitleFromHtml(getLocalizedSourcePath('tr', 'index.html'));

test('ana sayfa yükleniyor ve başlık doğru', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(rootTitle);
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

  const hreflangs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) =>
    Object.fromEntries(links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]))
  );

  for (const { code } of languageMetadata) {
    expect(hreflangs[code]).toBe(getAlternateHref(code, 'index.html'));
  }

  expect(hreflangs['x-default']).toBe(getAlternateHref('tr', 'index.html'));
});

test('mobile görünümde navigasyon gizli', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('.nav')).toBeHidden();
});
