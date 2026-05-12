const scrollProgress = document.getElementById('scrollProgress');
function requestFrame(callback) {
    try {
        if (typeof window.requestAnimationFrame === 'function') {
            return window.requestAnimationFrame(callback);
        }
    } catch (error) {
        console.error('[Drivarc diagnostics][motion] requestAnimationFrame failed', error);
    }

    return window.setTimeout(function () {
        callback(window.performance && typeof window.performance.now === 'function' ? window.performance.now() : Date.now());
    }, 16);
}

function cancelFrame(handle) {
    if (typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(handle);
        return;
    }

    window.clearTimeout(handle);
}

function updateScrollProgress() {
    if (!scrollProgress) return;

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
    gridBg.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function handleGridParallaxMotion(e) {
    if (prefersReducedMotion) return;

    if (e.type === 'pointermove' && e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') {
        return;
    }

    try {
        updateGridParallax(e);
    } catch (error) {
        console.error('[Drivarc diagnostics][grid-parallax] Motion update failed', error);
    }
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

    if (!heroSection || !phone) {
        console.info('[Drivarc diagnostics][phone-tilt] skipped', {
            reason: 'missing-elements',
            hasHeroSection: !!heroSection,
            hasPhone: !!phone
        });
        return;
    }

    const phoneFeatureMatrix = window.drivarcRuntimeFeatures || {
        isTouchCapable,
        isMobile,
        supportsHoverInput,
        prefersReducedMotion
    };

    console.info('[Drivarc diagnostics][phone-tilt] feature matrix', phoneFeatureMatrix);

    if (prefersReducedMotion) {
        console.info('[Drivarc diagnostics][phone-tilt] disabled', { reason: 'prefers-reduced-motion' });
        return;
    }

    if (window.innerWidth <= 768) {
        console.info('[Drivarc diagnostics][phone-tilt] disabled', { reason: 'mobile-width', width: window.innerWidth });
        return;
    }

    const supportsTransform3d = !window.CSS || typeof window.CSS.supports !== 'function' ? true : window.CSS.supports('transform', 'translate3d(0, 0, 0)');
    if (!supportsTransform3d) {
        console.warn('[Drivarc diagnostics][phone-tilt] disabled', { reason: 'transform-3d-unsupported' });
        return;
    }

    let isMouseOverHero = false;
    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let loggedFirstInteraction = false;

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function logFirstInteraction(eventType) {
        if (loggedFirstInteraction) return;
        loggedFirstInteraction = true;
        console.info('[Drivarc diagnostics][phone-tilt] first interaction', {
            eventType: eventType,
            hoverMediaQuery: supportsHoverInput,
            pointerEvents: 'PointerEvent' in window
        });
    }

    function animate() {
        try {
            currentX = lerp(currentX, targetX, 0.08);
            currentY = lerp(currentY, targetY, 0.08);

            if (isMouseOverHero) {
                phone.style.animation = 'none';
                phone.style.transform = `translate3d(0, 0, 0) rotateY(${currentY}deg) rotateX(${currentX}deg)`;
            } else {
                phone.style.transform = '';
                phone.style.animation = '';
            }

            rafId = requestFrame(animate);
        } catch (error) {
            console.error('[Drivarc diagnostics][phone-tilt] animation failed', error);
            cancelFrame(rafId);
            phone.style.transform = '';
            phone.style.animation = '';
        }
    }

    function updateTiltTarget(e) {
        try {
            if (e.type === 'pointermove' && e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') {
                return;
            }

            const rect = heroSection.getBoundingClientRect();
            if (!rect.width || !rect.height) {
                console.warn('[Drivarc diagnostics][phone-tilt] skipped', { reason: 'zero-hero-rect' });
                return;
            }

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = (e.clientX - centerX) / (rect.width / 2);
            const mouseY = (e.clientY - centerY) / (rect.height / 2);

            targetX = mouseY * -15;
            targetY = mouseX * 15;
            isMouseOverHero = true;
            logFirstInteraction(e.type);
        } catch (error) {
            console.error('[Drivarc diagnostics][phone-tilt] input failed', error);
        }
    }

    function resetTiltTarget() {
        isMouseOverHero = false;
        targetX = 0;
        targetY = 0;
    }

    heroSection.addEventListener('mousemove', updateTiltTarget, { passive: true });
    heroSection.addEventListener('mouseleave', resetTiltTarget);

    if ('PointerEvent' in window) {
        heroSection.addEventListener('pointermove', updateTiltTarget, { passive: true });
        heroSection.addEventListener('pointerleave', function (e) {
            if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
            resetTiltTarget();
        });
    }

    rafId = requestFrame(animate);
    console.info('[Drivarc diagnostics][phone-tilt] enabled', {
        hoverMediaQuery: supportsHoverInput,
        pointerEvents: 'PointerEvent' in window,
        viewportWidth: window.innerWidth
    });
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
        try {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const currentValue = Math.round(start + (target - start) * easedProgress);

            element.textContent = currentValue.toLocaleString(currencyInfo.locale) + ' ' + currencyInfo.code;
            element.classList.add('counting');

            if (progress < 1) {
                requestFrame(update);
            } else {
                element.classList.remove('counting');
            }
        } catch (error) {
            console.error('[Drivarc diagnostics][counter] animation failed', error);
            element.classList.remove('counting');
        }
    }

    requestFrame(update);
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

// Observe scroll animations with improved staggering and group handling
const animatedEls = document.querySelectorAll('.animate-on-scroll');

if (prefersReducedMotion) {
    // Respect user preference: show everything without animation
    animatedEls.forEach(el => el.classList.add('visible'));
} else {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: isMobile ? '0px 0px -5% 0px' : '0px 0px -10% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;

            // If element belongs to a grid-like group, reveal the group's children with a stagger
            const group = el.closest('.features-grid, .problems-grid, .faq-list, .features-inner, .problems-inner');
            if (group && !group.dataset.animated) {
                const children = Array.from(group.querySelectorAll('.animate-on-scroll'));
                const baseDelay = parseFloat(group.dataset.staggerDelay) || 0.12; // seconds

                children.forEach((child, idx) => {
                    const delay = isMobile ? '0s' : `${idx * baseDelay}s`;
                    child.style.transitionDelay = delay;
                    // ensure delay takes effect before adding class
                    requestFrame(() => child.classList.add('visible'));
                    observer.unobserve(child);
                });

                group.dataset.animated = 'true';
            } else {
                // Single element reveal
                if (!el.style.transitionDelay && !el.dataset.delay) {
                    el.style.transitionDelay = '0s';
                }
                el.classList.add('visible');
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    animatedEls.forEach(el => observer.observe(el));
}

const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const sectionIds = ['hero', 'testimonials', 'features', 'problems', 'faq'];

const allSectionsExist = sectionIds.every(id => document.getElementById(id));

let currentSectionIndex = 0;

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

if (logoLink) {
    logoLink.addEventListener('click', (e) => {
        if (allSectionsExist) {
            e.preventDefault();
            scrollToSection(0);
        }
    });
}

if (allSectionsExist) {
    // Free scroll mode - removed section-snapping wheel/touch/keyboard handlers
    // Navigation links still work with smooth scrolling via scrollToSection()

    function scrollToSection(index, options = {}) {
        const { updateHistory = false } = options;

        if (index < 0 || index >= sectionIds.length) return;

        const section = document.getElementById(sectionIds[index]);
        if (!section) return;

        if (updateHistory) {
            history.pushState(null, null, `#${sectionIds[index]}`);
        }

        section.scrollIntoView({ behavior: 'smooth' });

        currentSectionIndex = index;
        updateActiveNavLink();
        updateScrollProgress();
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();

                const sectionId = href.substring(1);
                const index = sectionIds.indexOf(sectionId);
                if (index !== -1) {
                    scrollToSection(index, { updateHistory: true });
                }
            }
        });
    });

    // Update active nav link and UI on scroll
    window.addEventListener('scroll', () => {
        const newIndex = getCurrentSectionIndex();
        if (newIndex !== currentSectionIndex) {
            currentSectionIndex = newIndex;
            updateActiveNavLink();
        }
        updateScrollProgress();
    }, { passive: true });

    function updateActiveNavLink() {
        const currentId = sectionIds[currentSectionIndex];

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `#${currentId}`;
            link.classList.toggle('active', isActive);
        });
    }

    // Initial state
    currentSectionIndex = getCurrentSectionIndex();
    updateActiveNavLink();
    updateScrollProgress();
} // end if (allSectionsExist)
