/* ===== APEX MOTORS — Main JavaScript ===== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ===== LOADER =====
    const loader = document.getElementById('loader');
    const loaderNeedle = document.getElementById('loaderNeedle');

    // Animate needle from -120deg to 120deg
    setTimeout(() => {
        loaderNeedle.style.transform = 'translateX(-50%) rotate(120deg)';
    }, 100);

    // Split reveal after needle sweep
    setTimeout(() => {
        loader.classList.add('split');
    }, 1500);

    // Remove loader
    setTimeout(() => {
        loader.classList.add('done');
        document.body.style.overflow = '';
        // Trigger hero animations
        document.getElementById('hero').classList.add('visible');
        initRevealAnimations();
        initCounters();
    }, 2300);

    // Prevent scroll during loader
    document.body.style.overflow = 'hidden';

    // ===== CUSTOM CURSOR =====
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Cursor hover effect
    const hoverElements = document.querySelectorAll('a, button, input, select, textarea, .featured__card, .listings__card, .promise__card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });


    // ===== NAVIGATION =====
    const nav = document.getElementById('nav');
    const contactToggle = document.getElementById('contactToggle');
    const contactDrawer = document.getElementById('contactDrawer');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    // Scroll behavior for nav
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Contact drawer toggle
    contactToggle.addEventListener('click', () => {
        contactDrawer.classList.toggle('open');
    });

    // Hamburger menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    });


    // ===== HERO PARALLAX =====
    const heroImg = document.querySelector('.hero__bg img');
    window.addEventListener('scroll', () => {
        if (heroImg) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            heroImg.style.transform = `scale(1.1) translateY(${rate}px)`;
        }
    });

    // ===== ROAD COMPANION =====
    const roadCompanion = document.getElementById('roadCompanion');
    window.addEventListener('scroll', () => {
        const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
        const maxLeft = window.innerWidth - 100;
        const newLeft = -100 + (scrollPercent * (maxLeft + 200));
        roadCompanion.style.left = newLeft + 'px';
    });

    // ===== REVEAL ANIMATIONS =====
    function initRevealAnimations() {
        const revealMasks = document.querySelectorAll('.reveal-mask');
        const revealClips = document.querySelectorAll('.reveal-clip');

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, index * 100);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealMasks.forEach(mask => revealObserver.observe(mask));
        revealClips.forEach(clip => revealObserver.observe(clip));
    }


    // ===== COUNTER ANIMATION =====
    function initCounters() {
        const counters = document.querySelectorAll('[data-target]');

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    animateCounter(entry.target, target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    function animateCounter(element, target) {
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(update);
    }


    // ===== FEATURED VEHICLES — DRAG TO SCROLL =====
    const featuredTrack = document.getElementById('featuredTrack');
    const featuredProgress = document.getElementById('featuredProgress');
    const featuredPrev = document.getElementById('featuredPrev');
    const featuredNext = document.getElementById('featuredNext');

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    featuredTrack.addEventListener('mousedown', (e) => {
        isDragging = true;
        featuredTrack.classList.add('dragging');
        startX = e.pageX - featuredTrack.offsetLeft;
        scrollLeft = featuredTrack.scrollLeft;
    });

    featuredTrack.addEventListener('mouseleave', () => {
        isDragging = false;
        featuredTrack.classList.remove('dragging');
    });

    featuredTrack.addEventListener('mouseup', () => {
        isDragging = false;
        featuredTrack.classList.remove('dragging');
    });

    featuredTrack.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - featuredTrack.offsetLeft;
        const walk = (x - startX) * 2;
        featuredTrack.scrollLeft = scrollLeft - walk;
    });

    // Progress bar update
    featuredTrack.addEventListener('scroll', () => {
        const maxScroll = featuredTrack.scrollWidth - featuredTrack.clientWidth;
        const progress = (featuredTrack.scrollLeft / maxScroll) * 100;
        featuredProgress.style.width = Math.max(progress, 5) + '%';
    });

    // Nav buttons
    featuredPrev.addEventListener('click', () => {
        featuredTrack.scrollBy({ left: -340, behavior: 'smooth' });
    });

    featuredNext.addEventListener('click', () => {
        featuredTrack.scrollBy({ left: 340, behavior: 'smooth' });
    });


    // ===== LISTINGS FILTER =====
    const filterButtons = document.querySelectorAll('.listings__filter');
    const filterIndicator = document.getElementById('filterIndicator');
    const listingsGrid = document.getElementById('listingsGrid');
    const listingCards = document.querySelectorAll('.listings__card');

    // Position indicator on active button
    function moveIndicator(button) {
        filterIndicator.style.width = button.offsetWidth + 'px';
        filterIndicator.style.left = button.offsetLeft + 'px';
        filterIndicator.style.top = button.offsetTop + 'px';
        filterIndicator.style.height = button.offsetHeight + 'px';
    }

    // Initialize indicator position
    const activeFilter = document.querySelector('.listings__filter.active');
    if (activeFilter) {
        setTimeout(() => moveIndicator(activeFilter), 100);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            moveIndicator(btn);

            // Filter cards
            const filter = btn.getAttribute('data-filter');
            listingCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Recalculate indicator on resize
    window.addEventListener('resize', () => {
        const current = document.querySelector('.listings__filter.active');
        if (current) moveIndicator(current);
    });


    // ===== TRADE-IN WIZARD =====
    const tradeWizard = document.getElementById('tradeWizard');
    const tradeForms = tradeWizard.querySelectorAll('.trade-in__form');
    const tradeSteps = tradeWizard.querySelectorAll('.trade-in__step');

    function goToStep(stepNum) {
        tradeForms.forEach(form => form.classList.remove('active'));
        tradeSteps.forEach(step => step.classList.remove('active'));

        const targetForm = tradeWizard.querySelector(`[data-form="${stepNum}"]`);
        const targetStep = tradeWizard.querySelector(`[data-step="${stepNum}"]`);

        if (targetForm) targetForm.classList.add('active');
        if (targetStep) targetStep.classList.add('active');

        // Mark previous steps as completed
        tradeSteps.forEach(step => {
            const num = parseInt(step.getAttribute('data-step'));
            if (num < stepNum) step.classList.add('active');
        });
    }

    // Next buttons
    tradeWizard.querySelectorAll('.trade-in__next').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = parseInt(btn.getAttribute('data-next'));
            goToStep(nextStep);
        });
    });

    // Prev buttons
    tradeWizard.querySelectorAll('.trade-in__prev').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevStep = parseInt(btn.getAttribute('data-prev'));
            goToStep(prevStep);
        });
    });

    // Submit handler
    const submitBtn = tradeWizard.querySelector('.trade-in__submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            submitBtn.textContent = 'Submitted!';
            submitBtn.style.background = 'var(--gold)';
            submitBtn.style.color = 'var(--bg)';
            submitBtn.style.borderColor = 'var(--gold)';
            setTimeout(() => {
                submitBtn.textContent = 'Get Valuation';
                submitBtn.style.background = '';
                submitBtn.style.color = '';
                submitBtn.style.borderColor = '';
                goToStep(1);
            }, 3000);
        });
    }


    // ===== TESTIMONIALS CAROUSEL =====
    const carousel = document.getElementById('testimonialCarousel');
    const slides = carousel.querySelectorAll('.testimonials__slide');
    const dots = document.querySelectorAll('.testimonials__dot');
    let currentSlide = 0;
    let testimonialInterval;

    function goToSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    // Auto-advance every 5 seconds
    function startAutoAdvance() {
        testimonialInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoAdvance() {
        clearInterval(testimonialInterval);
        startAutoAdvance();
    }

    startAutoAdvance();

    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.getAttribute('data-slide'));
            goToSlide(slideIndex);
            resetAutoAdvance();
        });
    });


    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== FAQ ACCESSIBILITY =====
    document.querySelectorAll('.faq__item').forEach(item => {
        item.addEventListener('toggle', () => {
            // Close other items in the same column (optional UX)
        });
    });

    // ===== WINDOW RESIZE HANDLER =====
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate positions if needed
        }, 250);
    });

}); // End DOMContentLoaded
