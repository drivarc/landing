# Güvenlik Politikası

Drivarc, güvenlik ve kullanıcı verilerinin korunmasını önceliğimiz olarak belirler. Bu belge, güvenlik sorunlarını nasıl bildirebileceğinizi ve yanıt sürecimizi açıklar.

## Kapsam ve Desteklenen Varlıklar
Bu politika aşağıdaki varlıkları kapsar:
- `drivarc.com` ve ilgili alt alan adları
- Bu depodaki kaynak kodları, yapılandırma dosyaları ve statik asset'ler
- DNS, SSL/TLS ve CDN altyapı ayarları (Cloudflare/GitHub Pages)

*Not: Bu bir statik web sitesi projesidir. Sürüm bazlı destek yerine, `main` dalı ve aktif production ortamı güvenlik güncellemeleriyle sürekli korunmaktadır.*

## Güvenlik Yüzeyi ve Koruma Önlemleri
Bu proje statik olduğu için güvenlik incelemeleri özellikle şu alanlara odaklanmalıdır:
- İstemci tarafı HTML/CSS/JS ve i18n JSON çıktıları
- Service Worker önbelleği ve PWA asset'leri
- CDN/GitHub Pages dağıtımı ve önbellek davranışı
- Üçüncü taraf script ve bağlantılar (ör. analiz/etiketleme servisleri)
- Tarayıcı güvenlik başlıkları ve politikaları: Content-Security-Policy, Referrer-Policy, X-Content-Type-Options, Cross-Origin-Opener-Policy, Cross-Origin-Embedder-Policy ve Permissions-Policy

## Güvenlik Açığı Bildirme
Güvenlikle ilgili bir sorun tespit ederseniz, lütfen bunu herkese açık issue veya discussion üzerinden **paylaşmayınız**. Bunun yerine:
1. Bize şu adresten ulaşın: [contact@drivarc.com](mailto:contact@drivarc.com)
2. E-posta konusuna: `[SECURITY] Kısa Açıklama` yazınız.
3. Açığın nasıl tetiklendiğini, potansiyel etkisini ve tekrarlanabilir adımlarını net şekilde belirtiniz.
4. Mümkünse etkilenen sayfayı, dil klasörünü, tarayıcı sürümünü, ekran görüntüsünü ve ilgili log/kaynak parçalarını ekleyiniz.
5. Canlı kullanıcı verisi, çerez, token, API anahtarı veya başka gizli bilgi içeren örnekleri maskeleyiniz.

## Yanıt ve Süreç
- **İlk Yanıt:** Bildiriminiz alındıktan sonra en geç **48 saat** içinde dönüş yapılacaktır.
- **Değerlendirme:** Açık teknik olarak kabul edilir veya reddedilirse gerekçesi ile bildirilir.
- **Düzeltme:** Kritik açıklar için en kısa sürede (genellikle 7-14 gün içinde) düzeltme yayınlanır ve ilgili commit/pull request referans verilir.
- **Açık Etme (Disclosure):** Düzeltilene kadar lütfen sorunu kamuya açık etmeyiniz. Düzeltilen açıklar, güncelleme notları veya depo geçmişinde şeffaf şekilde duyurulur.

## Sorumlu Açık Tespit (Responsible Disclosure)
- Yetkisiz erişim, veri silme/değiştirme, hizmet reddi (DoS) veya kullanıcı verilerine zarar verme girişimleri bu politika kapsamı dışındadır.
- Tespit edilen açıkların sadece doğrulama ve raporlama amacıyla kullanılması rica olunur.
- Yasal sınırlar çerçevesinde hareket eden güvenlik araştırmacıları için "Safe Harbor" (Güvenli Liman) ilkeleri geçerlidir.
- Service Worker, cache veya lokalize sayfalarla ilgili bulgular için mümkünse hard refresh sonrası davranışı da not ediniz.

## İletişim
Güvenlik bildirimleri için tek resmi kanal: [contact@drivarc.com](mailto:contact@drivarc.com)  
*(İlerleyen aşamalarda `security@drivarc.com` alias'ı aktif edilebilir.)*

---
*Bu belge, güvenlik standartlarını ve iletişim süreçlerini iyileştirmek amacıyla zaman zaman güncellenebilir.*
