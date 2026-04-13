// ===== Mobile Detection =====
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768;

// ===== Detect Reduced Motion Preference =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Theme Toggle =====
const themeToggle = document.querySelector('.theme-toggle');
const iconMoon = document.querySelector('.icon-moon');
const iconSun = document.querySelector('.icon-sun');
const html = document.documentElement;

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

// ===== Language Dropdown Toggle =====
const langToggle = document.querySelector('.lang-toggle');
const langDropdown = document.getElementById('langDropdown');

if (langToggle) {
    langToggle.addEventListener('click', (e) => { e.stopPropagation(); if (langDropdown) langDropdown.classList.toggle('open'); });
}
document.addEventListener('click', () => { if (langDropdown) langDropdown.classList.remove('open'); });
if (langDropdown) langDropdown.addEventListener('click', (e) => e.stopPropagation());

// ===== Beta Modal =====
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

// ===== App Store Modal =====
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

// ===== Scroll Progress Indicator =====
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
    if (!scrollProgress) return;

    // Mobilde her zaman normal scroll kullan
    if (isMobile) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';
        return;
    }

    // Eğer section-based scroll kullanılıyorsa (index.html)
    if (allSectionsExist && sectionIds.length > 0) {
        // Mevcut section index'ine göre progress hesapla
        const totalSections = sectionIds.length;
        const currentSection = getCurrentSectionIndex();
        const progress = totalSections > 1 ? (currentSection / (totalSections - 1)) * 100 : 0;
        scrollProgress.style.width = progress + '%';
        return;
    }

    // Normal scroll davranışı (diğer sayfalar için)
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
}

// ===== Grid Background Parallax =====
const gridBg = document.querySelector('.grid-background');
function updateGridParallax(e) {
    if (!gridBg || prefersReducedMotion) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    gridBg.style.transform = `translate(${x}px, ${y}px)`;
}

// ===== Button Ripple Effect =====
function createRipple(event) {
    if (prefersReducedMotion) return;
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = diameter + 'px';
    circle.style.left = (event.clientX - rect.left - radius) + 'px';
    circle.style.top = (event.clientY - rect.top - radius) + 'px';
    circle.classList.add('ripple');

    // Remove existing ripples
    const existing = button.querySelector('.ripple');
    if (existing) existing.remove();

    button.appendChild(circle);

    // Clean up after animation
    setTimeout(() => circle.remove(), 600);
}

// Attach ripple to all buttons
document.querySelectorAll('.btn-google-play, .btn-app-store, .btn-faq-cta, .btn-primary').forEach(btn => {
    btn.addEventListener('click', createRipple);
});

// ===== Phone Mockup 3D Mouse Follow =====
function initPhone3D() {
    const heroSection = document.getElementById('hero');
    const phone = document.querySelector('.phone');

    if (!heroSection || !phone || prefersReducedMotion) return;

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
            // Return to default CSS animation
            phone.style.transform = '';
            phone.style.animation = '';
        }

        rafId = requestAnimationFrame(animate);
    }

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Normalize to -1 to 1 range
        const mouseX = ((e.clientX - centerX) / (rect.width / 2));
        const mouseY = ((e.clientY - centerY) / (rect.height / 2));

        // Max rotation angles
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

    // Start animation loop
    rafId = requestAnimationFrame(animate);
}

// ===== Finance Counter Animation =====
function animateCounter(element, target, duration = 1500) {
    if (prefersReducedMotion) {
        element.textContent = target.toLocaleString('tr-TR') + ' TL';
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

        element.textContent = currentValue.toLocaleString('tr-TR') + ' TL';
        element.classList.add('counting');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('counting');
        }
    }

    requestAnimationFrame(update);
}

// Observe finance card for counter
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

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll, .problem-card, .feature-card, .faq-item').forEach((el) => {
    observer.observe(el);
});

// Stagger cards
document.querySelectorAll('.problem-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.15}s`;
});
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

// FAQ stagger
document.querySelectorAll('.faq-item').forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.08}s`;
});

// ===== Smooth Scroll Navigation =====
const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const sectionIds = ['hero', 'features', 'problems', 'faq'];

// Only enable section scroll if all sections exist (index.html)
const allSectionsExist = sectionIds.every(id => document.getElementById(id));

let currentSectionIndex = 0;
let isScrolling = false;
const SCROLL_COOLDOWN = 800; // ms

// Helper: find current section index based on viewport
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

// Handle logo link - prevent page reload on index pages, navigate to home on other pages
const logoLink = document.querySelector('.logo[href^="index.html"], .logo[href="/"], .logo[href="../en/"], .logo[href="../de/"], .logo[href="../ru/"], .logo[href="../ar/"]');
if (logoLink) {
    logoLink.addEventListener('click', (e) => {
        // If we're on index.html and sections exist, prevent navigation and scroll to hero
        if (allSectionsExist) {
            e.preventDefault();
            scrollToSection(0);
        }
        // If on another page (privacy/terms), let the link navigate normally
    });
}

if (allSectionsExist) {

// Initialize: find current section
currentSectionIndex = getCurrentSectionIndex();

// Scroll to section with smooth animation
function scrollToSection(index) {
    if (index < 0 || index >= sectionIds.length || isScrolling) return;

    isScrolling = true;
    currentSectionIndex = index;

    const section = document.getElementById(sectionIds[index]);
    if (!section) {
        isScrolling = false;
        return;
    }

    // Update section visibility FIRST: hide all sections first, then show active one
    updateSectionVisibility(index);

    // Small delay before scrolling to ensure visibility changes are applied
    requestAnimationFrame(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    updateActiveNavLink();
    updateFooterVisibility();
    updateScrollProgress(); // Progress bar'ı güncelle

    setTimeout(() => {
        isScrolling = false;
    }, SCROLL_COOLDOWN);
}

// Update section visibility - only active section is visible
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

// Wheel event handler - intercept scroll (only on index.html)
let wheelAccumulator = 0;
const WHEEL_THRESHOLD = 50;
let isMouseButtonDown = false;

// Track mouse button state to prevent scroll issues during drag/selection
window.addEventListener('mousedown', () => { isMouseButtonDown = true; });
window.addEventListener('mouseup', () => { isMouseButtonDown = false; });

if (allSectionsExist) {
    // Wheel event handler - intercept scroll (DESKTOP ONLY - mobile gets free scroll)
    if (!isMobile) {
        window.addEventListener('wheel', (e) => {
            e.preventDefault();

            if (isMouseButtonDown) return;
            if (isScrolling) return;

            wheelAccumulator += e.deltaY;

            if (Math.abs(wheelAccumulator) >= WHEEL_THRESHOLD) {
                if (wheelAccumulator > 0) {
                    // Scroll down - next section
                    scrollToSection(currentSectionIndex + 1);
                } else {
                    // Scroll up - previous section
                    scrollToSection(currentSectionIndex - 1);
                }
                // Reset accumulator after triggering scroll
                wheelAccumulator = 0;
            }
        }, { passive: false });
    }

    // Touch support for mobile - DISABLED on mobile for free scrolling
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
                    // Swipe up - next section
                    scrollToSection(currentSectionIndex + 1);
                } else {
                    // Swipe down - previous section
                    scrollToSection(currentSectionIndex - 1);
                }
            }

            touchStartY = 0;
            touchEndY = 0;
        });
    }

    // Click navigation with smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const sectionId = href.substring(1);
                const index = sectionIds.indexOf(sectionId);
                if (index !== -1) {
                    scrollToSection(index);
                    history.pushState(null, null, href);
                }
            }
        });
    });

    // Keyboard navigation - Arrow keys, Page Up/Down, Home/End
    window.addEventListener('keydown', (e) => {
        if (isScrolling) return;

        // Check if user is in an input/textarea to avoid interfering with typing
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.isContentEditable)) {
            return;
        }

        const key = e.key;

        // Arrow Down or Page Down - next section
        if (key === 'ArrowDown' || key === 'PageDown') {
            e.preventDefault();
            scrollToSection(currentSectionIndex + 1);
        }
        // Arrow Up or Page Up - previous section
        else if (key === 'ArrowUp' || key === 'PageUp') {
            e.preventDefault();
            scrollToSection(currentSectionIndex - 1);
        }
        // Home - go to first section
        else if (key === 'Home') {
            e.preventDefault();
            scrollToSection(0);
        }
        // End - go to last section
        else if (key === 'End') {
            e.preventDefault();
            scrollToSection(sectionIds.length - 1);
        }
    });
}

// Update active nav link on scroll
function updateActiveNavLink() {
    const currentId = sectionIds[currentSectionIndex];

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === `#${currentId}`;
        link.classList.toggle('active', isActive);
    });
}

// Show footer only in FAQ section (desktop) or always (mobile)
function updateFooterVisibility() {
    const footer = document.querySelector('.site-footer');
    if (!footer) return;
    
    // On mobile, always show footer
    if (isMobile) {
        footer.classList.add('visible');
        return;
    }
    
    // On desktop, only show in FAQ section
    const isFaqSection = currentSectionIndex === 3;
    footer.classList.toggle('visible', isFaqSection);
}

// Initialize
currentSectionIndex = getCurrentSectionIndex();
updateActiveNavLink();
updateFooterVisibility();

// Set initial section visibility - only current section visible
updateSectionVisibility(currentSectionIndex);

} // end if (allSectionsExist)

// ===== FAQ Toggle (Event Delegation) =====
document.addEventListener('click', (e) => {
    const faqBtn = e.target.closest('.faq-question');
    if (faqBtn) {
        const item = faqBtn.parentElement;
        const wasActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item.active').forEach(i => i.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
        return;
    }

    // Modal open buttons
    const modalOpenBtn = e.target.closest('[data-modal]');
    if (modalOpenBtn) {
        e.preventDefault();
        const modalType = modalOpenBtn.getAttribute('data-modal');
        if (modalType === 'beta') openBetaModal();
        else if (modalType === 'appstore') openAppStoreModal();
        return;
    }

    // Modal close buttons
    const modalCloseBtn = e.target.closest('[data-close-modal]');
    if (modalCloseBtn) {
        const modalType = modalCloseBtn.getAttribute('data-close-modal');
        if (modalType === 'beta') closeBetaModal();
        else if (modalType === 'appstore') closeAppStoreModal();
        return;
    }

    // Modal overlay clicks (close when clicking outside modal content)
    const modalOverlay = e.target.closest('.beta-modal-overlay');
    if (modalOverlay) {
        const overlayId = modalOverlay.id;
        if (overlayId === 'betaModal') closeBetaModal();
        else if (overlayId === 'appStoreModal') closeAppStoreModal();
    }
});

// ===== Legal Modals =====
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

// ===== Initialize All Animations =====
function initAnimations() {
    // 3D Phone mockup mouse follow
    initPhone3D();

    // Grid parallax on mouse move
    if (!prefersReducedMotion) {
        window.addEventListener('mousemove', updateGridParallax);
    }

    // Scroll progress on scroll
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // Initial scroll progress
    updateScrollProgress();
}

// ===== Resmi Bayramlar Banner (Sadece Türkçe) =====
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

    // 23 Nisan: 23 Nisan 00:00 - 24 Nisan 00:00
    if (month === 3 && day === 23) {
        holiday = holidays[0];
    }
    // 19 Mayıs: 19 Mayıs 00:00 - 20 Mayıs 00:00
    else if (month === 4 && day === 19) {
        holiday = holidays[1];
    }
    // 30 Ağustos: 30 Ağustos 00:00 - 31 Ağustos 00:00
    else if (month === 7 && day === 30) {
        holiday = holidays[2];
    }
    // 29 Ekim: 29 Ekim 13:00 - 30 Ekim 13:00
    else if (
        (month === 9 && day === 29 && hours >= 13) ||
        (month === 9 && day === 30 && hours < 13)
    ) {
        holiday = holidays[3];
    }

    if (holiday) {
        holidayText.innerHTML = holiday.message;
        holidayText.classList.remove('is-hidden');

        // Footer'da da göster
        if (footerHoliday) footerHoliday.classList.remove('is-hidden');

        if (holiday.showAtaturk) {
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

// ===== Yeni Yıl Kar Efekti (31 Aralık - 1 Ocak) =====
let isSnowVisible = true;
let snowToggleInitialized = false;

function showSnowEffect() {
    const snowContainer = document.getElementById('snowContainer');
    const snowToggle = document.getElementById('snowToggle');

    if (!snowContainer) return;

    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate(); // 1-31

    // 31 Aralık veya 1 Ocak
    if ((month === 11 && day === 31) || (month === 0 && day === 1)) {
        // LocalStorage'dan kullanıcı tercihini kontrol et
        const savedPreference = localStorage.getItem('snowEnabled');
        
        if (savedPreference === 'false') {
            // Kullanıcı karı kapatmış - container'ı temizle
            snowContainer.innerHTML = '';
            snowContainer.classList.add('is-hidden');
            isSnowVisible = false;
            if (snowToggle) {
                snowToggle.classList.add('snow-off');
                updateSnowIcons(false);
            }
        } else {
            // Karı göster
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

        // Toggle butonunu göster
        if (snowToggle) {
            snowToggle.classList.remove('is-hidden');
            
            // Event listener'ı sadece bir kez ekle
            if (!snowToggleInitialized) {
                snowToggle.addEventListener('click', function() {
                    const container = document.getElementById('snowContainer');
                    const btn = document.getElementById('snowToggle');
                    
                    if (!container || !btn) return;
                    
                    if (isSnowVisible) {
                        // Karı kapat - içeriği temizle ve gizle
                        container.innerHTML = '';
                        container.classList.add('is-hidden');
                        btn.classList.add('snow-off');
                        updateSnowIcons(false);
                        localStorage.setItem('snowEnabled', 'false');
                        isSnowVisible = false;
                    } else {
                        // Karı aç - yeniden oluştur
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
        
        // Rastgele özellikler
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

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initAnimations);

// Also run immediately if DOM is already ready
if (document.readyState !== 'loading') {
    initAnimations();
}

// ===== Cookie Consent Management (GDPR/KVKK Compliant) =====
(function() {
    'use strict';

    // === Tutarlı, global key - tüm dillerde aynı ===
    var COOKIE_KEY = 'drivarc-cookie-consent';
    var CONSENT_COOKIE_NAME = 'cookie_policy';
    var CONSENT_COOKIE_DAYS = 365;
    var CONSENT_VERSION = '2';

    // === Helper: Cookie Okuma ===
    function readCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    // === Helper: Cookie Yazma (güvenli, SameSite=Lax) ===
    function writeCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax; Secure';
    }

    // === Helper: Consent Cookie Parse ===
    function parseConsentCookie(value) {
        try {
            return JSON.parse(decodeURIComponent(value));
        } catch (e) {
            return null;
        }
    }

    // === Helper: gtag-safe call ===
    function gtagConsentUpdate(granted) {
        // Race condition koruması: gtag yüklenene kadar bekle
        function applyConsent() {
            if (typeof window.gtag === 'function') {
                window.gtag('consent', 'update', {
                    'ad_storage': granted ? 'granted' : 'denied',
                    'ad_user_data': granted ? 'granted' : 'denied',
                    'ad_personalization': granted ? 'granted' : 'denied',
                    'analytics_storage': granted ? 'granted' : 'denied'
                });
                console.log('[CookieConsent] All consent parameters:', granted ? 'GRANTED' : 'DENIED');
            } else {
                // gtag henüz yüklenmediyse dataLayer'a push et
                window.dataLayer.push({
                    'event': 'consent_update',
                    'ad_storage': granted ? 'granted' : 'denied',
                    'ad_user_data': granted ? 'granted' : 'denied',
                    'ad_personalization': granted ? 'granted' : 'denied',
                    'analytics_storage': granted ? 'granted' : 'denied'
                });
                console.log('[CookieConsent] gtag not ready, pushed to dataLayer');
                // Tekrar dene
                setTimeout(applyConsent, 100);
            }
        }
        applyConsent();
    }

    // === Helper: Event Tracking ===
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

    // === Helper: Store Consent (localStorage + Cookie) ===
    function saveConsent(preferences) {
        // localStorage
        try {
            localStorage.setItem(COOKIE_KEY, JSON.stringify(preferences));
        } catch (e) {
            console.warn('[CookieConsent] localStorage write failed:', e);
        }
        // Cookie (yedek + sunucu tarafı okuma için)
        writeCookie(CONSENT_COOKIE_NAME, JSON.stringify(preferences), CONSENT_COOKIE_DAYS);
    }

    // === Helper: Read Consent ===
    function readConsent() {
        // Önce localStorage'dan oku
        try {
            var saved = localStorage.getItem(COOKIE_KEY);
            if (saved) {
                var prefs = JSON.parse(saved);
                if (prefs.version === CONSENT_VERSION) {
                    return prefs;
                }
            }
        } catch (e) { /* ignore */ }

        // Cookie'den oku (fallback)
        var cookieVal = readCookie(CONSENT_COOKIE_NAME);
        if (cookieVal) {
            var prefs = parseConsentCookie(cookieVal);
            if (prefs && prefs.version === CONSENT_VERSION) {
                return prefs;
            }
        }
        return null;
    }

    // === Helper: Get Page Language ===
    function getPageLang() {
        var html = document.documentElement;
        return (html.getAttribute('lang') || 'tr').substring(0, 2);
    }

    // === Helper: Get Privacy Link ===
    function getPrivacyLink() {
        var lang = getPageLang();
        if (lang === 'tr') return 'privacy.html';
        // en, de, ru, ar için dil bazlı link
        return '../privacy.html';
    }

    // === Helper: Show Banner ===
    function showBanner() {
        var banner = document.querySelector('.cookie-consent');
        if (banner) {
            // Privacy link'i güncelle
            var descLink = banner.querySelector('.cookie-consent-description a');
            if (descLink) {
                descLink.href = getPrivacyLink();
            }
            // 1 saniye sonra göster
            setTimeout(function() {
                banner.classList.add('show');
            }, 1000);
        }
    }

    // === Helper: Hide Banner ===
    function hideBanner() {
        var banner = document.querySelector('.cookie-consent');
        if (banner) {
            banner.classList.remove('show');
            banner.classList.add('hide');
        }
    }

    // === Accept All ===
    function acceptAll() {
        var prefs = {
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            necessary: true,
            analytics: true,
            marketing: false
        };
        saveConsent(prefs);
        gtagConsentUpdate(true);
        hideBanner();
        trackEvent('cookie_consent', { action: 'accept_all' });
    }

    // === Decline Non-Essential ===
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

    // === Open Settings Modal ===
    function openSettingsModal() {
        var modal = document.getElementById('cookieSettingsModal');
        if (modal) {
            // Mevcut tercihi toggle'a yansıt
            var prefs = readConsent();
            var toggle = document.getElementById('cookieAnalyticsToggle');
            if (toggle && prefs) {
                toggle.checked = !!prefs.analytics;
            }
            modal.classList.add('show');
        }
    }

    // === Close Settings Modal ===
    function closeSettingsModal() {
        var modal = document.getElementById('cookieSettingsModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // === Save Modal Settings ===
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
        gtagConsentUpdate(analyticsEnabled);
        closeSettingsModal();
        hideBanner();
        trackEvent('cookie_consent', {
            action: 'custom',
            analytics: analyticsEnabled
        });
    }

    // === Google Play / App Store Click Tracking ===
    function initStoreClickTracking() {
        // Google Play butonu
        var gpBtn = document.querySelector('[data-modal="beta"]');
        if (gpBtn) {
            gpBtn.addEventListener('click', function(e) {
                e.preventDefault();
                trackEvent('store_click', {
                    'store': 'google_play',
                    'page_language': getPageLang()
                });
                // Mevcut modal açma davranışını koru
                if (typeof window.openBetaModal === 'function') {
                    window.openBetaModal();
                }
            });
        }

        // App Store butonu
        var asBtn = document.querySelector('[data-modal="appstore"]');
        if (asBtn) {
            asBtn.addEventListener('click', function(e) {
                e.preventDefault();
                trackEvent('store_click', {
                    'store': 'app_store',
                    'page_language': getPageLang()
                });
                // Mevcut modal açma davranışını koru
                var modal = document.getElementById('appStoreModal');
                if (modal) {
                    modal.style.display = 'flex';
                    requestAnimationFrame(function() { modal.classList.add('show'); });
                }
            });
        }
    }

    // === Footer'dan tercihleri açma butonu ekle ===
    function addFooterCookieLink() {
        var footer = document.querySelector('.footer-inner, .site-footer');
        if (!footer) return;
        // Zaten varsa ekleme
        if (footer.querySelector('.cookie-preferences-link')) return;

        var link = document.createElement('a');
        link.href = '#';
        link.className = 'footer-link cookie-preferences-link';
        link.textContent = 'Cookie Preferences';
        link.setAttribute('data-cookie-preferences', 'true');

        // Dil bazlı metin
        var lang = getPageLang();
        var labels = {
            'tr': 'Çerez Tercihleri',
            'en': 'Cookie Preferences',
            'de': 'Cookie-Einstellungen',
            'ru': 'Настройки cookie',
            'ar': 'تفضيلات ملفات تعريف الارتباط'
        };
        link.textContent = labels[lang] || labels['en'];

        link.addEventListener('click', function(e) {
            e.preventDefault();
            openSettingsModal();
        });

        // Footer links'in sonuna ekle
        var footerLinks = footer.querySelector('.footer-links');
        if (footerLinks) {
            footerLinks.appendChild(link);
        }
    }

    // === RTL Layout Desteği (Arapça) ===
    // Not: Tüm RTL stilleri artık CSS'te [dir="rtl"] selector'leri ile yönetiliyor.
    // JS tarafında ekstra bir şey yapmaya gerek yok.
    function applyRTLLayout() {
        // CSS handles everything, this is a no-op now
    }

    // === Initialize ===
    function init() {
        var prefs = readConsent();

        if (!prefs) {
            // İlk ziyaret - banner göster
            showBanner();
        } else {
            // Kayıtlı tercih var - uygula
            if (prefs.analytics) {
                gtagConsentUpdate(true);
            } else {
                gtagConsentUpdate(false);
            }
        }

        // Buton eventleri
        var acceptBtn = document.querySelector('.cookie-consent-btn.accept:not(.cookie-settings-save)');
        if (acceptBtn) acceptBtn.addEventListener('click', acceptAll);

        var declineBtn = document.querySelector('.cookie-consent-btn.decline:not(.cookie-settings-close)');
        if (declineBtn) declineBtn.addEventListener('click', declineAll);

        var settingsBtn = document.querySelector('.cookie-consent-btn.settings');
        if (settingsBtn) settingsBtn.addEventListener('click', openSettingsModal);

        var closeBtn = document.querySelector('.cookie-settings-close');
        if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal);

        var saveBtn = document.querySelector('.cookie-settings-save');
        if (saveBtn) saveBtn.addEventListener('click', saveModalSettings);

        // Modal dışına tıklayınca kapat
        var modal = document.getElementById('cookieSettingsModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) closeSettingsModal();
            });
        }

        // ESC ile kapat
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeSettingsModal();
        });

        // Store click tracking
        initStoreClickTracking();

        // Footer'dan tercihleri açma linki
        addFooterCookieLink();

        // RTL layout desteği
        applyRTLLayout();
    }

    // DOM ready'de çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
