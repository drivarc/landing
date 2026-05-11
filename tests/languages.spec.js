import { test, expect } from '@playwright/test';
import siteData from './site-data.cjs';

const {
  getLocalizedPagePath,
  getLocalizedSourcePath,
  languageMetadata,
  readTitleFromHtml,
  rtlLanguageCodes,
} = siteData;

const langs = languageMetadata.map(({ code }) => ({
  path: getLocalizedPagePath(code, 'index.html'),
  lang: code,
  title: readTitleFromHtml(getLocalizedSourcePath(code, 'index.html')),
  rtl: rtlLanguageCodes.has(code),
}));

for (const { path, lang, title, rtl } of langs) {
  test(`dil sayfası yükleniyor: ${lang}`, async ({ page }) => {
    await page.goto(path);

    await expect(page.locator('html')).toHaveAttribute('lang', lang);

    if (rtl) {
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    } else {
      await expect(page.locator('html')).not.toHaveAttribute('dir', 'rtl');
    }

    await expect(page).toHaveTitle(title);
  });
}
