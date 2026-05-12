const isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
const isMobile = isTouchCapable || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
const supportsHoverInput = window.matchMedia
    ? window.matchMedia('(any-hover: hover)').matches || window.matchMedia('(hover: hover)').matches
    : !isTouchCapable;

const prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

function supportsCssFeature(property, value) {
    if (!window.CSS || typeof window.CSS.supports !== 'function') return true;

    try {
        return window.CSS.supports(property, value);
    } catch (error) {
        return false;
    }
}

const runtimeFeatureMatrix = {
    isTouchCapable: isTouchCapable,
    isMobile: isMobile,
    supportsHoverInput: supportsHoverInput,
    prefersReducedMotion: prefersReducedMotion,
    anyHover: window.matchMedia ? window.matchMedia('(any-hover: hover)').matches : false,
    hover: window.matchMedia ? window.matchMedia('(hover: hover)').matches : false,
    anyPointerCoarse: window.matchMedia ? window.matchMedia('(any-pointer: coarse)').matches : false,
    anyPointerFine: window.matchMedia ? window.matchMedia('(any-pointer: fine)').matches : false,
    supportsPointerEvents: 'PointerEvent' in window,
    supportsTransform3d: supportsCssFeature('transform', 'translate3d(0, 0, 0)'),
    supportsMaskImage: supportsCssFeature('mask-image', 'linear-gradient(black, transparent)') || supportsCssFeature('-webkit-mask-image', 'linear-gradient(black, transparent)'),
    supportsBackdropFilter: supportsCssFeature('backdrop-filter', 'blur(1px)') || supportsCssFeature('-webkit-backdrop-filter', 'blur(1px)'),
    supportsRequestAnimationFrame: typeof window.requestAnimationFrame === 'function',
    supportsResizeObserver: typeof window.ResizeObserver === 'function'
};

window.drivarcRuntimeFeatures = runtimeFeatureMatrix;

// Set CSS variables from data attributes
function setCssVarsFromData() {
    const elements = document.querySelectorAll('[data-delay], [data-x], [data-size], [data-drift]');
    elements.forEach(el => {
        const dataAttrs = ['delay', 'dur', 'x', 'y', 'size', 'drift'];
        dataAttrs.forEach(attr => {
            const value = el.dataset[attr];
            if (value !== undefined) {
                el.style.setProperty(`--${attr}`, value);
            }
        });
    });
}

// Call on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setCssVarsFromData);
} else {
    setCssVarsFromData();
}

const themeToggle = document.querySelector('.theme-toggle');
const themeDropdown = document.querySelector('.theme-dropdown');
const themeOptions = document.querySelectorAll('.theme-option');
const iconMoon = document.querySelector('.icon-moon');
const iconSun = document.querySelector('.icon-sun');
const iconSystem = document.querySelector('.icon-system');
const html = document.documentElement;
const themeMq = window.matchMedia('(prefers-color-scheme: dark)');

function getSystemTheme() {
    return themeMq.matches ? 'dark' : 'light';
}

function applyTheme(mode) {
    var resolvedTheme = mode === 'system' ? getSystemTheme() : mode;
    html.setAttribute('data-theme', resolvedTheme);
    localStorage.setItem('theme', mode);
    if (iconMoon) iconMoon.classList.toggle('is-hidden', resolvedTheme !== 'dark');
    if (iconSun) iconSun.classList.toggle('is-hidden', resolvedTheme !== 'light');
    if (iconSystem) iconSystem.classList.toggle('is-hidden', mode !== 'system');
}

function updateDropdownSelection(mode) {
    themeOptions.forEach(function(opt) {
        var isSelected = opt.getAttribute('data-theme-value') === mode;
        opt.classList.toggle('selected', isSelected);
        opt.setAttribute('aria-selected', isSelected);
    });
}

function openDropdown() {
    if (!themeDropdown) return;
    if (langDropdown) langDropdown.classList.remove('open');
    if (langToggle) langToggle.setAttribute('aria-expanded', 'false');
    var mode = localStorage.getItem('theme') || 'system';
    updateDropdownSelection(mode);
    themeDropdown.classList.add('open');
    if (themeToggle) themeToggle.setAttribute('aria-expanded', 'true');
}

function closeDropdown() {
    if (!themeDropdown) return;
    themeDropdown.classList.remove('open');
    if (themeToggle) themeToggle.setAttribute('aria-expanded', 'false');
}

function ensureAnalyticsLoaded() {
    if (typeof window.drivarcEnsureAnalyticsLoaded === 'function') {
        try {
            window.drivarcEnsureAnalyticsLoaded();
        } catch (e) { }
    }
}

let analyticsLoadHandle = null;
let analyticsLoadArmed = false;

function loadAnalyticsNow() {
    if (analyticsLoadHandle !== null) {
        window.clearTimeout(analyticsLoadHandle);
        analyticsLoadHandle = null;
    }

    analyticsLoadArmed = false;
    ensureAnalyticsLoaded();
}

function scheduleAnalyticsLoad() {
    if (analyticsLoadHandle !== null || analyticsLoadArmed) return;

    analyticsLoadArmed = true;

    const triggerAnalyticsLoad = () => {
        loadAnalyticsNow();
    };

    ['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach((eventName) => {
        window.addEventListener(eventName, triggerAnalyticsLoad, { once: true, passive: true });
    });

    analyticsLoadHandle = window.setTimeout(loadAnalyticsNow, 30000);
}

let webpSupportChecked = false;
let webpSupported = false;

function supportsWebp() {
    if (webpSupportChecked) return webpSupported;

    webpSupportChecked = true;

    try {
        const canvas = document.createElement('canvas');
        webpSupported = !!(canvas.getContext && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0);
    } catch (e) {
        webpSupported = false;
    }

    return webpSupported;
}

function shouldLoadAtaturkPortrait() {
    return window.matchMedia('(min-width: 1025px)').matches;
}

function getAtaturkPortraitSrc(ataturkPortrait) {
    if (!ataturkPortrait) return '';

    if (supportsWebp()) {
        return ataturkPortrait.dataset.srcWebp || ataturkPortrait.dataset.srcPng || '';
    }

    return ataturkPortrait.dataset.srcPng || ataturkPortrait.dataset.srcWebp || '';
}

// Para birimi haritasi: her dil için gösterilecek kod ve sayısal format locale
const currencyMapping = {
    'tr': { code: 'TL', locale: 'tr-TR' },
    'en': { code: '$', locale: 'en-US' },
    'de': { code: '€', locale: 'de-DE' },
    'fr': { code: '€', locale: 'fr-FR' },
    'es': { code: '€', locale: 'es-ES' },
    'pt': { code: '€', locale: 'pt-PT' },
    'it': { code: '€', locale: 'it-IT' },
    'nl': { code: '€', locale: 'nl-NL' },
    'pl': { code: 'zł', locale: 'pl-PL' },
    'sv': { code: 'kr', locale: 'sv-SE' },
    'no': { code: 'kr', locale: 'nb-NO' },
    'da': { code: 'kr', locale: 'da-DK' },
    'fi': { code: '€', locale: 'fi-FI' },
    'cs': { code: 'Kč', locale: 'cs-CZ' },
    'ro': { code: 'lei', locale: 'ro-RO' },
    'hu': { code: 'Ft', locale: 'hu-HU' },
    'el': { code: '€', locale: 'el-GR' },
    'uk': { code: '₴', locale: 'uk-UA' },
    'ru': { code: '₽', locale: 'ru-RU' },
    'ja': { code: '円', locale: 'ja-JP' },
    'ko': { code: '원', locale: 'ko-KR' },
    'zh': { code: '元', locale: 'zh-CN' },
    'hi': { code: '₹', locale: 'hi-IN' },
    'bn': { code: '৳', locale: 'bn-BD' },
    'th': { code: '฿', locale: 'th-TH' },
    'vi': { code: '₫', locale: 'vi-VN' },
    'id': { code: 'Rp', locale: 'id-ID' },
    'ar': { code: '﷼', locale: 'ar-SA' },
    'he': { code: '₪', locale: 'he-IL' }
};

function getCurrencyInfo() {
    const lang = document.documentElement.lang || 'tr';
    return currencyMapping[lang] || { code: 'USD', locale: 'en-US' };
}

if (!supportsHoverInput) {
    html.classList.add('touch-device');
}

var savedMode = localStorage.getItem('theme') || 'system';
applyTheme(savedMode);

themeMq.addEventListener('change', function() {
    var mode = localStorage.getItem('theme') || 'system';
    if (mode === 'system') {
        applyTheme('system');
    }
});

if (themeToggle) {
    themeToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        if (themeDropdown && themeDropdown.classList.contains('open')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });
}

themeOptions.forEach(function(opt) {
    opt.addEventListener('click', function(e) {
        e.stopPropagation();
        var value = opt.getAttribute('data-theme-value');
        applyTheme(value);
        closeDropdown();
    });
});

document.addEventListener('click', closeDropdown);

if (themeDropdown) {
    themeDropdown.addEventListener('click', function(e) { e.stopPropagation(); });
}

const langToggle = document.querySelector('.lang-toggle');
const langDropdown = document.getElementById('langDropdown');

  if (langToggle) {
      langToggle.setAttribute('aria-expanded', 'false');
      langToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          if (langDropdown) {
              langDropdown.classList.toggle('open');
              var isOpen = langDropdown.classList.contains('open');
              langToggle.setAttribute('aria-expanded', isOpen);
              if (isOpen) closeDropdown();
          }
      });
  }
 document.addEventListener('click', () => {
     if (langDropdown) {
         langDropdown.classList.remove('open');
         if (langToggle) langToggle.setAttribute('aria-expanded', 'false');
     }
 });
 if (langDropdown) langDropdown.addEventListener('click', (e) => e.stopPropagation());

const headerDownloadBtn = document.querySelector('.header-download-btn');
const headerDownloadDropdown = document.getElementById('headerDownloadDropdown');

if (headerDownloadBtn) {
    headerDownloadBtn.addEventListener('click', (e) => { e.stopPropagation(); if (headerDownloadDropdown) headerDownloadDropdown.classList.toggle('open'); });
}
document.addEventListener('click', () => { if (headerDownloadDropdown) headerDownloadDropdown.classList.remove('open'); });
if (headerDownloadDropdown) headerDownloadDropdown.addEventListener('click', (e) => e.stopPropagation());

 // Language search and region grouping
 (function() {
     var langRegions = {
         tr: 'Avrupa', en: 'Avrupa', de: 'Avrupa', fr: 'Avrupa',
         es: 'Avrupa', pt: 'Avrupa', it: 'Avrupa', nl: 'Avrupa',
         pl: 'Avrupa', sv: 'Avrupa', no: 'Avrupa', da: 'Avrupa',
         fi: 'Avrupa', cs: 'Avrupa', ro: 'Avrupa', hu: 'Avrupa',
         el: 'Avrupa', uk: 'Avrupa', ru: 'Avrupa',
         ja: 'Asya', ko: 'Asya', zh: 'Asya', hi: 'Asya',
         bn: 'Asya', th: 'Asya', vi: 'Asya', id: 'Asya',
         ar: 'Orta Do\u011fu', he: 'Orta Do\u011fu'
     };
     var regionOrder = ['Avrupa', 'Asya', 'Orta Do\u011fu'];

     function initLangSearch() {
         var dropdown = document.getElementById('langDropdown');
         if (!dropdown) return;
         var existing = dropdown.querySelector('.lang-search');
         if (existing) return;

         var options = Array.prototype.slice.call(dropdown.querySelectorAll('.lang-option'));
         if (options.length === 0) return;

     dropdown.setAttribute('role', 'listbox');
     dropdown.setAttribute('aria-label', 'Dil seçimi');

         // Use DocumentFragment for batch DOM operations
         var fragment = document.createDocumentFragment();

         var searchWrapper = document.createElement('div');
         searchWrapper.className = 'lang-search-wrapper';
         fragment.appendChild(searchWrapper);

         var searchIcon = document.createElement('span');
         searchIcon.className = 'lang-search-icon';
         searchIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
         searchWrapper.appendChild(searchIcon);

         var clearBtn = document.createElement('button');
         clearBtn.type = 'button';
         clearBtn.className = 'lang-search-clear';
         clearBtn.setAttribute('aria-label', 'Aramayı temizle');
         clearBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
         searchWrapper.appendChild(clearBtn);

 var search = document.createElement('input');
         search.type = 'text';
         search.className = 'lang-search';
         search.placeholder = '';
         search.setAttribute('aria-label', 'Dil ara');
         search.setAttribute('autocomplete', 'off');
         search.setAttribute('aria-controls', 'langDropdown');
         search.setAttribute('aria-autocomplete', 'list');
         searchWrapper.appendChild(search);

          var scroll = document.createElement('div');
          scroll.className = 'lang-scroll';
          fragment.appendChild(scroll);

          // Add ARIA attributes
          options.forEach(function(opt) {
              opt.setAttribute('role', 'option');
          });

         var grouped = {};
         options.forEach(function(opt) {
             var code = opt.getAttribute('hreflang');
             var region = langRegions[code] || 'Di\u011fer';
             if (!grouped[region]) grouped[region] = [];
             grouped[region].push(opt);
         });

         regionOrder.forEach(function(region) {
             var regionOptions = grouped[region];
             if (!regionOptions || regionOptions.length === 0) return;

             var header = document.createElement('div');
             header.className = 'lang-group-header';
             header.textContent = region;
             scroll.appendChild(header);

             regionOptions.forEach(function(opt) {
                 scroll.appendChild(opt);
             });
         });

         var noResults = document.createElement('div');
         noResults.className = 'lang-no-results';
         noResults.textContent = 'Dil bulunamad\u0131';
         scroll.appendChild(noResults);

         // Append all at once for performance
         dropdown.appendChild(fragment);

         // Debounce function
         function debounce(func, wait) {
             var timeout;
             return function executedFunction(...args) {
                 var later = function() {
                     clearTimeout(timeout);
                     func(...args);
                 };
                 clearTimeout(timeout);
                 timeout = setTimeout(later, wait);
             };
         }

         // Filter languages
         function filterLangs(query) {
             var headers = scroll.querySelectorAll('.lang-group-header');
             var items = scroll.querySelectorAll('.lang-option');
             var nr = scroll.querySelector('.lang-no-results');
             var visibleCount = 0;

             requestAnimationFrame(function() {
                 items.forEach(function(item) {
                     var text = (item.textContent || '').toLowerCase();
                     var code = (item.getAttribute('hreflang') || '').toLowerCase();
                     var matches = query === '' || text.indexOf(query) !== -1 || code.indexOf(query) !== -1;
                     item.style.display = matches ? '' : 'none';
                     item.setAttribute('aria-selected', matches && item.classList.contains('active'));
                     if (matches) visibleCount++;
                 });

                 var anyVisible = visibleCount > 0;

                 headers.forEach(function(header) {
                     var next = header.nextElementSibling;
                     var hasVisible = false;
                     while (next && !next.classList.contains('lang-group-header')) {
                         if (next.classList.contains('lang-option') && next.style.display !== 'none') {
                             hasVisible = true;
                             break;
                         }
                         next = next.nextElementSibling;
                     }
                     header.style.display = hasVisible ? '' : 'none';
                 });

                 if (nr) {
                     nr.classList.toggle('show', !anyVisible && query !== '');
                 }

                 // Announce to screen readers
                 if (liveRegion) {
                     if (query === '') {
                         liveRegion.textContent = '';
                     } else if (visibleCount === 0) {
                         liveRegion.textContent = 'Dil bulunamadı';
                     } else {
                         liveRegion.textContent = visibleCount + ' dil bulundu';
                     }
                 }
             });
         }

         var searchHandler = debounce(function() {
             filterLangs(search.value.toLowerCase().trim());
         }, 300);

         search.addEventListener('input', searchHandler);

         // Clear button functionality
         clearBtn.addEventListener('click', function() {
             search.value = '';
             filterLangs('');
             clearBtn.classList.remove('show');
             search.focus();
         });

         search.addEventListener('input', function() {
             clearBtn.classList.toggle('show', this.value.length > 0);
         });

         // Set initial active state
         var activeOption = scroll.querySelector('.lang-option.active');
         if (activeOption) {
             activeOption.setAttribute('aria-selected', 'true');
         }

         // Add aria-live region for screen reader announcements
         var liveRegion = document.createElement('div');
         liveRegion.setAttribute('aria-live', 'polite');
         liveRegion.setAttribute('aria-atomic', 'true');
         liveRegion.className = 'sr-only';
         liveRegion.style.position = 'absolute';
         liveRegion.style.width = '1px';
         liveRegion.style.height = '1px';
         liveRegion.style.padding = '0';
         liveRegion.style.margin = '-1px';
         liveRegion.style.overflow = 'hidden';
         liveRegion.style.clip = 'rect(0,0,0,0)';
         liveRegion.style.whiteSpace = 'nowrap';
         liveRegion.style.border = '0';
         fragment.appendChild(liveRegion);

          // Auto-focus search when dropdown opens
          var toggle = document.querySelector('.lang-toggle');
          if (toggle) {
              toggle.addEventListener('click', function() {
                  setTimeout(function() {
                      // Only focus if dropdown is now open
                      if (dropdown.classList.contains('open')) {
                          requestAnimationFrame(function() {
                              search.focus();
                              searchHandler(); // Trigger search to ensure all options visible
                          });
                      }
                  }, 50);
              });
          }

          // Keyboard navigation for options when they have focus
          scroll.addEventListener('keydown', function(e) {
              if (!e.target.classList.contains('lang-option')) return;

              var visible = [];
              var all = scroll.querySelectorAll('.lang-option');
              for (var i = 0; i < all.length; i++) {
                  if (all[i].style.display !== 'none') visible.push(all[i]);
              }
              if (visible.length === 0) return;

              var current = e.target;
              var idx = visible.indexOf(current);

              if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  var next = idx < visible.length - 1 ? idx + 1 : 0;
                  visible[next].focus();
                  visible[next].scrollIntoView({ block: 'nearest' });
                  liveRegion.textContent = visible[next].textContent + ' dil seçeneği seçildi';
              } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  var prev = idx > 0 ? idx - 1 : visible.length - 1;
                  visible[prev].focus();
                  visible[prev].scrollIntoView({ block: 'nearest' });
                  liveRegion.textContent = visible[prev].textContent + ' dil seçeneği seçildi';
              } else if (e.key === 'Enter') {
                  e.preventDefault();
                  current.click();
                  dropdown.classList.remove('open');
                  if (toggle) {
                      toggle.setAttribute('aria-expanded', 'false');
                      toggle.focus();
                  }
              } else if (e.key === 'Escape') {
                  e.preventDefault();
                  dropdown.classList.remove('open');
                  if (toggle) {
                      toggle.setAttribute('aria-expanded', 'false');
                      toggle.focus();
                  }
              }
          });

         // Keyboard navigation with cyclic movement
         search.addEventListener('keydown', function(e) {
             var visible = [];
             var all = scroll.querySelectorAll('.lang-option');
             for (var i = 0; i < all.length; i++) {
                 if (all[i].style.display !== 'none') visible.push(all[i]);
             }
             if (visible.length === 0) return;

             if (e.key === 'ArrowDown') {
                 e.preventDefault();
                 var idx = visible.indexOf(document.activeElement);
                 var next = idx < visible.length - 1 ? idx + 1 : 0;
                 visible[next].focus();
                 visible[next].scrollIntoView({ block: 'nearest' });
                 liveRegion.textContent = visible[next].textContent + ' dil seçeneği seçildi';
             } else if (e.key === 'ArrowUp') {
                 e.preventDefault();
                 var idx = visible.indexOf(document.activeElement);
                 var prev = idx > 0 ? idx - 1 : visible.length - 1;
                 visible[prev].focus();
                 visible[prev].scrollIntoView({ block: 'nearest' });
                 liveRegion.textContent = visible[prev].textContent + ' dil seçeneği seçildi';
             } else if (e.key === 'Enter') {
                 e.preventDefault();
                 if (document.activeElement.classList.contains('lang-option')) {
                     document.activeElement.click();
                     dropdown.classList.remove('open');
                     if (toggle) toggle.setAttribute('aria-expanded', 'false');
                     toggle.focus();
                 }
             } else if (e.key === 'Escape') {
                 e.preventDefault();
                 dropdown.classList.remove('open');
                 if (toggle) {
                     toggle.setAttribute('aria-expanded', 'false');
                     toggle.focus();
                 }
             }
         });

          // Handle option selection
          scroll.addEventListener('click', function(e) {
              var option = e.target.closest('.lang-option');
              if (option) {
                  // Remove active from all
                  options.forEach(function(opt) {
                      opt.classList.remove('active');
                      opt.setAttribute('aria-selected', 'false');
                  });
                  option.classList.add('active');
                  option.setAttribute('aria-selected', 'true');
                  // Close dropdown
                  dropdown.classList.remove('open');
                  if (toggle) {
                      toggle.setAttribute('aria-expanded', 'false');
                  }
              }
          });
     }

     if (document.readyState === 'loading') {
         document.addEventListener('DOMContentLoaded', initLangSearch);
     } else {
         initLangSearch();
     }
 })();
