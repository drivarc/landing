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
