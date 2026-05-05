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
    rootMargin: isMobile ? '0px 0px 100px 0px' : '0px 0px -50px 0px'
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
    card.style.transitionDelay = isMobile ? '0s' : `${index * 0.15}s`;
});
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.transitionDelay = isMobile ? '0s' : `${index * 0.1}s`;
});

document.querySelectorAll('.faq-item').forEach((item, index) => {
    item.style.transitionDelay = isMobile ? '0s' : `${index * 0.08}s`;
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
