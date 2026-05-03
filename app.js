const isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
const isMobile = isTouchCapable || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

const prefersReducedMotion = false;

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

// Para birimi haritası: her dil için gösterilecek kod ve sayısal format locale
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

const betaModal = document.getElementById('betaModal');
function openBetaModal() {
    if (!betaModal) return;
    betaModal.style.display = 'flex';
    requestAnimationFrame(() => betaModal.classList.add('show'));
}
function closeBetaModal() {
    if (!betaModal) return;
    betaModal.classList.remove('show');
    setTimeout(() => betaModal.style.display = 'none', 300);
}

const appStoreModal = document.getElementById('appStoreModal');
function openAppStoreModal() {
    if (!appStoreModal) return;
    appStoreModal.style.display = 'flex';
    requestAnimationFrame(() => appStoreModal.classList.add('show'));
}
function closeAppStoreModal() {
    if (!appStoreModal) return;
    appStoreModal.classList.remove('show');
    setTimeout(() => appStoreModal.style.display = 'none', 300);
}

const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
    if (!scrollProgress) return;

    if (isMobile) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';
        return;
    }

    if (allSectionsExist && sectionIds.length > 0) {
        const totalSections = sectionIds.length;
        const currentSection = getCurrentSectionIndex();
        const progress = totalSections > 1 ? (currentSection / (totalSections - 1)) * 100 : 0;
        scrollProgress.style.width = progress + '%';
        return;
    }

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
}

const gridBg = document.querySelector('.grid-background');
function updateGridParallax(e) {
    if (!gridBg || prefersReducedMotion) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    gridBg.style.transform = `translate(${x}px, ${y}px)`;
}

function createRipple(event) {
    if (prefersReducedMotion || isMobile) return;
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = diameter + 'px';
    circle.style.left = (event.clientX - rect.left - radius) + 'px';
    circle.style.top = (event.clientY - rect.top - radius) + 'px';
    circle.classList.add('ripple');

    const existing = button.querySelector('.ripple');
    if (existing) existing.remove();

    button.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
}

document.querySelectorAll('.btn-google-play, .btn-app-store, .btn-faq-cta, .btn-primary').forEach(btn => {
    btn.addEventListener('click', createRipple);
});

function initPhone3D() {
    const heroSection = document.getElementById('hero');
    const phone = document.querySelector('.phone');

    if (isMobile || !heroSection || !phone || prefersReducedMotion) return;

    let isMouseOverHero = false;
    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function animate() {
        currentX = lerp(currentX, targetX, 0.08);
        currentY = lerp(currentY, targetY, 0.08);

        if (isMouseOverHero) {
            phone.style.animation = 'none';
            phone.style.transform = `rotateY(${currentY}deg) rotateX(${currentX}deg)`;
        } else {
            phone.style.transform = '';
            phone.style.animation = '';
        }

        rafId = requestAnimationFrame(animate);
    }

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = ((e.clientX - centerX) / (rect.width / 2));
        const mouseY = ((e.clientY - centerY) / (rect.height / 2));

        const maxRotX = mouseY * -15; // Invert Y axis
        const maxRotY = mouseX * 15;

        targetX = maxRotX;
        targetY = maxRotY;
        isMouseOverHero = true;
    });

    heroSection.addEventListener('mouseleave', () => {
        isMouseOverHero = false;
        targetX = 0;
        targetY = 0;
    });

    rafId = requestAnimationFrame(animate);
}

function animateCounter(element, target, duration = 1500) {
    const currencyInfo = getCurrencyInfo();
    if (prefersReducedMotion) {
        element.textContent = target.toLocaleString(currencyInfo.locale) + ' ' + currencyInfo.code;
        return;
    }

    const start = 0;
    const startTime = performance.now();

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const currentValue = Math.round(start + (target - start) * easedProgress);

        element.textContent = currentValue.toLocaleString(currencyInfo.locale) + ' ' + currencyInfo.code;
        element.classList.add('counting');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('counting');
        }
    }

    requestAnimationFrame(update);
}

const financeTotal = document.querySelector('.finance-total');
if (financeTotal) {
    const targetValue = 14150;
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target, targetValue);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counterObserver.observe(financeTotal);
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const el = entry.target;

            if (!prefersReducedMotion && !isMobile) {
                el.style.willChange = 'opacity, transform';

                let timeoutId = null;
                function cleanup(e) {
                    if (!e || e.propertyName === 'opacity' || e.propertyName === 'transform' || e.propertyName === 'box-shadow') {
                        try { el.style.willChange = ''; } catch (err) {}
                        el.removeEventListener('transitionend', cleanup);
                        if (timeoutId) clearTimeout(timeoutId);
                    }
                }

                el.addEventListener('transitionend', cleanup);
                timeoutId = setTimeout(() => cleanup(), 1000);
            }

            el.classList.add('visible');
            observer.unobserve(el);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll, .problem-card, .feature-card, .faq-item').forEach((el) => {
    observer.observe(el);
});

document.querySelectorAll('.problem-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.15}s`;
});
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

document.querySelectorAll('.faq-item').forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.08}s`;
});

const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const sectionIds = ['hero', 'features', 'problems', 'faq'];

const allSectionsExist = sectionIds.every(id => document.getElementById(id));

let currentSectionIndex = 0;
let isScrolling = false;
let scrollUnlockTimeout = null;
const SCROLL_COOLDOWN = isMobile ? 350 : 800; // ms (shorter cooldown on touch/mobile devices)

function getCurrentSectionIndex() {
    if (!allSectionsExist) return 0;
    let index = 0;
    for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2) {
                index = i;
                break;
            }
        }
    }
    return index;
}

const logoLink = document.querySelector('.logo');
const scrollLockTargets = [document.querySelector('.nav'), logoLink].filter(Boolean);

function setHeaderScrollLocked(isLocked) {
    scrollLockTargets.forEach((element) => {
        element.style.pointerEvents = isLocked ? 'none' : '';
        element.style.cursor = isLocked ? 'progress' : '';
    });
}

function unlockScrolling() {
    if (scrollUnlockTimeout) {
        clearTimeout(scrollUnlockTimeout);
        scrollUnlockTimeout = null;
    }

    isScrolling = false;
    setHeaderScrollLocked(false);
}

function scheduleScrollUnlock() {
    if (scrollUnlockTimeout) {
        clearTimeout(scrollUnlockTimeout);
    }

    const unlock = () => {
        if (!isScrolling) return;
        unlockScrolling();
    };

    if ('onscrollend' in window) {
        const onScrollEnd = () => {
            window.removeEventListener('scrollend', onScrollEnd);
            unlock();
        };

        window.addEventListener('scrollend', onScrollEnd, { once: true });
        scrollUnlockTimeout = setTimeout(() => {
            window.removeEventListener('scrollend', onScrollEnd);
            unlock();
        }, SCROLL_COOLDOWN + 250);
        return;
    }

    scrollUnlockTimeout = setTimeout(unlock, SCROLL_COOLDOWN);
}

if (logoLink) {
    logoLink.addEventListener('click', (e) => {
        if (allSectionsExist && !isScrolling) {
            e.preventDefault();
            scrollToSection(0);
        } else if (isScrolling) {
            e.preventDefault();
        }
    });
}

if (allSectionsExist) {

currentSectionIndex = getCurrentSectionIndex();

function scrollToSection(index, options = {}) {
    const { updateHistory = false } = options;

    if (index < 0 || index >= sectionIds.length) return;

    if (isScrolling) return;

    isScrolling = true;
    setHeaderScrollLocked(true);
    currentSectionIndex = index;

    const section = document.getElementById(sectionIds[index]);
    if (!section) {
        unlockScrolling();
        return;
    }

    if (updateHistory) {
        history.pushState(null, null, `#${sectionIds[index]}`);
    }

    updateSectionVisibility(index);

    setTimeout(() => {
        const targetY = section.getBoundingClientRect().top + window.pageYOffset;
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        const duration = 600; // js tabanlı akıcı scroll

        if (distance === 0) return;

        let startTime = null;
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            let progress = Math.min(timeElapsed / duration, 1);
            
            const ease = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startY + (distance * ease));

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        requestAnimationFrame(animation);
    }, 10);

    updateActiveNavLink();
    updateFooterVisibility();
    updateScrollProgress(); // Progress bar'ı güncelle

    scheduleScrollUnlock();
}

function updateSectionVisibility(activeIndex) {
    sectionIds.forEach((id, index) => {
        const section = document.getElementById(id);
        if (!section) return;

        if (index === activeIndex) {
            section.classList.add('section-active');
        } else {
            section.classList.remove('section-active');
        }
    });
}

let wheelAccumulator = 0;
const WHEEL_THRESHOLD = 50;
let isMouseButtonDown = false;

window.addEventListener('mousedown', (e) => { 
    isMouseButtonDown = true; 
    if (e.button === 1) e.preventDefault(); // Orta tıklama autoscroll engelle
});
window.addEventListener('mouseup', () => { isMouseButtonDown = false; });

if (allSectionsExist) {
    if (!isMobile) {
        window.addEventListener('wheel', (e) => {
            e.preventDefault();

            if (isMouseButtonDown) return;
            if (isScrolling) return;

            wheelAccumulator += e.deltaY;

            if (Math.abs(wheelAccumulator) >= WHEEL_THRESHOLD) {
                if (wheelAccumulator > 0) {
                    scrollToSection(currentSectionIndex + 1);
                } else {
                    scrollToSection(currentSectionIndex - 1);
                }
                wheelAccumulator = 0;
            }
        }, { passive: false });
    }

    if (!isMobile) {
        let touchStartY = 0;
        let touchEndY = 0;
        const TOUCH_THRESHOLD = 50;

        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (isScrolling) return;
            touchEndY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', () => {
            if (isScrolling) return;

            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) >= TOUCH_THRESHOLD) {
                if (diff > 0) {
                    scrollToSection(currentSectionIndex + 1);
                } else {
                    scrollToSection(currentSectionIndex - 1);
                }
            }

            touchStartY = 0;
            touchEndY = 0;
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                if (isScrolling) return;

                const sectionId = href.substring(1);
                const index = sectionIds.indexOf(sectionId);
                if (index !== -1) {
                    scrollToSection(index, { updateHistory: true });
                }
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        if (isScrolling) return;

        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.isContentEditable)) {
            return;
        }

        const key = e.key;

        if (key === 'ArrowDown' || key === 'PageDown') {
            e.preventDefault();
            scrollToSection(currentSectionIndex + 1);
        }
        else if (key === 'ArrowUp' || key === 'PageUp') {
            e.preventDefault();
            scrollToSection(currentSectionIndex - 1);
        }
        else if (key === 'Home') {
            e.preventDefault();
            scrollToSection(0);
        }
        else if (key === 'End') {
            e.preventDefault();
            scrollToSection(sectionIds.length - 1);
        }
    });
}

function updateActiveNavLink() {
    const currentId = sectionIds[currentSectionIndex];

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === `#${currentId}`;
        link.classList.toggle('active', isActive);
    });
}

function updateFooterVisibility() {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;
    
    if (isMobile) {
        footer.classList.add('visible');
        return;
    }
    
    const isFaqSection = currentSectionIndex === 3;
    footer.classList.toggle('visible', isFaqSection);
}

currentSectionIndex = getCurrentSectionIndex();
updateActiveNavLink();
updateFooterVisibility();

updateSectionVisibility(currentSectionIndex);

} // end if (allSectionsExist)

document.addEventListener('click', (e) => {
    const faqBtn = e.target.closest('.faq-question');
    if (faqBtn) {
        const item = faqBtn.parentElement;
        const wasActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item.active').forEach(i => i.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
        return;
    }

    const modalOpenBtn = e.target.closest('[data-modal]');
    if (modalOpenBtn) {
        e.preventDefault();
        const modalType = modalOpenBtn.getAttribute('data-modal');
        if (modalType === 'beta') openBetaModal();
        else if (modalType === 'appstore') openAppStoreModal();
        return;
    }

    const modalCloseBtn = e.target.closest('[data-close-modal]');
    if (modalCloseBtn) {
        const modalType = modalCloseBtn.getAttribute('data-close-modal');
        if (modalType === 'beta') closeBetaModal();
        else if (modalType === 'appstore') closeAppStoreModal();
        return;
    }

    const modalOverlay = e.target.closest('.beta-modal-overlay');
    if (modalOverlay) {
        const overlayId = modalOverlay.id;
        if (overlayId === 'betaModal') closeBetaModal();
        else if (overlayId === 'appStoreModal') closeAppStoreModal();
    }
});

function openLegalModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('show'));
}

function closeLegalModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

function openTermsModal() { openLegalModal('termsModal'); }
function openPrivacyModal() { openLegalModal('privacyModal'); }

function initAnimations() {
    initPhone3D();

    if (!prefersReducedMotion) {
        window.addEventListener('mousemove', updateGridParallax);
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    updateScrollProgress();
}

function showHolidayText() {
    const holidayText = document.getElementById('zaferText');
    const ataturkPortrait = document.getElementById('ataturkPortrait');
    const headerInner = document.querySelector('.header-inner');
    const footerHoliday = document.getElementById('footerHoliday');

    if (!holidayText) return;

    const htmlLang = document.documentElement.lang;
    if (htmlLang !== 'tr') {
        holidayText.classList.add('is-hidden');
        if (footerHoliday) footerHoliday.classList.add('is-hidden');
        return;
    }

    const holidays = [
        { name: '23 Nisan', message: '23 Nisan Ulusal Egemenlik ve<br>Çocuk Bayramımız Kutlu Olsun!' },
        { name: '19 Mayıs', message: '19 Mayıs Atatürk\'ü Anma, Gençlik ve<br>Spor Bayramımız Kutlu Olsun!', showAtaturk: true },
        { name: '30 Ağustos', message: '30 Ağustos Zafer Bayramımız<br>Kutlu Olsun!' },
        { name: '29 Ekim', message: '29 Ekim Cumhuriyet Bayramımız<br>Kutlu Olsun!' }
    ];

    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate(); // 1-31
    const hours = now.getHours(); // 0-23

    let holiday = null;

    if (month === 3 && day === 23) {
        holiday = holidays[0];
    }
    else if (month === 4 && day === 19) {
        holiday = holidays[1];
    }
    else if (month === 7 && day === 30) {
        holiday = holidays[2];
    }
    else if (
        (month === 9 && day === 29 && hours >= 13) ||
        (month === 9 && day === 30 && hours < 13)
    ) {
        holiday = holidays[3];
    }

    if (holiday) {
        holidayText.innerHTML = holiday.message;
        holidayText.classList.remove('is-hidden');

        if (footerHoliday) footerHoliday.classList.remove('is-hidden');

        if (holiday.showAtaturk && ataturkPortrait && shouldLoadAtaturkPortrait()) {
            var ataturkSrc = getAtaturkPortraitSrc(ataturkPortrait);
            if (ataturkSrc && ataturkPortrait.getAttribute('src') !== ataturkSrc) {
                ataturkPortrait.src = ataturkSrc;
            }
            ataturkPortrait.classList.remove('is-hidden');
            ataturkPortrait.style.display = 'block';
            headerInner.classList.add('has-ataturk');
        } else {
            ataturkPortrait.classList.add('is-hidden');
            ataturkPortrait.style.display = 'none';
            headerInner.classList.remove('has-ataturk');
        }
    } else {
        holidayText.classList.add('is-hidden');
        if (footerHoliday) footerHoliday.classList.add('is-hidden');
        ataturkPortrait.classList.add('is-hidden');
        ataturkPortrait.style.display = 'none';
        headerInner.classList.remove('has-ataturk');
    }
}

document.addEventListener('DOMContentLoaded', showHolidayText);
if (document.readyState !== 'loading') {
    showHolidayText();
}

let isSnowVisible = true;
let snowToggleInitialized = false;

function showSnowEffect() {
    const snowContainer = document.getElementById('snowContainer');
    const snowToggle = document.getElementById('snowToggle');

    if (!snowContainer) return;

    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate(); // 1-31

    if ((month === 11 && day === 31) || (month === 0 && day === 1)) {
        const savedPreference = localStorage.getItem('snowEnabled');
        
        if (savedPreference === 'false') {
            snowContainer.innerHTML = '';
            snowContainer.classList.add('is-hidden');
            isSnowVisible = false;
            if (snowToggle) {
                snowToggle.classList.add('snow-off');
                updateSnowIcons(false);
            }
        } else {
            snowContainer.classList.remove('is-hidden');
            isSnowVisible = true;
            if (snowToggle) {
                snowToggle.classList.remove('snow-off');
                updateSnowIcons(true);
            }
            if (snowContainer.innerHTML === '') {
                createSnowflakes(snowContainer);
            }
        }

        if (snowToggle) {
            snowToggle.classList.remove('is-hidden');
            
            if (!snowToggleInitialized) {
                snowToggle.addEventListener('click', function() {
                    const container = document.getElementById('snowContainer');
                    const btn = document.getElementById('snowToggle');
                    
                    if (!container || !btn) return;
                    
                    if (isSnowVisible) {
                        container.innerHTML = '';
                        container.classList.add('is-hidden');
                        btn.classList.add('snow-off');
                        updateSnowIcons(false);
                        localStorage.setItem('snowEnabled', 'false');
                        isSnowVisible = false;
                    } else {
                        container.classList.remove('is-hidden');
                        btn.classList.remove('snow-off');
                        updateSnowIcons(true);
                        localStorage.setItem('snowEnabled', 'true');
                        createSnowflakes(container);
                        isSnowVisible = true;
                    }
                });
                snowToggleInitialized = true;
            }
        }
    } else {
        snowContainer.innerHTML = '';
        snowContainer.classList.add('is-hidden');
        if (snowToggle) snowToggle.classList.add('is-hidden');
    }
}

function updateSnowIcons(isOn) {
    const iconOn = document.querySelector('.icon-snow-on');
    const iconOff = document.querySelector('.icon-snow-off');

    if (iconOn && iconOff) {
        if (isOn) {
            iconOn.classList.remove('is-hidden');
            iconOff.classList.add('is-hidden');
        } else {
            iconOn.classList.add('is-hidden');
            iconOff.classList.remove('is-hidden');
        }
    }
}

function createSnowflakes(container) {
    const snowflakeCount = 100;
    
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        const size = Math.random() * 5 + 2; // 2-7px arası
        const left = Math.random() * 100; // 0-100% arası
        const duration = Math.random() * 8 + 5; // 5-13 saniye arası
        const delay = Math.random() * 10; // 0-10 saniye gecikme
        const opacity = Math.random() * 0.6 + 0.2; // 0.2-0.8 arası
        
        snowflake.style.width = size + 'px';
        snowflake.style.height = size + 'px';
        snowflake.style.left = left + '%';
        snowflake.style.animationDuration = duration + 's';
        snowflake.style.animationDelay = delay + 's';
        snowflake.style.opacity = opacity;
        
        container.appendChild(snowflake);
    }
}

document.addEventListener('DOMContentLoaded', showSnowEffect);
if (document.readyState !== 'loading') {
    showSnowEffect();
}

document.addEventListener('DOMContentLoaded', initAnimations);

if (document.readyState !== 'loading') {
    initAnimations();
}

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
            var prefs = readConsent();
            var toggle = document.getElementById('cookieAnalyticsToggle');
            if (toggle && prefs) {
                toggle.checked = !!prefs.analytics;
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
        var htmlLang = (document.documentElement.lang || '').toLowerCase().substring(0,2);
        if (!htmlLang) return;

        document.querySelectorAll('.lang-option').forEach(function(opt) {
            var hreflang = (opt.getAttribute('hreflang') || '').toLowerCase().substring(0,2);
            var isActive = hreflang === htmlLang;
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

            // Prevent clicking the active language option
            opt.addEventListener('click', function(e) {
                if (this.getAttribute('aria-disabled') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
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
                '🇬🇧': '1f1ec-1f1e7',
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

// Cookie Consent Simple Implementation
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('cookieConsent_dlanding')) {
        const consentBanner = document.createElement('div');
        consentBanner.id = 'cookie-consent-banner';
        consentBanner.innerHTML = `
            <div style="position:fixed;bottom:0;left:0;right:0;background:#1a1a1a;color:#fff;padding:15px;text-align:center;z-index:9999;font-family:sans-serif;font-size:14px;border-top:1px solid #333;">
                Deneyiminizi geliştirmek ve istatistikleri analiz etmek için çerezler kullanıyoruz. Sitemizi kullanarak çerez kullanımını kabul etmiş olursunuz.
                <button id="cookie-accept" style="margin-left:15px;padding:8px 16px;background:#ff0077;color:#fff;border:none;border-radius:4px;cursor:pointer;">Kabul Et</button>
                <a href="/privacy.html" style="margin-left:15px;color:#bbb;text-decoration:underline;">Gizlilik Politikası</a>
            </div>
        `;
        document.body.appendChild(consentBanner);

        document.getElementById('cookie-accept').addEventListener('click', () => {
            localStorage.setItem('cookieConsent_dlanding', 'true');
            consentBanner.style.display = 'none';
        });
    }
});
