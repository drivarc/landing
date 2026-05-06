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
