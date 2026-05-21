/* AETHER DRIVE — premium automotive interaction layer
 * Vanilla JS. No GSAP. No Lenis. Lean and idle-aware.
 *
 * Performance principles:
 *  - No constant requestAnimationFrame loops
 *  - rAF runs only while a mouse is over an interactive element, then settles
 *  - All scroll listeners are passive
 *  - Native browser smooth scroll for anchors
 */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;


  // -----------------------------------------------------------
  // Helper: split-text into words (preserves word spacing)
  // -----------------------------------------------------------
  const splitWords = (el) => {
    if (el.dataset.split === '1') return;
    el.dataset.split = '1';
    const text = el.textContent;
    el.textContent = '';
    const words = text.trim().split(/\s+/);
    const frag = document.createDocumentFragment();
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      frag.appendChild(span);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.appendChild(frag);
  };
  document.querySelectorAll('.split-text').forEach(splitWords);


  // -----------------------------------------------------------
  // Reveal-on-scroll observer (cheap, single observer, unobserves on reveal)
  // -----------------------------------------------------------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.classList.contains('split-text')) {
        const words = el.querySelectorAll('.word');
        words.forEach((w, i) => {
          w.style.transitionDelay = (i * 60) + 'ms';
          w.classList.add('is-in');
        });
      } else if (el.classList.contains('spotlight')) {
        el.classList.add('is-revealed');
      } else if (el.classList.contains('reveal-target')) {
        el.classList.add('is-revealed');
      }
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal-target, .split-text, .spotlight').forEach((el) => revealObserver.observe(el));


  // -----------------------------------------------------------
  // Editorial border-grow (one-shot)
  // -----------------------------------------------------------
  const borderObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.transform = 'scaleY(1)';
        borderObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.border-grow').forEach((el) => borderObs.observe(el));


  // -----------------------------------------------------------
  // Magnetic buttons — rAF only while moving, idles when settled
  // -----------------------------------------------------------
  const magneticTargets = isFinePointer && !reduceMotion
    ? document.querySelectorAll('[data-magnetic], [data-magnetic-soft]')
    : [];
  magneticTargets.forEach((el) => {
    const soft = el.hasAttribute('data-magnetic-soft');
    const strength = soft ? 0.18 : 0.30;
    let bx = 0, by = 0, tx = 0, ty = 0;
    let raf = null;

    const animate = () => {
      bx += (tx - bx) * 0.18;
      by += (ty - by) * 0.18;
      el.style.transform = `translate3d(${bx.toFixed(2)}px, ${by.toFixed(2)}px, 0)`;
      if (Math.abs(tx - bx) > 0.1 || Math.abs(ty - by) > 0.1) {
        raf = requestAnimationFrame(animate);
      } else {
        bx = tx; by = ty;
        el.style.transform = (bx === 0 && by === 0)
          ? ''
          : `translate3d(${bx.toFixed(2)}px, ${by.toFixed(2)}px, 0)`;
        raf = null;
      }
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(animate); };

    el.addEventListener('mouseenter', () => { /* prepares */ });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * strength;
      ty = (e.clientY - r.top - r.height / 2) * strength;
      start();
    }, { passive: true });
    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; start(); });
  });


  // -----------------------------------------------------------
  // Smooth anchor scroll (native, with offset for fixed nav)
  // -----------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });


  // -----------------------------------------------------------
  // NAV — scrolled state + dynamic light/dark theme via IO
  // -----------------------------------------------------------
  const nav = document.getElementById('nav');
  if (nav) {
    let onScroll;
    onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Track which sections are currently overlapping the nav band
    const lightSelectors = '.showcase--light, .features--light, .chapter--light';
    const lightSections = document.querySelectorAll(lightSelectors);
    const navHeight = 80;

    const updateNavTheme = () => {
      let onLight = false;
      for (const s of lightSections) {
        const r = s.getBoundingClientRect();
        if (r.top <= navHeight && r.bottom >= navHeight) { onLight = true; break; }
      }
      nav.classList.toggle('on-light', onLight);
    };

    // run on scroll, throttled with rAF
    let pendingTheme = false;
    window.addEventListener('scroll', () => {
      if (!pendingTheme) {
        pendingTheme = true;
        requestAnimationFrame(() => {
          updateNavTheme();
          pendingTheme = false;
        });
      }
    }, { passive: true });
    window.addEventListener('resize', updateNavTheme, { passive: true });
    updateNavTheme();
  }


  // -----------------------------------------------------------
  // Mobile nav overlay
  // -----------------------------------------------------------
  const burger = document.getElementById('navBurger');
  const overlay = document.getElementById('navOverlay');
  if (burger && overlay) {
    const close = () => {
      overlay.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', () => {
      const open = overlay.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    overlay.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('click', close);
    });
  }


  // -----------------------------------------------------------
  // HERO REVEAL LENS — confined to the lens card on the right
  // Only runs rAF while the pointer is inside the card.
  // -----------------------------------------------------------
  (function setupLens() {
    const card = document.getElementById('heroLens');
    const reveal = document.getElementById('lensReveal');
    const cursor = document.getElementById('lensCursor');
    if (!card || !reveal || !cursor || reduceMotion) return;

    const ring = cursor.querySelector('.lens-ring');
    let baseRadius = 110;
    let radius = 0, targetRadius = 0;
    let cx = 50, cy = 50;
    let mx = 0, my = 0;
    let active = false;
    let raf = null;

    const computeBase = () => {
      const r = card.getBoundingClientRect();
      baseRadius = Math.max(60, Math.min(140, r.width * 0.28));
    };
    computeBase();
    window.addEventListener('resize', computeBase, { passive: true });

    const setMask = () => {
      reveal.style.setProperty('--lx', cx.toFixed(2) + '%');
      reveal.style.setProperty('--ly', cy.toFixed(2) + '%');
      reveal.style.setProperty('--lr', radius.toFixed(2) + 'px');
      cursor.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      if (ring) {
        const d = Math.max(0, radius * 2);
        ring.style.width = d + 'px';
        ring.style.height = d + 'px';
        ring.style.marginLeft = (-d / 2) + 'px';
        ring.style.marginTop = (-d / 2) + 'px';
      }
    };

    const tick = () => {
      radius += (targetRadius - radius) * 0.20;
      setMask();
      const settled = Math.abs(targetRadius - radius) < 0.3;
      if (active || !settled) {
        raf = requestAnimationFrame(tick);
      } else {
        radius = targetRadius;
        setMask();
        raf = null;
      }
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const update = (clientX, clientY) => {
      const r = card.getBoundingClientRect();
      mx = clientX - r.left;
      my = clientY - r.top;
      // Clamp inside the card so the mask never references outside
      mx = Math.max(0, Math.min(r.width, mx));
      my = Math.max(0, Math.min(r.height, my));
      cx = (mx / r.width) * 100;
      cy = (my / r.height) * 100;
    };

    const activate = (x, y) => {
      active = true;
      card.classList.add('is-active');
      update(x, y);
      targetRadius = baseRadius;
      start();
    };
    const deactivate = () => {
      active = false;
      targetRadius = 0;
      start();
      // Remove the active class once the radius shrinks
      setTimeout(() => { if (!active) card.classList.remove('is-active'); }, 350);
    };

    card.addEventListener('mouseenter', (e) => activate(e.clientX, e.clientY));
    card.addEventListener('mousemove', (e) => {
      if (!active) return;
      update(e.clientX, e.clientY);
      start();
    }, { passive: true });
    card.addEventListener('mouseleave', deactivate);

    // Touch support (drag to reveal)
    card.addEventListener('touchstart', (e) => {
      if (!e.touches[0]) return;
      activate(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    card.addEventListener('touchmove', (e) => {
      if (!e.touches[0] || !active) return;
      update(e.touches[0].clientX, e.touches[0].clientY);
      start();
    }, { passive: true });
    card.addEventListener('touchend', deactivate);
    card.addEventListener('touchcancel', deactivate);

    // Auto-demo: gentle one-time hint
    setTimeout(() => {
      if (active) return;
      const r = card.getBoundingClientRect();
      cx = 60; cy = 50;
      mx = r.width * 0.6; my = r.height * 0.5;
      active = true;
      card.classList.add('is-active');
      targetRadius = baseRadius * 0.85;
      start();
      setTimeout(() => {
        if (!card.matches(':hover')) {
          active = false;
          targetRadius = 0;
          start();
          setTimeout(() => {
            if (!card.matches(':hover')) card.classList.remove('is-active');
          }, 500);
        }
      }, 1400);
    }, 1500);
  })();


  // -----------------------------------------------------------
  // INVENTORY SEARCH — live filter, count, scroll to fleet
  // -----------------------------------------------------------
  (function setupSearch() {
    const form = document.getElementById('heroSearch');
    const fleetCards = document.querySelectorAll('.fleet-card');
    const countEl = document.getElementById('hsCount');
    const fleetMatchEl = document.getElementById('fleetMatchCount');
    const priceLabel = document.getElementById('hsPriceLabel');
    const priceFill = document.getElementById('hsPriceFill');
    if (!form) return;

    const fmtPrice = (lakh) => '\u20B9' + (lakh / 100).toFixed(2) + ' Cr';

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
      if (fleetMatchEl) fleetMatchEl.textContent = matches;
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
      if (fleet) fleet.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });

    compute();
  })();


  // -----------------------------------------------------------
  // MODES — segmented selector with auto-cycle
  // -----------------------------------------------------------
  (function setupModes() {
    const root = document.getElementById('modeSelector');
    if (!root) return;
    const segs = Array.from(root.querySelectorAll('.mode-segment'));
    const imgs = document.querySelectorAll('.mode-img');
    const contents = document.querySelectorAll('.mode-content');
    const fills = root.querySelectorAll('.mode-progress-fill');
    if (!segs.length) return;

    let activeIdx = 0;
    let cycleTimer = null;

    const setActive = (idx) => {
      activeIdx = idx;
      segs.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      fills.forEach((f, i) => { f.style.width = i === idx ? '100%' : (i < idx ? '100%' : '0%'); });
      const mode = segs[idx].dataset.mode;
      imgs.forEach((m) => m.classList.toggle('is-active', m.dataset.modeImg === mode));
      contents.forEach((c) => c.classList.toggle('is-active', c.dataset.modeContent === mode));
    };
    segs.forEach((s, i) => s.addEventListener('click', () => {
      setActive(i);
      if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    }));

    if (!reduceMotion) {
      // Only cycle while modes is in view
      const modes = document.querySelector('.modes');
      const startCycle = () => {
        if (cycleTimer) return;
        cycleTimer = setInterval(() => setActive((activeIdx + 1) % segs.length), 5500);
      };
      const stopCycle = () => { if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; } };
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => e.isIntersecting ? startCycle() : stopCycle());
      }, { threshold: 0.25 });
      if (modes) obs.observe(modes);
    }
  })();


  // -----------------------------------------------------------
  // FLOATING CTA — show after hero leaves viewport
  // -----------------------------------------------------------
  (function setupFloatingCta() {
    const cta = document.getElementById('floatingCta');
    const hero = document.getElementById('hero');
    if (!cta || !hero) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => cta.classList.toggle('is-visible', !e.isIntersecting));
    }, { threshold: 0.05 });
    obs.observe(hero);
  })();


  // -----------------------------------------------------------
  // CONTACT DRAWER — open/close, ESC, focus, body scroll lock
  // -----------------------------------------------------------
  (function setupDrawer() {
    const drawer = document.getElementById('contactDrawer');
    if (!drawer) return;
    const form = document.getElementById('contactForm');
    const success = document.getElementById('drawerSuccess');
    let lastFocus = null;
    let savedScrollY = 0;

    const open = () => {
      lastFocus = document.activeElement;
      savedScrollY = window.scrollY;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const first = drawer.querySelector('input, select, textarea, button');
        if (first) first.focus({ preventScroll: true });
      }, 350);
    };
    const close = () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) {
        try { lastFocus.focus({ preventScroll: true }); } catch (_) {}
      }
    };

    document.querySelectorAll('[data-open-contact]').forEach((el) => {
      el.addEventListener('click', (e) => { e.preventDefault(); open(); });
    });
    drawer.querySelectorAll('[data-close-contact]').forEach((el) => {
      el.addEventListener('click', (e) => { e.preventDefault(); close(); });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (success) success.hidden = false;
        const submitLabel = form.querySelector('.drawer-submit .magnetic-label');
        if (submitLabel) submitLabel.textContent = 'Sent';
        setTimeout(() => {
          form.reset();
          if (success) success.hidden = true;
          if (submitLabel) submitLabel.textContent = 'Send to Atelier';
          close();
        }, 2200);
      });
    }
  })();


  // -----------------------------------------------------------
  // Image error fallback — neutral gradient if a photo fails
  // -----------------------------------------------------------
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.background = 'linear-gradient(135deg, #1F1F28 0%, #14141B 100%)';
      img.style.minHeight = '200px';
    }, { once: true });
  });

})();
