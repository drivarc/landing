# Deployment Guide (DLanding)

Bu rehber sitenin statik dosya sunucularına veya CDN/hosting servislerine (GitHub Pages, Netlify, Vercel, Cloudflare vb.) nasıl dağıtılacağını içerir.

## Ön Gereksinimler
- Proje hiçbir build adımına ihtiyaç duymaz (saf statik).
- Tüm dosyaları ve klasör yapısını kök dizine göndererek deplo edilebilir.

## Dağıtım Seçenekleri

### 1. GitHub Pages (Tavsiye Edilen)
Mevcut depo `main` veya `master` dalında güncellendiğinde GitHub Actions `.github/workflows/deploy.yml` üzerinden otomatik yayın alır.

### 2. Vercel veya Netlify
Ekstra yapılandırmaya gerek yoktur:
- **Build Command:** (Boş bırakın)
- **Output Directory:** `.` (kök dizin) veya boş bırakın.

## Deploy Kontrol Listesi (Pre-Flight)
- [ ] Yeni diller için `sitemap.xml` ve `index.html` linklerini güncelle.
- [ ] `manifest.json` ikonları sunucuda bulunuyor mu? (Örn. `icons/` çalışıyor mu?)
- [ ] Servis worker dosyası `sw.js` root dizininde güncel mi?
- [ ] `robots.txt` tarama izinleri (prod modunda `Allow` mu) kontrol et.
- [ ] `CHANGELOG.md`'ye sürüm sürüm numarasını gir.

### Geri Alma (Rollback)
Eğer PWA önbelleği (Service Worker) eski bir sürümü sunmaya devam ediyorsa, sürüm güncellemeleri için `sw.js` cache isimlerini değiştirmeniz gerekmektedir (Örn: `dlanding-cache-v2`).
