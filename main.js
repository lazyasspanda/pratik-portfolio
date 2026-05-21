/* AETHER DRIVE — premium automotive interaction layer
 * Vanilla JS · GSAP + ScrollTrigger + Lenis (CDN)
 */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- GSAP setup ----------
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ---------- Smooth scroll (Lenis) ----------
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  // ---------- Helper: split words ----------
  const splitWords = (el) => {
    if (el.dataset.split === '1') return;
    el.dataset.split = '1';
    const text = el.textContent;
    el.textContent = '';
    const words = text.trim().split(/\s+/);
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w + (i < words.length - 1 ? ' ' : '');
      el.appendChild(span);
    });
  };
  document.querySelectorAll('.split-text').forEach(splitWords);

  // ---------- Reveals on scroll ----------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.classList.contains('split-text')) {
          el.querySelectorAll('.word').forEach((w, i) => {
            setTimeout(() => w.classList.add('is-in'), i * 70);
          });
        } else {
          el.classList.add('is-revealed');
        }
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-target, .split-text').forEach((el) => revealObserver.observe(el));

  // ---------- Custom cursor ----------
  if (isFinePointer) {
    const cursor = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    }, { passive: true });
    const animateRing = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();
    const hoverEls = 'a, button, [data-magnetic], [data-magnetic-soft], select, input, textarea, .spec-tile, .inv-card, .feat, .showcase-rail-card, .motion-card';
    document.querySelectorAll(hoverEls).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor && cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('is-hover'));
    });
    // Light section detection for cursor color
    const lightSections = document.querySelectorAll('.showcase--light, .features--light, .motion--light, .chapter--light');
    const lsObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.4) {
          cursor && cursor.classList.add('is-light');
        } else {
          // Re-evaluate
          const stillLight = Array.from(lightSections).some((s) => {
            const r = s.getBoundingClientRect();
            return r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
          });
          if (cursor) cursor.classList.toggle('is-light', stillLight);
        }
      });
    }, { threshold: [0, 0.4, 0.6, 1] });
    lightSections.forEach((s) => lsObserver.observe(s));
  }

  // ---------- Magnetic buttons ----------
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    if (!isFinePointer) return;
    let bx = 0, by = 0, tx = 0, ty = 0;
    const strength = 0.35;
    const animate = () => {
      bx += (tx - bx) * 0.18;
      by += (ty - by) * 0.18;
      el.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
      const label = el.querySelector('.magnetic-label');
      if (label) label.style.transform = `translate3d(${bx * 0.4}px, ${by * 0.4}px, 0)`;
      requestAnimationFrame(animate);
    };
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * strength;
      ty = (e.clientY - r.top - r.height / 2) * strength;
    });
    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    animate();
  });
  document.querySelectorAll('[data-magnetic-soft]').forEach((el) => {
    if (!isFinePointer) return;
    let bx = 0, by = 0, tx = 0, ty = 0;
    const strength = 0.18;
    const animate = () => {
      bx += (tx - bx) * 0.14;
      by += (ty - by) * 0.14;
      el.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
      requestAnimationFrame(animate);
    };
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * strength;
      ty = (e.clientY - r.top - r.height / 2) * strength;
    });
    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    animate();
  });

  // ---------- Nav scroll state + light/dark switch ----------
  const nav = document.getElementById('nav');
  const lightSections = document.querySelectorAll('.showcase--light, .features--light, .motion--light, .chapter--light');
  const updateNavTheme = () => {
    if (!nav) return;
    const navMid = nav.offsetHeight / 2 + 10;
    let onLight = false;
    lightSections.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.top <= navMid && r.bottom > navMid) onLight = true;
    });
    nav.classList.toggle('on-light', onLight);
  };
  window.addEventListener('scroll', () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    updateNavTheme();
  }, { passive: true });
  updateNavTheme();

  // ---------- Mobile nav overlay ----------
  const burger = document.getElementById('navBurger');
  const overlay = document.getElementById('navOverlay');
  if (burger && overlay) {
    burger.addEventListener('click', () => {
      const open = overlay.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    overlay.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        overlay.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }


  // ============================================================
  // HERO — choreographed entrance + reveal lens + parallax
  // ============================================================
  const hero = document.getElementById('hero');
  if (hero && window.gsap && !reduceMotion) {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-grad', { opacity: 0, duration: 1.0 })
      .from('.lens-layer--base', { opacity: 0, duration: 1.4 }, 0)
      .from('.lens-tag', { opacity: 0, y: 10, duration: 0.8, stagger: 0.1 }, 0.5)
      .from('.hero-meta', { opacity: 0, y: -10, duration: 0.8 }, 0.4)
      .from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.8 }, 0.5)
      .to('.hero-bottom-line .line-grow', { scaleX: 1, duration: 1.4, ease: 'power3.inOut' }, 0.8)
      .from('.hero-search', { opacity: 0, y: 40, duration: 0.9 }, 0.7)
      .from('.hero-cta > *', { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 }, 0.9);
  }

  // Hero parallax — subtle 3D mouse tilt on lens vehicles + bg
  if (hero && isFinePointer && !reduceMotion) {
    const stage = document.getElementById('heroStage');
    const baseBg = document.querySelector('.lens-layer--base .lens-bg');
    const baseV = document.querySelector('.lens-layer--base .lens-vehicle');
    const revealBg = document.querySelector('.lens-layer--reveal .lens-bg');
    const revealV = document.querySelector('.lens-layer--reveal .lens-vehicle');
    let tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    hero.addEventListener('mousemove', onMove, { passive: true });
    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      if (baseBg) baseBg.style.transform = `translate3d(${x * -22}px, ${y * -16}px, 0) scale(1.08)`;
      if (revealBg) revealBg.style.transform = `translate3d(${x * -22}px, ${y * -16}px, 0) scale(1.08)`;
      if (baseV) baseV.style.transform = `translate3d(${x * 36}px, ${y * 18}px, 0)`;
      if (revealV) revealV.style.transform = `translate3d(${x * 36}px, ${y * 18}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  // Hero scroll parallax (depth in motion)
  if (window.gsap && window.ScrollTrigger && hero && !reduceMotion) {
    gsap.to('.hero-content', {
      yPercent: 12,
      opacity: 0.4,
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 60%', scrub: 0.6 }
    });
    gsap.to('.hero-search', {
      yPercent: -6,
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 }
    });
  }

  // ============================================================
  // HERO REVEAL LENS (winter ↔ summer)
  // ============================================================
  (function setupLens() {
    const stage = document.getElementById('heroStage');
    const reveal = document.getElementById('lensReveal');
    const cursor = document.getElementById('lensCursor');
    if (!stage || !reveal || !cursor || !hero) return;

    const baseRadius = window.matchMedia('(max-width: 700px)').matches ? 130 : 220;
    let radius = 0;
    let targetRadius = 0;
    let cx = 50, cy = 50; // percent
    let mx = 0, my = 0; // px within stage
    let active = false;

    const setMask = () => {
      reveal.style.setProperty('--lx', cx + '%');
      reveal.style.setProperty('--ly', cy + '%');
      reveal.style.setProperty('--lr', radius + 'px');
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
      const ring = cursor.querySelector('.lens-ring');
      if (ring) {
        const d = Math.max(20, radius * 2);
        ring.style.width = d + 'px';
        ring.style.height = d + 'px';
        ring.style.marginLeft = (-d / 2) + 'px';
        ring.style.marginTop = (-d / 2) + 'px';
      }
    };

    const update = (clientX, clientY) => {
      const r = stage.getBoundingClientRect();
      mx = clientX - r.left;
      my = clientY - r.top;
      cx = (mx / r.width) * 100;
      cy = (my / r.height) * 100;
    };

    const onEnter = (e) => {
      active = true;
      hero.classList.add('is-lens-active');
      stage.classList.add('is-touched');
      update(e.clientX, e.clientY);
      targetRadius = baseRadius;
    };
    const onMove = (e) => {
      if (!active) return;
      update(e.clientX, e.clientY);
    };
    const onLeave = () => {
      active = false;
      targetRadius = 0;
      setTimeout(() => {
        if (!active) {
          hero.classList.remove('is-lens-active');
          stage.classList.remove('is-touched');
        }
      }, 350);
    };

    const onTouch = (e) => {
      if (!e.touches[0]) return;
      active = true;
      hero.classList.add('is-lens-active');
      stage.classList.add('is-touched');
      update(e.touches[0].clientX, e.touches[0].clientY);
      targetRadius = baseRadius;
    };

    if (isFinePointer) {
      hero.addEventListener('mouseenter', onEnter);
      hero.addEventListener('mousemove', onMove);
      hero.addEventListener('mouseleave', onLeave);
    } else {
      hero.addEventListener('touchstart', onTouch, { passive: true });
      hero.addEventListener('touchmove', onTouch, { passive: true });
      hero.addEventListener('touchend', onLeave);
    }

    // Auto-demo: gently breathe the lens once on load to teach the interaction
    setTimeout(() => {
      if (!active) {
        const r = stage.getBoundingClientRect();
        cx = 70; cy = 55; mx = r.width * 0.7; my = r.height * 0.55;
        active = true;
        hero.classList.add('is-lens-active');
        stage.classList.add('is-touched');
        targetRadius = baseRadius * 0.9;
        setTimeout(() => {
          if (!hero.matches(':hover')) {
            targetRadius = 0;
            setTimeout(() => {
              if (!hero.matches(':hover')) {
                active = false;
                hero.classList.remove('is-lens-active');
                stage.classList.remove('is-touched');
              }
            }, 500);
          }
        }, 1600);
      }
    }, 1800);

    const tick = () => {
      radius += (targetRadius - radius) * 0.18;
      setMask();
      requestAnimationFrame(tick);
    };
    tick();
  })();


  // ============================================================
  // INVENTORY SEARCH (live filter, count, scroll to fleet)
  // ============================================================
  (function setupSearch() {
    const form = document.getElementById('heroSearch');
    const fleetCards = document.querySelectorAll('.inv-card');
    const countEl = document.getElementById('hsCount');
    const priceLabel = document.getElementById('hsPriceLabel');
    const priceFill = document.getElementById('hsPriceFill');
    if (!form) return;

    const fmtPrice = (lakh) => {
      const cr = (lakh / 100).toFixed(2);
      return '\u20B9' + cr + ' Cr';
    };

    const compute = () => {
      const data = new FormData(form);
      const model = (data.get('model') || '').toString();
      const body = (data.get('body') || '').toString();
      const drivetrain = (data.get('drivetrain') || '').toString();
      const price = parseInt((data.get('price') || '500').toString(), 10);
      const avails = Array.from(form.querySelectorAll('.hs-toggle.is-active')).map((t) => t.dataset.avail);
      let matches = 0;
      fleetCards.forEach((card) => {
        const ok =
          (!model || card.dataset.model === model) &&
          (!body || card.dataset.body === body) &&
          (!drivetrain || card.dataset.drivetrain === drivetrain) &&
          (parseInt(card.dataset.price, 10) <= price) &&
          (avails.includes(card.dataset.availability));
        card.classList.toggle('is-dimmed', !ok);
        card.classList.toggle('is-match', ok);
        if (ok) matches++;
      });
      if (countEl) countEl.textContent = matches;
      if (priceLabel) priceLabel.textContent = fmtPrice(price);
      if (priceFill) {
        const min = 150, max = 500;
        const pct = ((price - min) / (max - min)) * 100;
        priceFill.style.width = pct + '%';
      }
      const submit = form.querySelector('.hs-submit');
      if (submit) submit.classList.toggle('is-empty', matches === 0);
    };

    form.querySelectorAll('[data-search]').forEach((el) => {
      el.addEventListener('input', compute);
      el.addEventListener('change', compute);
    });
    form.querySelectorAll('.hs-toggle').forEach((tg) => {
      tg.addEventListener('click', (e) => {
        e.preventDefault();
        tg.classList.toggle('is-active');
        compute();
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      compute();
      const fleet = document.getElementById('fleet');
      if (fleet) {
        if (lenis) lenis.scrollTo(fleet, { offset: -100, duration: 1.4 });
        else fleet.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    compute();
  })();


  // ============================================================
  // VEHICLE SHOWCASE — 3D card tilt + parallax
  // ============================================================
  (function setupShowcaseTilt() {
    const stage = document.querySelector('[data-tilt-stage]');
    if (!stage || !isFinePointer || reduceMotion) return;
    const frame = stage.querySelector('.showcase-frame');
    const cards = stage.querySelectorAll('[data-parallax-card]');
    if (!frame) return;
    let tx = 0, ty = 0, x = 0, y = 0;
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    stage.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      frame.style.transform = `translate3d(0,0,0) rotateX(${y * -3}deg) rotateY(${x * 4}deg)`;
      cards.forEach((c) => {
        const depth = parseFloat(c.dataset.parallaxDepth || '0.5');
        const skip = c.classList.contains('showcase-frame');
        if (skip) return;
        c.style.transform = `translate3d(${x * 26 * depth}px, ${y * 16 * depth}px, 0)`;
      });
      requestAnimationFrame(tick);
    };
    tick();
  })();


  // ============================================================
  // FEATURE STORYTELLING — subtle parallax + scroll reveal
  // ============================================================
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.utils.toArray('.feat[data-parallax-card]').forEach((card) => {
      const depth = parseFloat(card.dataset.parallaxDepth || '0.2');
      gsap.fromTo(card, {
        yPercent: 0
      }, {
        yPercent: -depth * 30,
        ease: 'none',
        scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });
    gsap.utils.toArray('.feat-image img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.1 }, {
        scale: 1.0,
        ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });
  }


  // ============================================================
  // CHAPTER IMAGE PARALLAX
  // ============================================================
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.utils.toArray('.image-clip img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });

    // Chapter numerals subtle motion
    gsap.utils.toArray('.chapter-numeral, .showcase-numeral').forEach((n) => {
      gsap.fromTo(n, { y: -50, opacity: 0.5 }, {
        y: 50,
        ease: 'none',
        scrollTrigger: { trigger: n, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });
  }


  // ============================================================
  // SPEC TILES — cursor-following glow
  // ============================================================
  document.querySelectorAll('.spec-tile').forEach((tile) => {
    if (!isFinePointer) return;
    tile.addEventListener('mousemove', (e) => {
      const r = tile.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      tile.style.background = `radial-gradient(220px 160px at ${x}% ${y}%, rgba(196,168,120,0.10), var(--ink))`;
    });
    tile.addEventListener('mouseleave', () => { tile.style.background = ''; });
  });


  // ============================================================
  // EDITORIAL — border grow on enter
  // ============================================================
  (function () {
    const blocks = document.querySelectorAll('.border-grow');
    if (!blocks.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.transform = 'scaleY(1)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    blocks.forEach((b) => obs.observe(b));
  })();


  // ============================================================
  // VEHICLE NARRATIVE — pinned panel switcher
  // ============================================================
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    const narrative = document.querySelector('.narrative');
    if (narrative) {
      const panels = narrative.querySelectorAll('.panel');
      const dots = narrative.querySelectorAll('.dot');
      const total = panels.length;
      ScrollTrigger.create({
        trigger: '.narrative-outer',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const idx = Math.min(total - 1, Math.floor(self.progress * total));
          panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
          dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        }
      });
      // Subtle ken-burns parallax on panel images
      gsap.utils.toArray('.panel-image img').forEach((img) => {
        gsap.to(img, {
          scale: 1.08,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.panel'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      });
    }
  }


  // ============================================================
  // MODES — segmented selector
  // ============================================================
  (function () {
    const root = document.getElementById('modeSelector');
    if (!root) return;
    const segs = root.querySelectorAll('.mode-segment');
    const imgs = document.querySelectorAll('.mode-img');
    const contents = document.querySelectorAll('.mode-content');
    let activeIdx = 0;
    let cycleTimer = null;
    const setActive = (idx) => {
      segs.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      const fills = root.querySelectorAll('.mode-progress-fill');
      fills.forEach((f, i) => { f.style.width = i === idx ? '100%' : (i < idx ? '100%' : '0%'); });
      const mode = segs[idx].dataset.mode;
      imgs.forEach((m) => m.classList.toggle('is-active', m.dataset.modeImg === mode));
      contents.forEach((c) => c.classList.toggle('is-active', c.dataset.modeContent === mode));
      activeIdx = idx;
    };
    segs.forEach((s, i) => s.addEventListener('click', () => {
      setActive(i);
      if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    }));
    cycleTimer = setInterval(() => {
      setActive((activeIdx + 1) % segs.length);
    }, 5500);
  })();


  // ============================================================
  // MOTION CARDS — interactive demos
  // ============================================================
  (function () {
    const inertiaStage = document.querySelector('.motion-stage--inertia');
    if (inertiaStage) {
      const dot = inertiaStage.querySelector('.motion-inertia-dot');
      let tx = 0, ty = 0, x = 0, y = 0;
      inertiaStage.addEventListener('mousemove', (e) => {
        const r = inertiaStage.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * (r.width - 30);
        ty = ((e.clientY - r.top) / r.height - 0.5) * (r.height - 30);
      });
      inertiaStage.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
      const tick = () => {
        x += (tx - x) * 0.08;
        y += (ty - y) * 0.08;
        if (dot) dot.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        requestAnimationFrame(tick);
      };
      tick();
    }

    const stagger = document.querySelector('[data-motion="stagger"]');
    if (stagger) {
      const trigger = () => {
        stagger.classList.remove('is-playing');
        void stagger.offsetWidth;
        stagger.classList.add('is-playing');
      };
      stagger.addEventListener('click', trigger);
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) trigger(); });
      }, { threshold: 0.5 });
      obs.observe(stagger);
    }

    const depth = document.querySelector('.motion-stage--depth');
    if (depth && isFinePointer) {
      const layers = depth.querySelectorAll('.depth-layer');
      const speeds = [0.2, 0.5, 0.8];
      let tx = 0, ty = 0, x = 0, y = 0;
      depth.addEventListener('mousemove', (e) => {
        const r = depth.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 30;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 20;
      });
      depth.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
      const tick = () => {
        x += (tx - x) * 0.08;
        y += (ty - y) * 0.08;
        layers.forEach((l, i) => {
          const s = speeds[i] || 0.5;
          l.style.transform = `translate3d(${x * s}px, ${y * s}px, 0)`;
        });
        requestAnimationFrame(tick);
      };
      tick();
    }
  })();


  // ============================================================
  // INVENTORY — drag-to-scroll horizontal carousel + progress
  // ============================================================
  (function () {
    const wrap = document.getElementById('inventoryWrap');
    const track = document.getElementById('inventoryTrack');
    const fill = document.getElementById('inventoryProgressFill');
    if (!wrap || !track) return;
    let dragging = false, startX = 0, scrollLeftStart = 0;

    const updateProgress = () => {
      if (!fill) return;
      const max = wrap.scrollWidth - wrap.clientWidth;
      const pct = max > 0 ? (wrap.scrollLeft / max) * 100 : 0;
      fill.style.width = pct + '%';
    };
    wrap.addEventListener('scroll', updateProgress, { passive: true });

    wrap.addEventListener('mousedown', (e) => {
      dragging = true;
      wrap.classList.add('is-dragging');
      startX = e.pageX - wrap.offsetLeft;
      scrollLeftStart = wrap.scrollLeft;
    });
    wrap.addEventListener('mouseleave', () => { dragging = false; wrap.classList.remove('is-dragging'); });
    wrap.addEventListener('mouseup', () => { dragging = false; wrap.classList.remove('is-dragging'); });
    wrap.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      e.preventDefault();
      const x = e.pageX - wrap.offsetLeft;
      const walk = (x - startX) * 1.4;
      wrap.scrollLeft = scrollLeftStart - walk;
    });

    // Wheel to horizontal
    wrap.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
        const isAtStart = wrap.scrollLeft === 0 && e.deltaY < 0;
        const isAtEnd = wrap.scrollLeft >= wrap.scrollWidth - wrap.clientWidth && e.deltaY > 0;
        if (!isAtStart && !isAtEnd) {
          wrap.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }
    }, { passive: false });

    updateProgress();
  })();


  // ============================================================
  // FINALE — fade in
  // ============================================================
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    gsap.from('.finale-content > *', {
      opacity: 0, y: 40, duration: 1, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.finale', start: 'top 70%' }
    });
  }


  // ============================================================
  // FLOATING CTA — show after hero, hide near drawer
  // ============================================================
  (function () {
    const cta = document.getElementById('floatingCta');
    if (!cta || !hero) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        cta.classList.toggle('is-visible', !e.isIntersecting);
      });
    }, { threshold: 0.2 });
    obs.observe(hero);
  })();


  // ============================================================
  // CONTACT DRAWER — open/close, focus trap, ESC
  // ============================================================
  (function () {
    const drawer = document.getElementById('contactDrawer');
    if (!drawer) return;
    const panel = drawer.querySelector('.drawer-panel');
    const form = document.getElementById('contactForm');
    const success = document.getElementById('drawerSuccess');
    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      setTimeout(() => {
        const first = drawer.querySelector('input, select, textarea, button');
        if (first) first.focus({ preventScroll: true });
      }, 400);
    };
    const close = () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };

    document.querySelectorAll('[data-open-contact]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        open();
      });
    });
    drawer.querySelectorAll('[data-close-contact]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        close();
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (success) { success.hidden = false; }
        const submit = form.querySelector('.drawer-submit .magnetic-label');
        if (submit) submit.textContent = 'Sent';
        setTimeout(() => {
          form.reset();
          if (success) success.hidden = true;
          if (submit) submit.textContent = 'Send to Atelier';
          close();
        }, 2200);
      });
    }
  })();


  // ============================================================
  // SAFE: refresh ScrollTrigger on resize
  // ============================================================
  if (window.ScrollTrigger) {
    window.addEventListener('load', () => ScrollTrigger.refresh());
    let resizeT;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
  }

  // ---------- Image error fallback grain ----------
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.background = 'linear-gradient(135deg, #1F1F28 0%, #14141B 100%)';
    }, { once: true });
  });

})();
