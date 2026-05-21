/* =============================================================
   AETHER DRIVE — Main interaction script
   Vanilla JS + GSAP (ScrollTrigger) + Lenis (CDN-loaded)
   ============================================================= */
(function () {
  'use strict';

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HAS_GSAP = typeof window.gsap !== 'undefined';
  const HAS_ST = typeof window.ScrollTrigger !== 'undefined';
  const HAS_LENIS = typeof window.Lenis !== 'undefined';

  if (HAS_GSAP && HAS_ST) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* -----------------------------------------------------------
     Lenis smooth scroll + GSAP ticker integration
     ----------------------------------------------------------- */
  let lenis = null;
  function initLenis() {
    if (REDUCED_MOTION || !HAS_LENIS) return;
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.4,
      wheelMultiplier: 1.0,
    });

    if (HAS_GSAP) {
      lenis.on('scroll', window.ScrollTrigger ? window.ScrollTrigger.update : () => {});
      window.gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
  }

  /* -----------------------------------------------------------
     Custom cursor
     ----------------------------------------------------------- */
  function initCursor() {
    if (window.matchMedia('(hover: none)').matches || window.innerWidth < 900) return;
    const cursor = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!cursor || !dot || !ring) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my;
    const dotLerp = 1.0;
    const ringLerp = 0.18;


    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.remove('is-hidden');
    });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));

    function tick() {
      dx += (mx - dx) * dotLerp;
      dy += (my - dy) * dotLerp;
      rx += (mx - rx) * ringLerp;
      ry += (my - ry) * ringLerp;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    const interactive = 'a, button, [data-magnetic], [data-magnetic-soft], .spec-tile, .motion-card, .inv-card, .mode-segment, input, textarea, select';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest && e.target.closest(interactive)) cursor.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest && e.target.closest(interactive)) cursor.classList.remove('is-hover');
    });
  }

  /* -----------------------------------------------------------
     Magnetic buttons
     ----------------------------------------------------------- */
  function initMagnetic() {
    if (REDUCED_MOTION) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const els = document.querySelectorAll('[data-magnetic], [data-magnetic-soft]');
    els.forEach((el) => {
      const label = el.querySelector('.magnetic-label') || el;
      const soft = el.hasAttribute('data-magnetic-soft');
      const strength = soft ? 0.18 : 0.4;
      const wrapStrength = soft ? 0.1 : 0.25;
      let tx = 0, ty = 0, lx = 0, ly = 0;
      let wx = 0, wy = 0, wtx = 0, wty = 0;
      let raf = null;

      function loop() {
        wx += (wtx - wx) * 0.15;
        wy += (wty - wy) * 0.15;
        lx += (tx - lx) * 0.15;
        ly += (ty - ly) * 0.15;
        el.style.transform = `translate3d(${wx}px, ${wy}px, 0)`;
        if (label !== el) label.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
        if (Math.abs(wx - wtx) > 0.05 || Math.abs(wy - wty) > 0.05 ||
            Math.abs(lx - tx) > 0.05 || Math.abs(ly - ty) > 0.05) {
          raf = requestAnimationFrame(loop);
        } else {
          raf = null;
        }
      }
      function start() { if (!raf) raf = requestAnimationFrame(loop); }

      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2));
        const dy = (e.clientY - (r.top + r.height / 2));
        wtx = dx * wrapStrength;
        wty = dy * wrapStrength;
        tx = dx * strength;
        ty = dy * strength;
        start();
      });
      el.addEventListener('mouseleave', () => {
        wtx = 0; wty = 0; tx = 0; ty = 0;
        start();
      });
    });
  }

  /* -----------------------------------------------------------
     Split text into words/chars (for headlines)
     ----------------------------------------------------------- */
  function splitText(el) {
    if (!el || el.dataset.split === '1') return;
    const words = el.textContent.split(/(\s+)/);
    el.textContent = '';
    const lineWrap = document.createElement('span');
    lineWrap.className = 'split-line';
    el.appendChild(lineWrap);
    words.forEach((w) => {
      if (/^\s+$/.test(w)) {
        const sp = document.createElement('span');
        sp.className = 'split-word';
        sp.textContent = ' ';
        lineWrap.appendChild(sp);
      } else if (w.length) {
        const sp = document.createElement('span');
        sp.className = 'split-word';
        sp.textContent = w;
        lineWrap.appendChild(sp);
      }
    });
    el.dataset.split = '1';
  }


  function initSplitTexts() {
    document.querySelectorAll('.split-text').forEach(splitText);
  }

  /* -----------------------------------------------------------
     Reveal-on-scroll observer
     ----------------------------------------------------------- */
  function initReveals() {
    const targets = document.querySelectorAll('.reveal-target, .split-line, .image-clip, .hero-image-wrap, .hero-headline, .finale-headline, .editorial-text, .border-grow');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // Stagger words in a split-line
          if (e.target.classList.contains('split-line')) {
            const words = e.target.querySelectorAll('.split-word');
            words.forEach((w, i) => {
              w.style.transitionDelay = `${i * 0.05}s`;
            });
          }
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    targets.forEach((t) => io.observe(t));
  }

  /* -----------------------------------------------------------
     Hero load sequence
     ----------------------------------------------------------- */
  function initHeroSequence() {
    const heroImageWrap = document.querySelector('.hero-image-wrap');
    const heroEyebrow = document.querySelector('.hero-eyebrow .reveal-target');
    const heroHeadline = document.querySelector('.hero-headline');
    const heroBody = document.querySelector('.hero-body .reveal-target');
    const heroCta = document.querySelector('.hero-cta');
    const lineGrow = document.querySelector('.line-grow');
    const heroMeta = document.querySelector('.hero-meta');

    if (REDUCED_MOTION) {
      [heroImageWrap, heroHeadline].forEach((el) => el && el.classList.add('is-in'));
      if (heroEyebrow) heroEyebrow.classList.add('is-in');
      if (heroBody) heroBody.classList.add('is-in');
      if (lineGrow) lineGrow.style.width = '100%';
      return;
    }

    if (heroCta) {
      heroCta.style.opacity = '0';
      heroCta.style.transform = 'translateY(20px)';
      heroCta.style.transition = 'opacity .9s var(--ease-cinematic), transform .9s var(--ease-cinematic)';
    }
    if (heroMeta) {
      heroMeta.style.opacity = '0';
      heroMeta.style.transform = 'translateY(10px)';
      heroMeta.style.transition = 'opacity 1s var(--ease-cinematic), transform 1s var(--ease-cinematic)';
    }
    if (lineGrow) {
      lineGrow.style.transition = 'width 1.6s var(--ease-cinematic)';
    }

    setTimeout(() => { if (heroImageWrap) heroImageWrap.classList.add('is-in'); }, 300);
    setTimeout(() => { if (heroEyebrow) heroEyebrow.classList.add('is-in'); }, 600);
    setTimeout(() => { if (heroHeadline) heroHeadline.classList.add('is-in'); }, 800);
    setTimeout(() => { if (heroBody) heroBody.classList.add('is-in'); }, 1400);
    setTimeout(() => {
      if (heroCta) {
        heroCta.style.opacity = '1';
        heroCta.style.transform = 'translateY(0)';
      }
      if (heroMeta) {
        heroMeta.style.opacity = '1';
        heroMeta.style.transform = 'translateY(0)';
      }
    }, 1800);
    setTimeout(() => { if (lineGrow) lineGrow.style.width = '100%'; }, 2000);
  }

  /* -----------------------------------------------------------
     Hero parallax (scroll)
     ----------------------------------------------------------- */
  function initHeroParallax() {
    if (REDUCED_MOTION || !HAS_GSAP || !HAS_ST) return;
    const img = document.querySelector('.hero-image');
    const content = document.querySelector('.hero-content');
    if (!img || !content) return;

    window.gsap.to(content, {
      y: () => window.innerHeight * 0.25,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
    window.gsap.to(img, {
      y: () => -window.innerHeight * 0.15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }


  /* -----------------------------------------------------------
     Nav scroll states + mobile burger
     ----------------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('navBurger');
    const overlay = document.getElementById('navOverlay');
    if (!nav) return;

    function update() {
      if (window.scrollY > 40) nav.classList.add('is-operational');
      else nav.classList.remove('is-operational');
    }
    update();
    window.addEventListener('scroll', update, { passive: true });

    if (burger && overlay) {
      burger.addEventListener('click', () => {
        const open = burger.classList.toggle('is-open');
        overlay.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      overlay.querySelectorAll('.ovl-link').forEach((a) => {
        a.addEventListener('click', () => {
          burger.classList.remove('is-open');
          overlay.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* -----------------------------------------------------------
     Vehicle Narrative — pinned 4-panel
     ----------------------------------------------------------- */
  function initNarrative() {
    if (!HAS_GSAP || !HAS_ST) return;
    const outer = document.querySelector('.narrative-outer');
    const panels = document.querySelectorAll('.panel');
    const dotsWrap = document.getElementById('narrativeDots');
    const dots = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];
    if (!outer || !panels.length) return;

    let activeIdx = 0;
    function setPanel(i) {
      if (i === activeIdx) return;
      panels.forEach((p, idx) => p.classList.toggle('is-active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
      activeIdx = i;
    }

    window.ScrollTrigger.create({
      trigger: outer,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        let idx = Math.floor(p * panels.length);
        if (idx >= panels.length) idx = panels.length - 1;
        if (idx < 0) idx = 0;
        setPanel(idx);
      },
      onEnter: () => { if (dotsWrap) dotsWrap.classList.add('is-visible'); },
      onLeave: () => { if (dotsWrap) dotsWrap.classList.remove('is-visible'); },
      onEnterBack: () => { if (dotsWrap) dotsWrap.classList.add('is-visible'); },
      onLeaveBack: () => { if (dotsWrap) dotsWrap.classList.remove('is-visible'); },
    });
  }

  /* -----------------------------------------------------------
     Personalization modes
     ----------------------------------------------------------- */
  function initModes() {
    const section = document.querySelector('.modes');
    if (!section) return;
    const segments = section.querySelectorAll('.mode-segment');
    const contents = section.querySelectorAll('.mode-content');
    const images = section.querySelectorAll('.mode-img');
    const fills = section.querySelectorAll('.mode-progress-fill');

    let active = 0;
    let progress = 0;
    let lastTime = performance.now();
    let timer = null;
    const DURATION = 6000;
    section.dataset.activeMode = segments[0].dataset.mode;

    function setActive(i, fromUser) {
      if (i === active && !fromUser) return;
      active = i;
      progress = 0;
      segments.forEach((s, idx) => {
        s.classList.toggle('is-active', idx === i);
        if (fills[idx]) fills[idx].style.width = idx === i ? '0%' : '0%';
      });
      contents.forEach((c, idx) => c.classList.toggle('is-active', idx === i));
      images.forEach((img, idx) => img.classList.toggle('is-active', idx === i));
      section.dataset.activeMode = segments[i].dataset.mode;
      lastTime = performance.now();
    }

    function step(now) {
      const dt = now - lastTime;
      lastTime = now;
      progress += dt;
      const fill = fills[active];
      if (fill) {
        const pct = Math.min(100, (progress / DURATION) * 100);
        fill.style.width = pct + '%';
      }
      if (progress >= DURATION) {
        const next = (active + 1) % segments.length;
        setActive(next);
      }
      timer = requestAnimationFrame(step);
    }


    function startTimer() {
      if (REDUCED_MOTION) return;
      if (!timer) {
        lastTime = performance.now();
        timer = requestAnimationFrame(step);
      }
    }
    function stopTimer() {
      if (timer) { cancelAnimationFrame(timer); timer = null; }
    }

    segments.forEach((s, i) => {
      s.addEventListener('click', () => {
        setActive(i, true);
      });
      s.addEventListener('mouseenter', stopTimer);
      s.addEventListener('mouseleave', startTimer);
    });

    // Only start when scrolled into view
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) startTimer();
          else stopTimer();
        });
      }, { threshold: 0.3 });
      io.observe(section);
    } else {
      startTimer();
    }
  }

  /* -----------------------------------------------------------
     Inventory horizontal scroll + drag + wheel
     ----------------------------------------------------------- */
  function initInventory() {
    const wrap = document.getElementById('inventoryWrap');
    const track = document.getElementById('inventoryTrack');
    const fill = document.getElementById('inventoryProgressFill');
    if (!wrap || !track) return;

    let pos = 0;
    let target = 0;
    let max = 0;
    let isDown = false;
    let startX = 0;
    let startPos = 0;
    let raf = null;

    function recalc() {
      max = Math.max(0, track.scrollWidth - wrap.clientWidth);
      target = clamp(target, 0, max);
      pos = clamp(pos, 0, max);
      apply();
    }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function apply() {
      track.style.transform = `translate3d(${-pos}px, 0, 0)`;
      if (fill && max > 0) {
        fill.style.width = ((pos / max) * 100) + '%';
      } else if (fill) {
        fill.style.width = '0%';
      }
    }

    function loop() {
      pos += (target - pos) * 0.12;
      apply();
      if (Math.abs(target - pos) > 0.3) {
        raf = requestAnimationFrame(loop);
      } else {
        pos = target;
        apply();
        raf = null;
      }
    }
    function start() { if (!raf) raf = requestAnimationFrame(loop); }

    // Wheel translates to horizontal when section is in view
    function inView() {
      const r = wrap.getBoundingClientRect();
      return r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
    }
    wrap.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // Only intercept when fully in view and we have room to scroll
        if (!inView()) return;
        const delta = e.deltaY;
        const next = clamp(target + delta, 0, max);
        if (next !== target) {
          e.preventDefault();
          target = next;
          start();
        }
      }
    }, { passive: false });

    // Drag
    wrap.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.clientX;
      startPos = target;
      wrap.classList.add('is-grabbing');
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      target = clamp(startPos - dx, 0, max);
      start();
    });
    window.addEventListener('mouseup', () => {
      isDown = false;
      wrap.classList.remove('is-grabbing');
    });

    // Touch
    let tStart = 0, tStartPos = 0;
    wrap.addEventListener('touchstart', (e) => {
      tStart = e.touches[0].clientX;
      tStartPos = target;
    }, { passive: true });
    wrap.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - tStart;
      target = clamp(tStartPos - dx, 0, max);
      start();
    }, { passive: true });

    // Prevent links from being draggable
    wrap.querySelectorAll('img, a').forEach((el) => {
      el.addEventListener('dragstart', (e) => e.preventDefault());
    });

    window.addEventListener('resize', recalc);
    setTimeout(recalc, 100);
    setTimeout(recalc, 1500); // after fonts/images settle
  }


  /* -----------------------------------------------------------
     Motion showcase interactions
     ----------------------------------------------------------- */
  function initMotionShowcase() {
    // 03 Inertia
    const inertiaCard = document.querySelector('.motion-card[data-motion="inertia"] .motion-stage');
    const dot = document.querySelector('.motion-inertia-dot');
    if (inertiaCard && dot) {
      let tx = 0, ty = 0, x = 0, y = 0;
      let raf = null;
      function loop() {
        x += (tx - x) * 0.12;
        y += (ty - y) * 0.12;
        dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) {
          raf = requestAnimationFrame(loop);
        } else { raf = null; }
      }
      inertiaCard.addEventListener('mousemove', (e) => {
        const r = inertiaCard.getBoundingClientRect();
        tx = e.clientX - r.left - r.width / 2;
        ty = e.clientY - r.top - r.height / 2;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      inertiaCard.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    }

    // 04 Stagger - click to replay
    const staggerCard = document.querySelector('.motion-card[data-motion="stagger"]');
    if (staggerCard) {
      const lines = staggerCard.querySelectorAll('.stagger-line');
      lines.forEach((l, i) => { l.style.transitionDelay = (i * 0.06) + 's'; });

      function play() {
        staggerCard.classList.remove('is-playing');
        // Force reflow then add
        void staggerCard.offsetWidth;
        staggerCard.classList.add('is-playing');
      }
      staggerCard.addEventListener('click', play);
      // Auto-play on hover
      staggerCard.addEventListener('mouseenter', play);

      // Auto-play once when entering viewport
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => { if (e.isIntersecting) { play(); io.unobserve(e.target); } });
        }, { threshold: 0.4 });
        io.observe(staggerCard);
      }
    }

    // 05 Layered depth - parallax on mouse
    const depthCard = document.querySelector('.motion-card[data-motion="depth"] .motion-stage');
    if (depthCard) {
      const layers = depthCard.querySelectorAll('.depth-layer');
      const speeds = [0.2, 0.5, 0.8];
      depthCard.addEventListener('mousemove', (e) => {
        const r = depthCard.getBoundingClientRect();
        const cx = (e.clientX - r.left - r.width / 2) / r.width;
        const cy = (e.clientY - r.top - r.height / 2) / r.height;
        layers.forEach((l, i) => {
          const s = speeds[i] || 0.5;
          l.style.transform = `translate3d(${cx * s * 30}px, ${cy * s * 30}px, 0)`;
        });
      });
      depthCard.addEventListener('mouseleave', () => {
        layers.forEach((l) => { l.style.transform = ''; });
      });
    }
  }

  /* -----------------------------------------------------------
     Smooth anchor scrolling via Lenis
     ----------------------------------------------------------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      a.addEventListener('click', (e) => {
        const tgt = document.querySelector(href);
        if (!tgt) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(tgt, { offset: 0, duration: 1.5 });
        } else {
          tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* -----------------------------------------------------------
     Boot
     ----------------------------------------------------------- */
  function boot() {
    initSplitTexts();
    initLenis();
    initNav();
    initCursor();
    initMagnetic();
    initReveals();
    initHeroSequence();
    initHeroParallax();
    initNarrative();
    initModes();
    initInventory();
    initMotionShowcase();
    initAnchors();

    if (HAS_GSAP && HAS_ST) {
      // Refresh after a tick so layout is final
      setTimeout(() => window.ScrollTrigger.refresh(), 200);
      window.addEventListener('load', () => window.ScrollTrigger.refresh());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
