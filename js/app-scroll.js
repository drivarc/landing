const scrollProgress = document.getElementById('scrollProgress');
function requestFrame(callback) {
    try {
        if (typeof window.requestAnimationFrame === 'function') {
            return window.requestAnimationFrame(callback);
        }
    } catch (error) {
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

function initDotParallax() {
    const far = document.querySelector('.dot-field--far');
    const mid = document.querySelector('.dot-field--mid');
    const near = document.querySelector('.dot-field--near');
    if (!far || !mid || !near) return;

    if (prefersReducedMotion) return;

    let rafId = null;
    let targetX = 0;
    let mouseX = 0;
    let scrollY = 0;

    function onScroll() {
        scrollY = window.scrollY;
    }

    function onPointerMove(e) {
        if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    }

    function animate() {
        try {
            mouseX += (targetX - mouseX) * 0.06;

            far.style.backgroundPosition = `${mouseX * 5}px ${scrollY * 0.03}px`;
            mid.style.backgroundPosition = `${mouseX * 12}px ${scrollY * 0.10}px`;
            near.style.backgroundPosition = `${mouseX * 25}px ${scrollY * 0.25}px`;

            rafId = requestFrame(animate);
        } catch (error) {
            cancelFrame(rafId);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    if ('PointerEvent' in window) {
        window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    onScroll();
    rafId = requestFrame(animate);
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
                // Use CSS custom property for staggering, fallback to 0.1s
                const baseDelay = parseFloat(group.dataset.staggerDelay) || 0.1; // seconds (sync with --stagger-step)

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

// Mobile: hide header on scroll down, show on scroll up
(function () {
    if (!isMobile) return;

    const header = document.querySelector('.header');
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        const scrollDiff = currentScrollY - lastScrollY;

        if (currentScrollY <= 10) {
            // Sayfanın en üstünde - header göster
            header.classList.remove('header--hidden');
            if (progressBar) progressBar.classList.remove('scroll-progress-bar--top');
        } else if (Math.abs(scrollDiff) > 10) {
            // 10px threshold geçildi
            if (scrollDiff > 0) {
                // Aşağı scroll - header gizle
                header.classList.add('header--hidden');
                if (progressBar) progressBar.classList.add('scroll-progress-bar--top');
            } else {
                // Yukarı scroll - header göster
                header.classList.remove('header--hidden');
                if (progressBar) progressBar.classList.remove('scroll-progress-bar--top');
            }
            lastScrollY = currentScrollY;
        }

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestFrame(function () {
                handleScroll();
            });
            ticking = true;
        }
    }, { passive: true });
})();
