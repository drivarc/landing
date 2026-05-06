const scrollProgress = document.getElementById('scrollProgress');
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
            el.classList.add('visible');
            observer.unobserve(el);
        }
    });
}, observerOptions);

// Only observe elements that still need animation (not cards which are now visible by default)
document.querySelectorAll('.animate-on-scroll').forEach((el) => {
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

    function updateFooterVisibility() {
        // Footer is now always visible in free scroll mode (controlled by CSS)
    }

    // Initial state
    currentSectionIndex = getCurrentSectionIndex();
    updateActiveNavLink();
    updateScrollProgress();
} // end if (allSectionsExist)
