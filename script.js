// script.js

// =========================
// THEME TOGGLE WITH PERSISTENCE
// =========================

const THEME_KEY = "pratik-portfolio-theme";

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;

  // Fallback: system preference
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

(function initTheme() {
  const preferred = getPreferredTheme();
  applyTheme(preferred);
})();

// Theme toggle button
const themeToggleBtn = document.querySelector(".theme-toggle");
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", toggleTheme);
}

// =========================
// NAV TOGGLE (MOBILE)
// =========================

const navToggle = document.querySelector(".nav-toggle");
const navList = document.querySelector(".nav-list");

if (navToggle && navList) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    navList.classList.toggle("is-open");
  });

  navList.addEventListener("click", (event) => {
    if (event.target.tagName === "A" && navList.classList.contains("is-open")) {
      navToggle.setAttribute("aria-expanded", "false");
      navList.classList.remove("is-open");
    }
  });
}

// =========================
// SECTION REVEAL ON SCROLL
// =========================

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const animated = document.querySelectorAll(".animate-in");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.16,
    }
  );

  animated.forEach((el) => observer.observe(el));
} else {
  // Fallback: make all elements visible
  document.querySelectorAll(".animate-in").forEach((el) => {
    el.classList.add("is-visible");
  });
}

// =========================
// METRIC COUNT-UP ANIMATION
// =========================

function animateNumber(el, target, duration = 900) {
  if (prefersReducedMotion) {
    el.textContent = target + "+";
    return;
  }

  const start = 0;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const value = Math.floor(start + (target - start) * eased);
    el.textContent = value + "+";
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

(function initMetricObserver() {
  const metricEls = document.querySelectorAll(".metric-value");
  if (!metricEls.length) return;

  if (!("IntersectionObserver" in window)) {
    metricEls.forEach((el) => {
      const target = parseInt(el.dataset.target || "0", 10);
      animateNumber(el, target);
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target || "0", 10);
        animateNumber(el, target);
        obs.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  metricEls.forEach((el) => observer.observe(el));
})();

// =========================
// MODALS (CASE STUDIES)
// =========================

const backdrop = document.querySelector("[data-modal-backdrop]");
const modals = document.querySelectorAll(".modal");
const openButtons = document.querySelectorAll(".work-open");

let activeModal = null;
let lastFocusedElement = null;

function openModal(id) {
  const modal = document.querySelector(`.modal[data-modal="${id}"]`);
  if (!modal || !backdrop) return;

  activeModal = modal;
  lastFocusedElement = document.activeElement;

  modal.hidden = false;
  backdrop.hidden = false;
  backdrop.classList.add("is-visible");

  // Move focus to the dialog
  const focusable = modal.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable) focusable.focus();

  document.addEventListener("keydown", handleKeydown);
}

function closeModal() {
  if (!activeModal || !backdrop) return;

  activeModal.hidden = true;
  backdrop.classList.remove("is-visible");
  backdrop.hidden = true;

  document.removeEventListener("keydown", handleKeydown);

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }

  activeModal = null;
  lastFocusedElement = null;
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeModal();
  }

  if (event.key === "Tab" && activeModal) {
    const focusable = activeModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusArray = Array.prototype.slice.call(focusable);

    if (!focusArray.length) return;

    const first = focusArray[0];
    const last = focusArray[focusArray.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
}

// Wire up open buttons
openButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-case-id");
    if (id) openModal(id);
  });
});

// Backdrop click closes modal
if (backdrop) {
  backdrop.addEventListener("click", closeModal);
}

// Close buttons
modals.forEach((modal) => {
  const closeBtn = modal.querySelector(".modal-close");
  if (!closeBtn) return;
  closeBtn.addEventListener("click", closeModal);
});

// =========================
// FOOTER YEAR
// =========================

const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
