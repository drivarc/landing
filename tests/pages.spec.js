import { test, expect } from '@playwright/test';

const pages = [
  { path: '/privacy.html', title: 'Gizlilik Politikası' },
  { path: '/terms.html', title: 'Kullanım Şartları' },
  { path: '/404.html', title: '404' },
  { path: '/en/privacy.html', title: 'Privacy Policy' },
  { path: '/en/terms.html', title: 'Terms of Service' },
  { path: '/de/privacy.html', title: 'Datenschutzerklärung' },
  { path: '/de/terms.html', title: 'Nutzungsbedingungen' },
  { path: '/ru/privacy.html', title: 'Политика конфиденциальности' },
  { path: '/ru/terms.html', title: 'Условия использования' },
  { path: '/ar/privacy.html', title: 'سياسة الخصوصية' },
  { path: '/ar/terms.html', title: 'شروط الاستخدام' },
  { path: '/zh/privacy.html', title: '隐私政策' },
  { path: '/zh/terms.html', title: '服务条款' },
];

for (const { path, title } of pages) {
  test(`sayfa yükleniyor: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
}
