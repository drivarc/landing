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
        var settled = false;
        var timeoutId = window.setTimeout(function() {
          if (settled) return;
          settled = true;
          state.loading = false;
          state.promise = null;
          resolve(false);
        }, 10000);

        gaScript.async = true;
        gaScript.src = GA_SRC;
        gaScript.onload = function() {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          state.loaded = true;
          state.loading = false;
          resolve(true);
        };
        gaScript.onerror = function() {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          state.loading = false;
          state.promise = null;
          resolve(false);
        };

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

     var perfData = {};

     function reportWebVital(name, value, id) {
       if (window.gtag && state.loaded) {
         window.gtag('event', name, {
           event_category: 'Web Vitals',
           event_label: id,
           value: Math.round(name === 'CLS' ? value * 1000 : value),
           non_interaction: true
          });
        }
      }

      try {
        if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.indexOf('layout-shift') !== -1) {
          var onCLS = new PerformanceObserver(function(entries) {
            entries.getEntries().forEach(function(entry) {
              if (!entry.hadRecentInput) {
                perfData.cls = entry.value;
                reportWebVital('CLS', entry.value, entry.id);
              }
            });
          });
          onCLS.observe({ type: 'layout-shift', buffered: true });
        }

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
        if (window.console && typeof window.console.warn === 'function') {
          window.console.warn('Failed to initialize web vitals observers.', e);
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

   var DEFAULT_LANG = 'tr';
   var COOKIE_KEY = 'drivarc-cookie-consent';
   var CONSENT_COOKIE_NAME = 'cookie_policy';
   var CONSENT_COOKIE_DAYS = 365;
   var CONSENT_VERSION = '2';
   var CONSENT_RETRY_DELAY_MS = 100;

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
                setTimeout(applyConsent, CONSENT_RETRY_DELAY_MS);
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
                ...(params || {})
            });
        }
    }

   function saveConsent(preferences) {
       try {
           localStorage.setItem(COOKIE_KEY, JSON.stringify(preferences));
        } catch (e) {
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
       return (html.getAttribute('lang') || DEFAULT_LANG).substring(0, 2);
   }

   function getPrivacyLink() {
       return 'privacy.html';
   }

    function showBanner() {
        var banner = document.querySelector('.cookie-consent');
        var overlay = document.getElementById('cookieOverlay');
        if (banner) {
            setTimeout(function() {
                var descLink = banner.querySelector('.cookie-consent-description a');
                if (descLink) {
                    descLink.href = getPrivacyLink();
                }
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
        window.drivarcEnsureAnalyticsLoaded();
        gtagConsentUpdate(true);
        hideBanner();
        showToast('saved');
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
         showToast('declined');
         trackEvent('cookie_consent', { action: 'decline_all' });
     }

     function openSettingsModal() {
        var modal = document.getElementById('cookieSettingsModal');
        if (modal) {
            var toggle = document.getElementById('cookieAnalyticsToggle');
            if (toggle) {
                var prefs = readConsent();
                toggle.checked = prefs ? prefs.analytics : false;
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

    function showToast(msgKey) {
        var toast = document.getElementById('toast');
        var msgEl = document.getElementById('toast-msg-' + msgKey);
        if (!toast || !msgEl) return;
        var svgNS = 'http://www.w3.org/2000/svg';
        var icon = document.createElementNS(svgNS, 'svg');
        var path = document.createElementNS(svgNS, 'path');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('fill', 'currentColor');
        icon.setAttribute('width', '18');
        icon.setAttribute('height', '18');
        icon.setAttribute('aria-hidden', 'true');
        icon.style.flexShrink = '0';
        icon.style.verticalAlign = 'middle';
        path.setAttribute('d', msgKey === 'declined'
            ? 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
            : 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z');
        icon.appendChild(path);

        var message = document.createElement('span');
        message.textContent = msgEl.textContent || '';

        toast.textContent = '';
        toast.appendChild(icon);
        toast.appendChild(message);
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    function rejectAllSettings() {
        var prefs = {
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            necessary: true,
            analytics: false,
            marketing: false
        };
        saveConsent(prefs);
        gtagConsentUpdate(false);
        closeSettingsModal();
        hideBanner();
        showToast('declined');
        trackEvent('cookie_consent', { action: 'reject_all' });
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
        if (analyticsEnabled && typeof window.drivarcEnsureAnalyticsLoaded === 'function') {
            window.drivarcEnsureAnalyticsLoaded();
        }
        gtagConsentUpdate(analyticsEnabled);
        closeSettingsModal();
        hideBanner();
        showToast('saved');
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

        var existingLink = footer.querySelector('.cookie-preferences-link');
        var link;

        if (existingLink) {
            link = existingLink;
        } else {
            link = document.createElement('a');
            link.href = '#';
            link.className = 'footer-link cookie-preferences-link';
            link.setAttribute('data-cookie-preferences', 'true');

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

        // Text handled by i18n engine via data-i18n="footer.cookies_label"

        // Remove existing listener to avoid duplicates
        link.removeEventListener('click', link._cookieClickHandler);
        link._cookieClickHandler = function(e) {
            e.preventDefault();
            openSettingsModal();
        };
        link.addEventListener('click', link._cookieClickHandler);
    }

    function applyRTLLayout() {
    }

    function setupModalButtons() {
        var closeBtn = document.querySelector('.cookie-settings-close');
        if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal);

        var saveBtn = document.querySelector('.cookie-settings-save');
        if (saveBtn) saveBtn.addEventListener('click', saveModalSettings);

        var rejectBtn = document.querySelector('.cookie-consent-btn.reject-all');
        if (rejectBtn) rejectBtn.addEventListener('click', rejectAllSettings);

        var cookieModal = document.getElementById('cookieSettingsModal');
        if (cookieModal) {
            cookieModal.addEventListener('click', function(e) {
                if (e.target === cookieModal) closeSettingsModal();
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeSettingsModal();
            }
        });
    }

    function setupBannerButtons() {
        var acceptBtn = document.querySelector('.cookie-consent-btn.accept:not(.cookie-settings-save)');
        if (acceptBtn) acceptBtn.addEventListener('click', acceptAll);

        var declineBtn = document.querySelector('.cookie-consent-btn.decline:not(.cookie-settings-close)');
        if (declineBtn) declineBtn.addEventListener('click', function(e) {
            e.preventDefault();
            declineAll();
        });

        var settingsBtn = document.querySelector('.cookie-consent-btn.settings');
        if (settingsBtn) settingsBtn.addEventListener('click', openSettingsModal);
    }

    function init() {
        var prefs = readConsent();
        var currentPage = window.location.pathname;

        var skipPages = ['privacy.html', 'terms.html', '404.html', 'drivarc.html'];
        var isSkipPage = skipPages.some(function(page) {
            return currentPage.endsWith('/' + page) || currentPage === '/' + page;
        });

        if (isSkipPage) {
            if (prefs) {
                if (prefs.analytics) {
                    gtagConsentUpdate(true);
                    window.drivarcEnsureAnalyticsLoaded();
                } else {
                    gtagConsentUpdate(false);
                }
            }
            initStoreClickTracking();
            addFooterCookieLink();
            setupModalButtons();
            applyRTLLayout();
            return;
        }

        if (!prefs) {
            showBanner();
        } else {
            if (prefs.analytics) {
                gtagConsentUpdate(true);
                window.drivarcEnsureAnalyticsLoaded();
            } else {
                gtagConsentUpdate(false);
            }
        }

        setupBannerButtons();
        setupModalButtons();
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

        var toggleCode = document.querySelector('.lang-toggle .lang-code-text');
        if (toggleCode) toggleCode.textContent = htmlLang.toUpperCase();

       

   } catch (e) { /* ignore */ }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
    }).catch(() => {
    });
  });
}
