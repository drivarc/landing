import { test, expect } from '@playwright/test';

const langs = [
  { path: '/en/', lang: 'en', title: 'Vehicle Tracking & Management' },
  { path: '/de/', lang: 'de', title: 'Fahrzeug-Tracking & Verwaltung' },
  { path: '/ru/', lang: 'ru', title: 'Отслеживание и управление транспортными средствами' },
  { path: '/zh/', lang: 'zh', title: '车辆追踪与管理' },
  { path: '/ar/', lang: 'ar', title: 'تتبع وإدارة المركبات' },
];

for (const { path, lang, title } of langs) {
  test(`dil sayfası yükleniyor: ${lang}`, async ({ page }) => {
    await page.goto(path);

    await expect(page.locator('html')).toHaveAttribute('lang', lang);

    if (lang === 'ar') {
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    }

    await expect(page).toHaveTitle(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
}
