/* ==========================================
   PRESTIGE MOTORS — GSAP Animations & Interactivity
   ========================================== */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// NAVIGATION
// ==========================================
const nav = document.getElementById('nav');
const mobileToggle = document.getElementById('mobileToggle');

// Nav scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        nav.classList.add('nav--scrolled');
    } else {
        nav.classList.remove('nav--scrolled');
    }
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Mobile toggle (basic)
if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav__links');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}


// ==========================================
// HERO ANIMATIONS
// ==========================================
const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTimeline
    .from('.hero__badge', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.3
    })
    .from('.hero__title', {
        opacity: 0,
        y: 60,
        duration: 1,
    }, '-=0.4')
    .from('.hero__subtitle', {
        opacity: 0,
        y: 30,
        duration: 0.8,
    }, '-=0.5')
    .from('.hero__buttons .btn', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.15
    }, '-=0.4')
    .from('.hero__scroll-indicator', {
        opacity: 0,
        duration: 1,
    }, '-=0.2');

// Hero parallax
gsap.to('.hero__bg-img', {
    yPercent: 25,
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
    }
});


// ==========================================
// SECTION REVEAL ANIMATIONS
// ==========================================

// Generic section headers
gsap.utils.toArray('.section-header').forEach(header => {
    gsap.from(header.children, {
        scrollTrigger: {
            trigger: header,
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
    });
});

// Car cards stagger
gsap.from('.car-card', {
    scrollTrigger: {
        trigger: '.models__grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 60,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power2.out'
});

// About section
gsap.from('.about__image', {
    scrollTrigger: {
        trigger: '.about__grid',
        start: 'top 75%',
        toggleActions: 'play none none none'
    },
    opacity: 0,
    x: -60,
    duration: 1,
    ease: 'power2.out'
});

gsap.from('.about__content', {
    scrollTrigger: {
        trigger: '.about__grid',
        start: 'top 75%',
        toggleActions: 'play none none none'
    },
    opacity: 0,
    x: 60,
    duration: 1,
    ease: 'power2.out',
    delay: 0.2
});

// Feature cards
gsap.from('.feature-card', {
    scrollTrigger: {
        trigger: '.why-us__grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power2.out'
});

// Testimonial cards
gsap.from('.testimonial-card', {
    scrollTrigger: {
        trigger: '.testimonials__grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    duration: 0.7,
    stagger: 0.15,
    ease: 'power2.out'
});

// CTA section
gsap.from('.cta__content', {
    scrollTrigger: {
        trigger: '.cta',
        start: 'top 70%',
        toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    duration: 1,
    ease: 'power2.out'
});

// FAQ items
gsap.from('.faq__item', {
    scrollTrigger: {
        trigger: '.faq__list',
        start: 'top 80%',
        toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out'
});


// ==========================================
// NUMBER COUNTER ANIMATION
// ==========================================
const statNumbers = document.querySelectorAll('.stat__number');

statNumbers.forEach(num => {
    const target = parseInt(num.getAttribute('data-target'));
    
    ScrollTrigger.create({
        trigger: num,
        start: 'top 85%',
        onEnter: () => {
            gsap.to(num, {
                innerText: target,
                duration: 2,
                snap: { innerText: 1 },
                ease: 'power2.out'
            });
        },
        once: true
    });
});

// ==========================================
// HORIZONTAL SCROLL SHOWCASE
// ==========================================
const showcaseTrack = document.querySelector('.showcase__track');
const showcaseWrapper = document.querySelector('.showcase__wrapper');

if (showcaseTrack && showcaseWrapper) {
    const totalScrollWidth = showcaseTrack.scrollWidth - window.innerWidth + 100;

    gsap.to(showcaseTrack, {
        x: -totalScrollWidth,
        ease: 'none',
        scrollTrigger: {
            trigger: '.showcase',
            start: 'top 10%',
            end: () => `+=${totalScrollWidth}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });
}


// ==========================================
// FAQ ACCORDION
// ==========================================
const faqItems = document.querySelectorAll('.faq__item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq__answer');
                gsap.to(otherAnswer, {
                    maxHeight: 0,
                    duration: 0.3,
                    ease: 'power2.inOut'
                });
            }
        });
        
        // Toggle current item
        if (isActive) {
            item.classList.remove('active');
            gsap.to(answer, {
                maxHeight: 0,
                duration: 0.3,
                ease: 'power2.inOut'
            });
        } else {
            item.classList.add('active');
            const scrollHeight = answer.scrollHeight;
            gsap.to(answer, {
                maxHeight: scrollHeight,
                duration: 0.4,
                ease: 'power2.out'
            });
        }
    });
});

// ==========================================
// CARD HOVER MICRO-INTERACTIONS
// ==========================================
document.querySelectorAll('.car-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            y: -8,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            y: -6,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});


// ==========================================
// MARQUEE SPEED CONTROL
// ==========================================
const marqueeTrack = document.querySelector('.marquee__track');
if (marqueeTrack) {
    // Pause marquee on hover
    marqueeTrack.addEventListener('mouseenter', () => {
        marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeTrack.addEventListener('mouseleave', () => {
        marqueeTrack.style.animationPlayState = 'running';
    });
}

// ==========================================
// FOOTER FORM
// ==========================================
const footerForm = document.querySelector('.footer__form');
if (footerForm) {
    footerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = footerForm.querySelector('.footer__input');
        const btn = footerForm.querySelector('.footer__submit');
        if (input.value.trim()) {
            btn.textContent = 'Subscribed!';
            btn.style.background = '#4CAF50';
            input.value = '';
            setTimeout(() => {
                btn.textContent = 'Subscribe';
                btn.style.background = '';
            }, 3000);
        }
    });
}

// ==========================================
// SCROLL TRIGGER REFRESH ON LOAD
// ==========================================
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

// Refresh on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});
