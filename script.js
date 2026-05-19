/* =====================================================
   VELOX AUTOMOTIVE — BEYOND SPEED
   Interactive Experience Engine
   ===================================================== */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// =====================================================
// CUSTOM CURSOR
// =====================================================
class MagneticCursor {
    constructor() {
        this.cursor = document.getElementById('cursor');
        this.dot = this.cursor.querySelector('.cursor-dot');
        this.ring = this.cursor.querySelector('.cursor-ring');
        this.text = this.cursor.querySelector('.cursor-text');
        this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.speed = 0.15;
        this.isVisible = false;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            if (!this.isVisible) {
                this.isVisible = true;
                this.cursor.style.opacity = '1';
            }
        });

        document.addEventListener('mousedown', () => {
            gsap.to(this.ring, { scale: 0.8, duration: 0.2 });
        });

        document.addEventListener('mouseup', () => {
            gsap.to(this.ring, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
        });

        // Interactive elements
        this.setupHoverElements();
        this.animate();
    }

    setupHoverElements() {
        const links = document.querySelectorAll('a, button, .gallery-item, .bento-card, .color-option');
        links.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
        });

        // Text cursor elements
        const textElements = document.querySelectorAll('[data-cursor]');
        textElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('text-mode');
                this.text.textContent = el.dataset.cursor;
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('text-mode');
                this.text.textContent = '';
            });
        });
    }

    animate() {
        this.pos.x += (this.mouse.x - this.pos.x) * this.speed;
        this.pos.y += (this.mouse.y - this.pos.y) * this.speed;

        this.dot.style.transform = `translate(${this.mouse.x}px, ${this.mouse.y}px) translate(-50%, -50%)`;
        this.ring.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px) translate(-50%, -50%)`;
        this.text.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px) translate(-50%, -50%)`;

        requestAnimationFrame(() => this.animate());
    }
}


// =====================================================
// MAGNETIC ELEMENTS
// =====================================================
class MagneticEffect {
    constructor() {
        this.elements = document.querySelectorAll('.magnetic-element');
        this.init();
    }

    init() {
        this.elements.forEach(el => {
            const strength = parseInt(el.dataset.strength) || 20;

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(el, {
                    x: x * (strength / 100),
                    y: y * (strength / 100),
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.3)'
                });
            });
        });
    }
}

// =====================================================
// INTRO ANIMATION SEQUENCE
// =====================================================
class IntroSequence {
    constructor(onComplete) {
        this.intro = document.getElementById('intro');
        this.counter = document.getElementById('introCounter');
        this.onComplete = onComplete;
        this.init();
    }

    init() {
        this.createParticles();
        this.playSequence();
    }

    createParticles() {
        const container = document.getElementById('introParticles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (2 + Math.random() * 3) + 's';
            container.appendChild(particle);
        }
    }

    playSequence() {
        const tl = gsap.timeline({
            onComplete: () => this.exitIntro()
        });

        // Logo draw
        tl.to('.intro-logo', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.3)
          .to('.logo-path', {
              strokeDashoffset: 0,
              duration: 1.5,
              ease: 'power2.inOut',
              stagger: 0.2
          }, 0.5);

        // Tagline words
        tl.to('.intro-word', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.15
        }, 1.2);

        // Counter animation
        tl.to('.intro-line', { height: 60, duration: 1.5, ease: 'power2.inOut' }, 1);

        // Count up
        const countObj = { value: 0 };
        tl.to(countObj, {
            value: 100,
            duration: 2.5,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.counter.textContent = Math.round(countObj.value);
            }
        }, 1.5);
    }

    exitIntro() {
        const tl = gsap.timeline({
            onComplete: () => {
                this.intro.classList.add('complete');
                gsap.set(this.intro, { display: 'none' });
                if (this.onComplete) this.onComplete();
            }
        });

        tl.to('.intro-content', {
            scale: 0.9,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.in'
        })
        .to('.reveal-panel.left', {
            scaleX: 0,
            duration: 1,
            ease: 'power4.inOut'
        }, 0.3)
        .to('.reveal-panel.right', {
            scaleX: 0,
            duration: 1,
            ease: 'power4.inOut'
        }, 0.3)
        .to(this.intro, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.8,
            ease: 'power3.inOut'
        }, 0.8);
    }
}


// =====================================================
// HERO SECTION ANIMATIONS
// =====================================================
class HeroAnimations {
    constructor() {
        this.heroCar = document.getElementById('heroCar');
        this.init();
    }

    init() {
        this.animateIn();
        this.setupParallax();
    }

    animateIn() {
        const tl = gsap.timeline({ delay: 0.2 });

        tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
          .to('.title-word', {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              stagger: 0.15
          }, 0.2)
          .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.6)
          .to('.hero-cta-group', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.8)
          .to('.spec-bubble', {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              stagger: 0.2
          }, 1);
    }

    setupParallax() {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;

            gsap.to('.car-silhouette', {
                rotateY: x * 5,
                rotateX: -y * 3,
                x: x * 20,
                y: y * 10,
                duration: 1,
                ease: 'power2.out'
            });

            gsap.to('.car-glow', {
                x: x * 30,
                y: y * 15,
                duration: 1.5,
                ease: 'power2.out'
            });

            gsap.to('.spec-bubble', {
                x: (i) => x * (8 + i * 4),
                y: (i) => y * (5 + i * 3),
                duration: 1.2,
                ease: 'power2.out'
            });

            gsap.to('.hero-grid', {
                x: x * -10,
                y: y * -10,
                duration: 2,
                ease: 'power2.out'
            });
        });
    }
}

// =====================================================
// SCROLL ANIMATIONS
// =====================================================
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollProgress();
        this.setupNavigation();
        this.setupPhilosophy();
        this.setupSpecs();
        this.setupGallery();
        this.setupConfigurator();
        this.setupBentoGlow();
    }

    setupScrollProgress() {
        const progressBar = document.getElementById('scrollProgress');
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrolled / total) * 100;
            progressBar.style.width = progress + '%';
        });
    }

    setupNavigation() {
        const nav = document.getElementById('nav');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
        });
    }

    setupPhilosophy() {
        // Title reveal
        gsap.to('.phil-line .split-text', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.philosophy',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });

        // Text block
        gsap.to('.philosophy-text', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.philosophy-right',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });

        // Stats
        gsap.to('.stat-item', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.philosophy-stats',
                start: 'top 80%',
                toggleActions: 'play none none reverse',
                onEnter: () => this.animateStats()
            }
        });

        // Section label
        ScrollTrigger.create({
            trigger: '.philosophy',
            start: 'top 70%',
            onEnter: () => {
                document.querySelector('.philosophy .section-label')
                    ?.closest('.philosophy')?.classList.add('in-view');
            }
        });

        // Clip-path reveal
        gsap.to('#philosophyClip', {
            clipPath: 'inset(0% 0% 0% 0% round 24px)',
            ease: 'power3.inOut',
            scrollTrigger: {
                trigger: '.philosophy-visual',
                start: 'top 80%',
                end: 'center center',
                scrub: 1.5
            }
        });
    }


    animateStats() {
        document.querySelectorAll('.stat-item').forEach(item => {
            const target = parseInt(item.dataset.value);
            const numEl = item.querySelector('.stat-number');
            const obj = { value: 0 };
            gsap.to(obj, {
                value: target,
                duration: 2,
                ease: 'power2.out',
                onUpdate: () => {
                    numEl.textContent = Math.round(obj.value).toLocaleString();
                }
            });
        });
    }

    setupSpecs() {
        // Title reveal
        gsap.to('.specs-line .split-text', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.specs-header',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });

        // Section label
        ScrollTrigger.create({
            trigger: '.specs',
            start: 'top 70%',
            onEnter: () => {
                document.querySelector('.specs .section-label')
                    ?.closest('.specs')?.classList.add('in-view');
            }
        });

        // Bento cards staggered reveal
        gsap.to('.bento-card', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.specs-bento',
                start: 'top 75%',
                toggleActions: 'play none none reverse',
                onEnter: () => this.animateBentoValues()
            }
        });

        // Graph bars
        ScrollTrigger.create({
            trigger: '.bento-graph',
            start: 'top 85%',
            onEnter: () => {
                document.querySelectorAll('.graph-bar').forEach(bar => {
                    bar.style.height = bar.dataset.width + '%';
                });
            }
        });
    }

    animateBentoValues() {
        document.querySelectorAll('.bento-value[data-count]').forEach(el => {
            const target = parseFloat(el.dataset.count);
            const isDecimal = target % 1 !== 0;
            const obj = { value: 0 };
            gsap.to(obj, {
                value: target,
                duration: 2,
                ease: 'power2.out',
                delay: 0.3,
                onUpdate: () => {
                    el.textContent = isDecimal
                        ? obj.value.toFixed(1)
                        : Math.round(obj.value).toLocaleString();
                }
            });
        });
    }

    setupGallery() {
        // Title reveal
        gsap.to('.gallery-line .split-text', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.gallery-header',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });

        // Section label
        ScrollTrigger.create({
            trigger: '.gallery',
            start: 'top 70%',
            onEnter: () => {
                document.querySelector('.gallery .section-label')
                    ?.closest('.gallery')?.classList.add('in-view');
            }
        });
    }

    setupConfigurator() {
        // Title reveal
        gsap.to('.config-line .split-text', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: '.configurator',
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        });

        // Description
        gsap.to('.configurator-desc', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.configurator-desc',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });

        // Section label
        ScrollTrigger.create({
            trigger: '.configurator',
            start: 'top 70%',
            onEnter: () => {
                document.querySelector('.configurator .section-label')
                    ?.closest('.configurator')?.classList.add('in-view');
            }
        });
    }

    setupBentoGlow() {
        document.querySelectorAll('.bento-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });
    }
}


// =====================================================
// GALLERY CAROUSEL
// =====================================================
class GalleryCarousel {
    constructor() {
        this.track = document.getElementById('galleryTrack');
        this.progressBar = document.getElementById('galleryProgressBar');
        this.items = document.querySelectorAll('.gallery-item');
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.scrollLeft = 0;
        this.position = 0;
        this.init();
    }

    init() {
        this.setupButtons();
        this.setupDrag();
        this.updateProgress();
    }

    setupButtons() {
        document.getElementById('galleryPrev')?.addEventListener('click', () => this.prev());
        document.getElementById('galleryNext')?.addEventListener('click', () => this.next());
    }

    prev() {
        this.currentIndex = Math.max(0, this.currentIndex - 1);
        this.goTo(this.currentIndex);
    }

    next() {
        this.currentIndex = Math.min(this.items.length - 1, this.currentIndex + 1);
        this.goTo(this.currentIndex);
    }

    goTo(index) {
        const item = this.items[index];
        if (!item) return;

        const itemWidth = item.offsetWidth + 32; // gap
        this.position = -index * itemWidth;

        gsap.to(this.track, {
            x: this.position,
            duration: 0.8,
            ease: 'power3.out'
        });

        this.updateProgress();
    }

    setupDrag() {
        let startX, startPos;

        this.track.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            startX = e.clientX;
            startPos = this.position;
            this.track.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - startX;
            this.position = startPos + dx;
            gsap.set(this.track, { x: this.position });
        });

        document.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.track.style.cursor = 'grab';

            // Snap to nearest
            const itemWidth = this.items[0].offsetWidth + 32;
            this.currentIndex = Math.round(Math.abs(this.position) / itemWidth);
            this.currentIndex = Math.max(0, Math.min(this.items.length - 1, this.currentIndex));
            this.goTo(this.currentIndex);
        });
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.items.length) * 100;
        if (this.progressBar) {
            this.progressBar.style.width = progress + '%';
        }
    }
}

// =====================================================
// CONFIGURATOR
// =====================================================
class Configurator {
    constructor() {
        this.options = document.querySelectorAll('.color-option');
        this.carBody = document.getElementById('configCarBody');
        this.thumb = document.getElementById('config360Thumb');
        this.isDragging = false;
        this.init();
    }

    init() {
        this.setupColorSelection();
        this.setup360();
    }

    setupColorSelection() {
        this.options.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active state
                this.options.forEach(o => o.classList.remove('active'));
                option.classList.add('active');

                // Update car color
                const hue = option.dataset.hue;
                const color = option.style.getPropertyValue('--c');

                gsap.to(this.carBody, {
                    background: `linear-gradient(135deg, ${color}, ${this.lightenColor(color, 30)})`,
                    duration: 0.8,
                    ease: 'power2.inOut'
                });

                // Pulse effect
                gsap.fromTo(this.carBody, 
                    { filter: 'brightness(1.3)' },
                    { filter: 'brightness(1)', duration: 0.6 }
                );
            });
        });
    }

    lightenColor(hex, amount) {
        // Simple lighten for gradient
        return hex.replace(/^#/, '').match(/.{2}/g)
            ? hex
            : hex;
    }

    setup360() {
        if (!this.thumb) return;
        const track = this.thumb.parentElement;
        let startX, thumbLeft;

        this.thumb.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            startX = e.clientX;
            thumbLeft = this.thumb.offsetLeft;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - startX;
            const trackWidth = track.offsetWidth;
            let newLeft = ((thumbLeft + dx) / trackWidth) * 100;
            newLeft = Math.max(0, Math.min(100, newLeft));
            this.thumb.style.left = newLeft + '%';

            // Rotate car based on position
            const rotation = (newLeft / 100) * 360 - 180;
            gsap.to(this.carBody, {
                rotateY: rotation * 0.1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }
}


// =====================================================
// TILT EFFECT FOR CARDS
// =====================================================
class TiltEffect {
    constructor() {
        this.cards = document.querySelectorAll('[data-tilt]');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(card, {
                    rotateX: -y * 8,
                    rotateY: x * 8,
                    transformPerspective: 1000,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    }
}

// =====================================================
// SMOOTH SCROLL NAVIGATION
// =====================================================
class SmoothNavigation {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    gsap.to(window, {
                        scrollTo: { y: target, offsetY: 80 },
                        duration: 1.2,
                        ease: 'power3.inOut'
                    });
                }
            });
        });
    }
}

// =====================================================
// PARALLAX SCROLL EFFECTS
// =====================================================
class ParallaxEffects {
    constructor() {
        this.init();
    }

    init() {
        // Hero car parallax on scroll
        gsap.to('.hero-car', {
            y: -80,
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            }
        });

        // Hero content fade
        gsap.to('.hero-content', {
            opacity: 0,
            y: -50,
            scrollTrigger: {
                trigger: '.hero',
                start: '30% top',
                end: '60% top',
                scrub: 1
            }
        });

        // Floating specs fade
        gsap.to('.car-specs-float', {
            opacity: 0,
            scrollTrigger: {
                trigger: '.hero',
                start: '20% top',
                end: '50% top',
                scrub: 1
            }
        });

        // Philosophy background parallax
        gsap.to('.philosophy-lines', {
            y: -100,
            scrollTrigger: {
                trigger: '.philosophy',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2
            }
        });
    }
}


// =====================================================
// MARQUEE SPEED CONTROL
// =====================================================
class MarqueeEffect {
    constructor() {
        this.track = document.querySelector('.marquee-track');
        this.speed = 1;
        this.init();
    }

    init() {
        if (!this.track) return;

        // Speed up on hover
        this.track.addEventListener('mouseenter', () => {
            this.track.style.animationDuration = '10s';
        });

        this.track.addEventListener('mouseleave', () => {
            this.track.style.animationDuration = '20s';
        });

        // Reverse on scroll direction
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll < lastScroll) {
                this.track.style.animationDirection = 'reverse';
            } else {
                this.track.style.animationDirection = 'normal';
            }
            lastScroll = currentScroll;
        });
    }
}

// =====================================================
// SCROLL-DRIVEN REVEAL FOR SECTION LABELS
// =====================================================
class SectionReveals {
    constructor() {
        this.init();
    }

    init() {
        // Observe sections for the label line animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.philosophy, .specs, .gallery, .configurator').forEach(section => {
            observer.observe(section);
        });
    }
}

// =====================================================
// TEXT SCRAMBLE EFFECT
// =====================================================
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}


// =====================================================
// HOVER RIPPLE EFFECT ON BUTTONS
// =====================================================
class RippleEffect {
    constructor() {
        this.buttons = document.querySelectorAll('.hero-btn, .btn-reserve, .btn-configure');
        this.init();
    }

    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('mouseenter', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    transform: translate(-50%, -50%);
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                    z-index: 0;
                `;
                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);

                gsap.to(ripple, {
                    width: 300,
                    height: 300,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    onComplete: () => ripple.remove()
                });
            });
        });
    }
}

// =====================================================
// FLOATING PARTICLES BACKGROUND
// =====================================================
class FloatingParticles {
    constructor() {
        this.container = document.querySelector('.hero-particles');
        this.particles = [];
        this.init();
    }

    init() {
        if (!this.container) return;
        for (let i = 0; i < 30; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        const size = Math.random() * 3 + 1;
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${Math.random() > 0.5 ? 'var(--color-accent)' : 'var(--color-accent-2)'};
            border-radius: 50%;
            opacity: ${Math.random() * 0.5};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            pointer-events: none;
        `;
        this.container.appendChild(particle);

        gsap.to(particle, {
            y: `random(-100, 100)`,
            x: `random(-50, 50)`,
            opacity: `random(0, 0.6)`,
            duration: `random(3, 8)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random() * 3
        });
    }
}

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    // Start intro sequence, then reveal everything
    const intro = new IntroSequence(() => {
        // Show navigation
        const nav = document.getElementById('nav');
        nav.classList.add('visible');

        // Initialize all systems
        new HeroAnimations();
        new ScrollAnimations();
        new GalleryCarousel();
        new Configurator();
        new TiltEffect();
        new SmoothNavigation();
        new ParallaxEffects();
        new MarqueeEffect();
        new SectionReveals();
        new RippleEffect();
        new FloatingParticles();
    });

    // Custom cursor (init immediately)
    if (window.innerWidth > 768) {
        new MagneticCursor();
        new MagneticEffect();
    }
});

// Prevent FOUC
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
