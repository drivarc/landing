(function() {
   var GA_ID = 'G-28CR3Y25R3';
   var GA_SRC = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
   var state = window.__drivarcAnalyticsState || (window.__drivarcAnalyticsState = {
     loaded: false,
     loading: false,
     promise: null
   });

   window.dataLayer = window.dataLayer || [];
   function gtag() { window.dataLayer.push(arguments); }
   window.gtag = gtag;

   function activateDeferredStylesheet() {
     var siteStyles = document.getElementById('siteStyles');
     if (siteStyles && siteStyles.media !== 'all') {
       siteStyles.media = 'all';
     }
   }

   activateDeferredStylesheet();

   gtag('consent', 'default', {
     analytics_storage: 'denied',
     ad_storage: 'denied',
     ad_user_data: 'denied',
     ad_personalization: 'denied',
     wait_for_update: 500,
     region: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'TR', 'GB', 'BR', 'KR']
   });

   function applyConfig() {
     gtag('js', new Date());
     gtag('config', GA_ID, {
       anonymize_ip: true,
       allow_google_signals: false
     });
     gtag('set', 'url_passthrough', true);
     gtag('set', 'ads_data_redaction', false);
   }

   function ensureLoaded() {
     if (state.loaded) return Promise.resolve(true);
     if (state.promise) return state.promise;

     state.loading = true;
     state.promise = new Promise(function(resolve) {
       applyConfig();

       var gaScript = document.createElement('script');
       gaScript.async = true;
       gaScript.src = GA_SRC;
       gaScript.onload = function() {
         state.loaded = true;
         state.loading = false;
         resolve(true);
       };
       gaScript.onerror = function() {
         state.loading = false;
         state.promise = null;
         resolve(false);
       };
       gaScript.timeout = 10000;

       (document.head || document.documentElement).appendChild(gaScript);
     });

     return state.promise;
   }

   window.drivarcEnsureAnalyticsLoaded = ensureLoaded;
   window.drivarcTrack = function(eventName, params) {
     window.gtag('event', eventName, params || {});
   };

   var webVitalsLoaded = false;
   function initWebVitals() {
     if (webVitalsLoaded) return;
     webVitalsLoaded = true;

     if (!window.PerformanceObserver) return;

     var vitals = ['CLS', 'FID', 'LCP', 'FCP', 'TTFB'];
     var perfData = {};

     function getBrowserPerformanceEntryTypes() {
       var types = {};
       try {
         if (window.PerformanceObserver && PerformanceObserver.getEntries) {
           var entries = PerformanceObserver.getEntries();
           entries.forEach(function(e) { types[e.entryType] = true; });
         }
       } catch(e) {}
       return types;
     }

     function reportWebVital(name, value, id) {
       if (window.gtag && state.loaded) {
         window.gtag('event', name, {
           event_category: 'Web Vitals',
           event_label: id,
           value: Math.round(name === 'CLS' ? value * 1000 : value),
           non_interaction: true
         });
       }
       if (window.console && window.console.log) {
         console.log('[Web Vitals] ' + name + ': ' + Math.round(value * 100) / 100 + ' (' + id + ')');
       }
     }

     try {
       var onCLS = new PerformanceObserver(function(entries) {
         entries.getEntries().forEach(function(entry) {
           if (!entry.hadRecentInput) {
             perfData.cls = entry.value;
             reportWebVital('CLS', entry.value, entry.id);
           }
         });
       });
       onCLS.observe({ type: 'layout-shift', buffered: true });

       var onLCP = new PerformanceObserver(function(entries) {
         var lastEntry = entries.getEntries()[entries.getEntries().length - 1];
         perfData.lcp = lastEntry.renderTime || lastEntry.startTime;
         reportWebVital('LCP', perfData.lcp, lastEntry.name);
       });
       onLCP.observe({ type: 'largest-contentful-paint', buffered: true });

       var onFCP = new PerformanceObserver(function(entries) {
         var fcpEntry = entries.getEntries().find(function(e) { return e.name === 'first-contentful-paint'; });
         if (fcpEntry) {
           perfData.fcp = fcpEntry.renderTime || fcpEntry.startTime;
           reportWebVital('FCP', perfData.fcp, fcpEntry.name);
         }
       });
       onFCP.observe({ type: 'paint', buffered: true });

       var onFID = new PerformanceObserver(function(entries) {
         var firstEntry = entries.getEntries()[0];
         if (firstEntry) {
           perfData.fid = firstEntry.processingStart - firstEntry.startTime;
           reportWebVital('FID', perfData.fid, firstEntry.name);
         }
       });
       onFID.observe({ type: 'first-input', buffered: true });

       var onTTFB = new PerformanceObserver(function(entries) {
         var ttfbEntry = entries.getEntries()[0];
         if (ttfbEntry) {
           perfData.ttfb = ttfbEntry.responseStart - ttfbEntry.requestStart;
           reportWebVital('TTFB', perfData.ttfb, ttfbEntry.name);
         }
       });
       onTTFB.observe({ type: 'navigation', buffered: true });

       window.__drivarcPerfData = perfData;
     } catch(e) {
       if (window.console && window.console.warn) {
         console.warn('[Web Vitals] Init failed:', e.message);
       }
     }
   }

   if (document.readyState === 'complete' || document.readyState === 'interactive') {
     initWebVitals();
   } else {
     window.addEventListener('load', initWebVitals);
   }

   window.__drivarcInitWebVitals = initWebVitals;
 })();

(function() {
   'use strict';

   var COOKIE_KEY = 'drivarc-cookie-consent';
   var CONSENT_COOKIE_NAME = 'cookie_policy';
   var CONSENT_COOKIE_DAYS = 365;
   var CONSENT_VERSION = '2';

   function readCookie(name) {
       var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
       return match ? decodeURIComponent(match[2]) : null;
   }

   function writeCookie(name, value, days) {
       var expires = '';
       if (days) {
           var date = new Date();
           date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
           expires = '; expires=' + date.toUTCString();
       }
       document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax; Secure';
   }

   function parseConsentCookie(value) {
       try {
           return JSON.parse(decodeURIComponent(value));
       } catch (e) {
           return null;
       }
   }

   function gtagConsentUpdate(granted) {
       function applyConsent() {
           if (typeof window.gtag === 'function') {
               window.gtag('consent', 'update', {
                   'ad_storage': granted ? 'granted' : 'denied',
                   'ad_user_data': granted ? 'granted' : 'denied',
                   'ad_personalization': granted ? 'granted' : 'denied',
                   'analytics_storage': granted ? 'granted' : 'denied'
               });
           } else {
               window.dataLayer.push({
                   'event': 'consent_update',
                   'ad_storage': granted ? 'granted' : 'denied',
                   'ad_user_data': granted ? 'granted' : 'denied',
                   'ad_personalization': granted ? 'granted' : 'denied',
                   'analytics_storage': granted ? 'granted' : 'denied'
               });
               setTimeout(applyConsent, 100);
           }
       }
       applyConsent();
   }

   function trackEvent(eventName, params) {
       if (typeof window.gtag === 'function') {
           window.gtag('event', eventName, params || {});
       } else {
           window.dataLayer.push({
               'event': eventName,
               ...params
           });
       }
   }

   function saveConsent(preferences) {
       try {
           localStorage.setItem(COOKIE_KEY, JSON.stringify(preferences));
       } catch (e) {
           console.warn('[CookieConsent] localStorage write failed:', e);
       }
       writeCookie(CONSENT_COOKIE_NAME, JSON.stringify(preferences), CONSENT_COOKIE_DAYS);
   }

   function readConsent() {
       try {
           var saved = localStorage.getItem(COOKIE_KEY);
           if (saved) {
               var prefs = JSON.parse(saved);
               if (prefs.version === CONSENT_VERSION) {
                   return prefs;
               }
           }
       } catch (e) { }

       var cookieVal = readCookie(CONSENT_COOKIE_NAME);
       if (cookieVal) {
           var prefs = parseConsentCookie(cookieVal);
           if (prefs && prefs.version === CONSENT_VERSION) {
               return prefs;
           }
       }
       return null;
   }

   function getPageLang() {
       var html = document.documentElement;
       return (html.getAttribute('lang') || 'tr').substring(0, 2);
   }

   function getPrivacyLink() {
       var lang = getPageLang();
       if (lang === 'tr') return 'privacy.html';
       return '../privacy.html';
   }

   function showBanner() {
       var banner = document.querySelector('.cookie-consent');
       var overlay = document.getElementById('cookieOverlay');
       if (banner) {
           var descLink = banner.querySelector('.cookie-consent-description a');
           if (descLink) {
               descLink.href = getPrivacyLink();
           }
           setTimeout(function() {
               banner.classList.add('show');
               if (overlay) overlay.classList.add('show');
           }, 1000);
       }
   }

   function hideBanner() {
       var banner = document.querySelector('.cookie-consent');
       var overlay = document.getElementById('cookieOverlay');
       if (banner) {
           banner.classList.remove('show');
           banner.classList.add('hide');
       }
       if (overlay) {
           overlay.classList.remove('show');
           overlay.classList.add('hide');
       }
   }

   function acceptAll() {
       var prefs = {
           version: CONSENT_VERSION,
           timestamp: new Date().toISOString(),
           necessary: true,
           analytics: true,
           marketing: false
       };
       saveConsent(prefs);
       ensureAnalyticsLoaded();
       gtagConsentUpdate(true);
       hideBanner();
       trackEvent('cookie_consent', { action: 'accept_all' });
   }

   function declineAll() {
       var prefs = {
           version: CONSENT_VERSION,
           timestamp: new Date().toISOString(),
           necessary: true,
           analytics: false,
           marketing: false
       };
       saveConsent(prefs);
       gtagConsentUpdate(false);
       hideBanner();
       trackEvent('cookie_consent', { action: 'decline_all' });
   }

   function openDeclineRepromptModal() {
       hideBanner();
       var modal = document.getElementById('declineRepromptModal');
       if (modal) {
           modal.classList.add('show');
       }
   }

   function closeDeclineRepromptModal() {
       var modal = document.getElementById('declineRepromptModal');
       if (modal) {
           modal.classList.remove('show');
       }
   }

   function declineConfirmed() {
       closeDeclineRepromptModal();
       declineAll();
   }

   function acceptInstead() {
       closeDeclineRepromptModal();
       acceptAll();
   }

   function openSettingsModal() {
       var modal = document.getElementById('cookieSettingsModal');
       if (modal) {
           var toggle = document.getElementById('cookieAnalyticsToggle');
           if (toggle) {
               toggle.checked = true;
           }
           modal.classList.add('show');
       }
   }

   function closeSettingsModal() {
       var modal = document.getElementById('cookieSettingsModal');
       if (modal) {
           modal.classList.remove('show');
       }
   }

   function saveModalSettings() {
       var toggle = document.getElementById('cookieAnalyticsToggle');
       var analyticsEnabled = toggle ? toggle.checked : false;
       var prefs = {
           version: CONSENT_VERSION,
           timestamp: new Date().toISOString(),
           necessary: true,
           analytics: analyticsEnabled,
           marketing: false
       };
       saveConsent(prefs);
       if (analyticsEnabled) {
           ensureAnalyticsLoaded();
       }
       gtagConsentUpdate(analyticsEnabled);
       closeSettingsModal();
       hideBanner();
       trackEvent('cookie_consent', {
           action: 'custom',
           analytics: analyticsEnabled
       });
   }

   function initStoreClickTracking() {
       var gpBtn = document.querySelector('[data-modal="beta"]');
       if (gpBtn) {
           gpBtn.addEventListener('click', function(e) {
               e.preventDefault();
               trackEvent('store_click', {
                   'store': 'google_play',
                   'page_language': getPageLang()
               });
               if (typeof window.openBetaModal === 'function') {
                   window.openBetaModal();
               }
           });
       }

       var asBtn = document.querySelector('[data-modal="appstore"]');
       if (asBtn) {
           asBtn.addEventListener('click', function(e) {
               e.preventDefault();
               trackEvent('store_click', {
                   'store': 'app_store',
                   'page_language': getPageLang()
               });
               var modal = document.getElementById('appStoreModal');
               if (modal) {
                   modal.style.display = 'flex';
                   requestAnimationFrame(function() { modal.classList.add('show'); });
               }
           });
       }
   }

   function addFooterCookieLink() {
       var footer = document.querySelector('.footer-inner, .site-footer');
       if (!footer) return;
       if (footer.querySelector('.cookie-preferences-link')) return;

       var link = document.createElement('a');
       link.href = '#';
       link.className = 'footer-link cookie-preferences-link';
       link.textContent = 'Cookie Preferences';
       link.setAttribute('data-cookie-preferences', 'true');

       var lang = getPageLang();
       var labels = {
           'tr': 'Çerez Tercihleri',
           'en': 'Cookie Preferences',
           'de': 'Cookie-Einstellungen',
           'zh': 'Cookie 设置',
           'ru': 'Настройки cookie',
           'ar': 'تفضيلات ملفات تعريف الارتباط'
       };
       link.textContent = labels[lang] || labels['en'];

       link.addEventListener('click', function(e) {
           e.preventDefault();
           openSettingsModal();
       });

       var footerLinks = footer.querySelector('.footer-links');
       if (footerLinks) {
           var socials = footerLinks.querySelector('.footer-socials');
           if (socials) {
               footerLinks.insertBefore(link, socials);
           } else {
               footerLinks.appendChild(link);
           }
       }
   }

   function applyRTLLayout() {
   }

   function init() {
       var prefs = readConsent();

       if (!prefs) {
           showBanner();
       } else {
           if (prefs.analytics) {
               gtagConsentUpdate(true);
               scheduleAnalyticsLoad();
           } else {
               gtagConsentUpdate(false);
           }
       }

       var acceptBtn = document.querySelector('.cookie-consent-btn.accept:not(.cookie-settings-save)');
       if (acceptBtn) acceptBtn.addEventListener('click', acceptAll);

       var declineBtn = document.querySelector('.cookie-consent-btn.decline:not(.cookie-settings-close)');
       if (declineBtn) declineBtn.addEventListener('click', function(e) {
           e.preventDefault();
           openDeclineRepromptModal();
       });

       var settingsBtn = document.querySelector('.cookie-consent-btn.settings');
       if (settingsBtn) settingsBtn.addEventListener('click', openSettingsModal);

       var closeBtn = document.querySelector('.cookie-settings-close');
       if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal);

       var saveBtn = document.querySelector('.cookie-settings-save');
       if (saveBtn) saveBtn.addEventListener('click', saveModalSettings);

       var declineConfirmedBtn = document.getElementById('declineConfirmed');
       if (declineConfirmedBtn) declineConfirmedBtn.addEventListener('click', declineConfirmed);

       var acceptInsteadBtn = document.getElementById('acceptInstead');
       if (acceptInsteadBtn) acceptInsteadBtn.addEventListener('click', acceptInstead);

       var cookieModal = document.getElementById('cookieSettingsModal');
       if (cookieModal) {
           cookieModal.addEventListener('click', function(e) {
               if (e.target === cookieModal) closeSettingsModal();
           });
       }

       var declineModal = document.getElementById('declineRepromptModal');
       if (declineModal) {
           declineModal.addEventListener('click', function(e) {
               if (e.target === declineModal) {
                   closeDeclineRepromptModal();
               }
           });
       }

       document.addEventListener('keydown', function(e) {
           if (e.key === 'Escape') {
               closeSettingsModal();
               closeDeclineRepromptModal();
           }
       });

       initStoreClickTracking();

       addFooterCookieLink();

       applyRTLLayout();
   }

   if (document.readyState === 'loading') {
       document.addEventListener('DOMContentLoaded', init);
   } else {
       init();
   }
 })();

// Auto-mark active language option based on <html lang="">
document.addEventListener('DOMContentLoaded', function() {
   try {
       var htmlLang = (document.documentElement.lang || '').toLowerCase().substring(0, 2);
       if (!htmlLang) return;

       document.querySelectorAll('.lang-option').forEach(function(opt) {
           var hreflangVal = opt.getAttribute('hreflang') ? String(opt.getAttribute('hreflang')).toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 2) : '';
           var isActive = hreflangVal === htmlLang;

           opt.setAttribute('data-hreflang-safe', hreflangVal);
           opt.addEventListener('click', function(e) {
               if (this.getAttribute('aria-disabled') === 'true') {
                   e.preventDefault();
                   e.stopPropagation();
               }
           });

           if (isActive) {
               opt.classList.add('active');
               opt.setAttribute('aria-current', 'page');
               opt.setAttribute('aria-disabled', 'true');
               opt.setAttribute('tabindex', '-1');
           } else {
               opt.classList.remove('active');
               opt.removeAttribute('aria-current');
               opt.removeAttribute('aria-disabled');
               opt.removeAttribute('tabindex');
           }
       });

       var currentOpt = document.querySelector('.lang-option[hreflang="' + htmlLang + '"]');
       var toggleFlag = document.querySelector('.lang-toggle .lang-flag-icon');
       var toggleCode = document.querySelector('.lang-toggle .lang-code-text');
       if (currentOpt && toggleFlag) {
           var flag = currentOpt.querySelector('.lang-flag');
           if (flag) toggleFlag.innerHTML = flag.innerHTML.trim();
           if (toggleCode) toggleCode.textContent = htmlLang.toUpperCase();
       }

       
       // Fix Windows flag emojis
       if (/Win|Windows/.test(navigator.platform || navigator.userAgent) && !/Firefox/.test(navigator.userAgent)) {
           var flagMap = {
               '🇹🇷': '1f1f9-1f1f7',
               '🇬🇧': '1f1e6-1f1e7',
               '🇩🇪': '1f1e9-1f1ea',
               '🇷🇺': '1f1f7-1f1fa',
               '🇸🇦': '1f1f8-1f1e6',
               '🇨🇳': '1f1e8-1f1f3'
           };
           document.querySelectorAll('.lang-flag, .lang-flag-icon').forEach(function(el) {
               var t = el.textContent.trim();
               if (flagMap[t]) {
                   el.innerHTML = '<img src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/' + flagMap[t] + '.svg" style="width:1.2em; height:1.2em; vertical-align:-0.15em; margin:0 4px;" alt="' + t + '">';
               }
           });
       }

   } catch (e) { /* ignore */ }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('[SW] Registered with scope:', registration.scope);
    }).catch(err => {
      console.log('[SW] Registration failed:', err);
    });
  });
}
