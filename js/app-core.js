const isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
const isMobile = isTouchCapable || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

const prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

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
const iconMoon = document.querySelector('.icon-moon');
const iconSun = document.querySelector('.icon-sun');
const html = document.documentElement;

function ensureAnalyticsLoaded() {
    if (typeof window.drivarcEnsureAnalyticsLoaded === 'function') {
        try {
            window.drivarcEnsureAnalyticsLoaded();
        } catch (e) { }
    }
}

let analyticsLoadHandle = null;
let analyticsLoadArmed = false;

function activateDeferredStylesheet() {
    const siteStyles = document.getElementById('siteStyles');
    if (siteStyles && siteStyles.media !== 'all') {
        siteStyles.media = 'all';
    }
}

activateDeferredStylesheet();

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
    'en': { code: 'USD', locale: 'en-US' },
    'de': { code: 'EUR', locale: 'de-DE' },
    'ru': { code: 'RUB', locale: 'ru-RU' },
    'ar': { code: 'SAR', locale: 'ar-SA' },
    'zh': { code: '人民币', locale: 'zh-CN' }
};

function getCurrencyInfo() {
    const lang = document.documentElement.lang || 'tr';
    return currencyMapping[lang] || { code: 'USD', locale: 'en-US' };
}

if (isMobile) {
    html.classList.add('touch-device');
}

const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    html.setAttribute('data-theme', 'light');
    if (iconMoon) iconMoon.classList.add('is-hidden');
    if (iconSun) iconSun.classList.remove('is-hidden');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        if (iconMoon) iconMoon.classList.toggle('is-hidden', newTheme === 'light');
        if (iconSun) iconSun.classList.toggle('is-hidden', newTheme !== 'light');
        localStorage.setItem('theme', newTheme);
    });
}

const langToggle = document.querySelector('.lang-toggle');
const langDropdown = document.getElementById('langDropdown');

if (langToggle) {
    langToggle.addEventListener('click', (e) => { e.stopPropagation(); if (langDropdown) langDropdown.classList.toggle('open'); });
}
document.addEventListener('click', () => { if (langDropdown) langDropdown.classList.remove('open'); });
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

        dropdown.innerHTML = '';

        var search = document.createElement('input');
        search.type = 'text';
        search.className = 'lang-search';
        search.placeholder = 'Dil ara...';
        search.setAttribute('aria-label', 'Dil ara');
        dropdown.appendChild(search);

        var scroll = document.createElement('div');
        scroll.className = 'lang-scroll';
        dropdown.appendChild(scroll);

        // Replace flag emojis with language code badges
        options.forEach(function(opt) {
            var flag = opt.querySelector('.lang-flag');
            var code = opt.getAttribute('hreflang') || '';
            if (flag) {
                var badge = document.createElement('span');
                badge.className = 'lang-code-badge';
                badge.textContent = code.toUpperCase();
                flag.parentNode.replaceChild(badge, flag);
            }
        });

        // Hide toggle flag icon
        var toggleFlagIcon = document.querySelector('.lang-flag-icon');
        if (toggleFlagIcon) toggleFlagIcon.style.display = 'none';

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

        search.addEventListener('input', function() {
            var query = this.value.toLowerCase().trim();
            var headers = scroll.querySelectorAll('.lang-group-header');
            var items = scroll.querySelectorAll('.lang-option');
            var nr = scroll.querySelector('.lang-no-results');
            var anyVisible = false;

            items.forEach(function(item) {
                var text = (item.textContent || '').toLowerCase();
                var code = (item.getAttribute('hreflang') || '').toLowerCase();
                var matches = query === '' || text.indexOf(query) !== -1 || code.indexOf(query) !== -1;
                item.style.display = matches ? '' : 'none';
                if (matches) anyVisible = true;
            });

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
        });

        // Auto-focus search when dropdown opens
        var toggle = document.querySelector('.lang-toggle');
        if (toggle) {
            toggle.addEventListener('click', function() {
                setTimeout(function() {
                    search.focus();
                }, 50);
            });
        }

        // Keyboard navigation
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
                var next = Math.min(idx + 1, visible.length - 1);
                visible[next].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                var idx = visible.indexOf(document.activeElement);
                var prev = Math.max(idx - 1, 0);
                visible[prev].focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                dropdown.classList.remove('open');
                if (toggle) toggle.focus();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLangSearch);
    } else {
        initLangSearch();
    }
})();
