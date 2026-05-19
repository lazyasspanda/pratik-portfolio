/* ==============================================
   PRESTIGE MOTORS — Awwwards-Level Engine
   Three.js + Lenis + GSAP + Custom Interactions
   ============================================== */

gsap.registerPlugin(ScrollTrigger);

// ===== LENIS SMOOTH SCROLL =====
const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const cursorDot = cursor?.querySelector('.cursor__dot');
const cursorRing = cursor?.querySelector('.cursor__ring');
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
document.addEventListener('mousedown', () => gsap.to(cursorRing, { scale: 0.8, duration: 0.15 }));
document.addEventListener('mouseup', () => gsap.to(cursorRing, { scale: 1, duration: 0.4, ease: 'elastic.out(1,0.3)' }));

function animateCursor() {
    pos.x += (mouse.x - pos.x) * 0.12;
    pos.y += (mouse.y - pos.y) * 0.12;
    if (cursorDot) cursorDot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%,-50%)`;
    if (cursorRing) cursorRing.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateCursor);
}
if (window.innerWidth > 768) animateCursor();

// Hover state
document.querySelectorAll('a, button, .car-card, .bento__card, .faq__q').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ===== MAGNETIC ELEMENTS =====
document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.2, y: y * 0.2, duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.3)' });
    });
});


// ===== THREE.JS SCENE =====
const canvas = document.getElementById('webglCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4.5;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Wireframe Icosahedron
const geo = new THREE.IcosahedronGeometry(1.8, 1);
const mat = new THREE.MeshBasicMaterial({ color: 0xc9a96e, wireframe: true, transparent: true, opacity: 0.35 });
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

// Particles
const particleCount = 200;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) positions[i] = (Math.random() - 0.5) * 8;
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({ color: 0xc9a96e, size: 0.015, transparent: true, opacity: 0.6 });
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

let threeOpacity = 1;
let targetRotX = 0, targetRotY = 0;

document.addEventListener('mousemove', (e) => {
    targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.5;
    targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.5;
});

// Scroll fade
ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => { threeOpacity = 1 - self.progress * 1.5; }
});

function animateThree() {
    requestAnimationFrame(animateThree);
    mesh.rotation.x += 0.002;
    mesh.rotation.y += 0.003;
    mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.02;
    mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.02;
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0003;
    mat.opacity = Math.max(0, 0.35 * threeOpacity);
    particleMat.opacity = Math.max(0, 0.6 * threeOpacity);
    renderer.render(scene, camera);
}
animateThree();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// ===== PRELOADER =====
const preloader = document.getElementById('preloader');
const preloaderCounter = document.getElementById('preloaderCounter');
const preloaderProgress = document.getElementById('preloaderProgress');
let count = { val: 0 };

gsap.to(count, {
    val: 100,
    duration: 2.8,
    ease: 'power2.inOut',
    onUpdate: () => {
        const v = Math.round(count.val);
        preloaderCounter.textContent = v;
        preloaderProgress.style.width = v + '%';
    },
    onComplete: () => {
        gsap.to('.preloader__brand', { opacity: 1, duration: 0.6 });
        gsap.to(preloader, {
            delay: 0.8,
            onStart: () => preloader.classList.add('done'),
            onComplete: () => { initPageAnimations(); }
        });
    }
});

// ===== TEXT SPLITTING =====
function splitText() {
    document.querySelectorAll('[data-split="words"]').forEach(el => {
        const words = el.textContent.trim().split(/\s+/);
        el.innerHTML = words.map(w => `<span class="word"><span>${w}</span></span>`).join(' ');
    });
    document.querySelectorAll('[data-split="chars"]').forEach(el => {
        const chars = el.textContent.trim().split('');
        el.innerHTML = chars.map(c => c === ' ' ? ' ' : `<span class="char">${c}</span>`).join('');
    });
}
splitText();

// ===== PAGE ANIMATIONS =====
function initPageAnimations() {
    // Nav
    gsap.to('.nav', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    document.querySelector('.nav').style.opacity = '0';
    document.querySelector('.nav').style.transform = 'translateY(-20px)';
    gsap.to('.nav', { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });

    // Hero chars
    gsap.to('.hero__title .char', {
        opacity: 1, y: 0, rotateX: 0,
        duration: 1, stagger: 0.03, ease: 'power3.out', delay: 0.1
    });
    gsap.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' });
    gsap.to('.hero__sub', { opacity: 1, y: 0, duration: 0.8, delay: 0.7, ease: 'power3.out' });
    gsap.to('.hero__ctas', { opacity: 1, y: 0, duration: 0.8, delay: 0.9, ease: 'power3.out' });

    // Nav scroll effect
    ScrollTrigger.create({
        trigger: '.hero',
        start: 'top top',
        end: '80px top',
        onLeave: () => document.querySelector('.nav').classList.add('scrolled'),
        onEnterBack: () => document.querySelector('.nav').classList.remove('scrolled')
    });

    // Section title reveals
    document.querySelectorAll('.section-title').forEach(title => {
        ScrollTrigger.create({
            trigger: title,
            start: 'top 80%',
            onEnter: () => title.classList.add('in-view'),
            once: true
        });
    });

    // Fade-up elements
    document.querySelectorAll('[data-animate="fade-up"]').forEach(el => {
        gsap.to(el, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        });
    });

    // About clip reveal
    ScrollTrigger.create({
        trigger: '.about__media',
        start: 'top 75%',
        onEnter: () => document.querySelector('.about__media').classList.add('in-view'),
        once: true
    });

    // Car cards
    document.querySelectorAll('.car-card').forEach((card, i) => {
        gsap.to(card, {
            opacity: 1, y: 0, duration: 0.7, delay: i * 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' }
        });
        card.classList.add('in-view-ready');
    });

    // Bento cards
    document.querySelectorAll('.bento__card').forEach((card, i) => {
        gsap.to(card, {
            opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' }
        });
        // Mouse glow
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
            card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
        });
    });

    // FAQ items
    document.querySelectorAll('.faq__item').forEach((item, i) => {
        gsap.to(item, {
            opacity: 1, y: 0, duration: 0.6, delay: i * 0.06, ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' }
        });
        item.classList.add('in-view');
    });

    // Stat counters
    document.querySelectorAll('.stat__num').forEach(num => {
        const target = parseInt(num.dataset.count);
        ScrollTrigger.create({
            trigger: num,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(num, { innerText: target, duration: 2, snap: { innerText: 1 }, ease: 'power2.out' });
            }
        });
    });

    // Horizontal showcase
    const track = document.getElementById('showcaseTrack');
    if (track) {
        const scrollW = track.scrollWidth - window.innerWidth + 100;
        gsap.to(track, {
            x: -scrollW,
            ease: 'none',
            scrollTrigger: { trigger: '.showcase', start: 'top 5%', end: () => `+=${scrollW}`, scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
        });
    }
}


// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq__item').forEach(item => {
    const btn = item.querySelector('.faq__q');
    const answer = item.querySelector('.faq__a');
    btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq__item').forEach(other => {
            if (other !== item) {
                other.classList.remove('active');
                gsap.to(other.querySelector('.faq__a'), { maxHeight: 0, duration: 0.3, ease: 'power2.inOut' });
            }
        });
        if (isActive) {
            item.classList.remove('active');
            gsap.to(answer, { maxHeight: 0, duration: 0.3, ease: 'power2.inOut' });
        } else {
            item.classList.add('active');
            gsap.to(answer, { maxHeight: answer.scrollHeight, duration: 0.4, ease: 'power2.out' });
        }
    });
});

// ===== TESTIMONIALS =====
const testimonials = document.querySelectorAll('.testimonial');
const testBar = document.getElementById('testimonialBar');
let currentTest = 0;
function showTestimonial(idx) {
    testimonials.forEach(t => t.classList.remove('active'));
    testimonials[idx].classList.add('active');
    if (testBar) testBar.style.width = ((idx + 1) / testimonials.length * 100) + '%';
}
document.getElementById('testNext')?.addEventListener('click', () => { currentTest = (currentTest + 1) % testimonials.length; showTestimonial(currentTest); });
document.getElementById('testPrev')?.addEventListener('click', () => { currentTest = (currentTest - 1 + testimonials.length) % testimonials.length; showTestimonial(currentTest); });
// Auto-rotate
setInterval(() => { currentTest = (currentTest + 1) % testimonials.length; showTestimonial(currentTest); }, 6000);

// ===== BACK TO TOP =====
document.getElementById('backToTop')?.addEventListener('click', () => { lenis.scrollTo(0); });

// ===== SMOOTH NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) lenis.scrollTo(target, { offset: -80 });
    });
});

// ===== SCROLL TRIGGER REFRESH =====
window.addEventListener('load', () => ScrollTrigger.refresh());
window.addEventListener('resize', () => { clearTimeout(window._rt); window._rt = setTimeout(() => ScrollTrigger.refresh(), 250); });
