/* =========================================================================
   Caretaker Security Services — behaviour
   Progressive enhancement only: every section is readable, navigable and
   contactable with this file blocked. Animation is opt-in and is skipped
   entirely when the visitor asks for reduced motion.
   ========================================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsObserver = 'IntersectionObserver' in window;
  const allowMotion = !reduceMotion.matches && supportsObserver;

  /* --- Animated introduction ------------------------------------------ */
  // The <head> decided whether the intro runs; this only drives and ends it.
  const introEl = document.querySelector('[data-intro]');
  const INTRO_MIN_MS = 1700;   // let the logo sequence read before leaving
  const INTRO_MAX_MS = 3200;   // never hold the page longer than this

  const endIntro = () => {
    if (!root.classList.contains('is-loading')) return;
    clearTimeout(window.__introFallback);
    try { sessionStorage.setItem('caretaker-intro', 'seen'); } catch (_) { /* optional */ }
    introEl?.classList.add('is-done');
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
  };

  const runIntro = () => {
    const fill = document.querySelector('[data-intro-fill]');
    const count = document.querySelector('[data-intro-count]');
    const heroImage = document.querySelector('[data-hero-image]');
    const started = performance.now();
    let progress = 0;
    let settled = false;

    // Assets we would like finished before the curtain lifts.
    const assets = Promise.all([
      document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
      heroImage && typeof heroImage.decode === 'function' ? heroImage.decode().catch(() => {}) : Promise.resolve()
    ]);
    assets.then(() => { settled = true; });

    const tick = (now) => {
      const elapsed = now - started;
      // Ease toward 92% while loading, then complete once assets have settled.
      const ceiling = settled && elapsed >= INTRO_MIN_MS ? 100 : 92;
      progress += (ceiling - progress) * 0.06;
      if (ceiling === 100 && progress > 99.4) progress = 100;

      const shown = Math.round(progress);
      if (fill) fill.style.width = shown + '%';
      if (count) count.textContent = String(shown);

      if (progress >= 100 || elapsed >= INTRO_MAX_MS) {
        if (fill) fill.style.width = '100%';
        if (count) count.textContent = '100';
        setTimeout(endIntro, 180);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Let an impatient visitor dismiss the intro immediately.
    window.addEventListener('pointerdown', endIntro, { once: true, passive: true });
    window.addEventListener('keydown', endIntro, { once: true });
  };

  if (root.classList.contains('is-loading')) {
    runIntro();
  } else {
    root.classList.add('is-ready');
  }
  // Restoring from the back/forward cache must never show a stale curtain.
  window.addEventListener('pageshow', (event) => { if (event.persisted) endIntro(); });

  /* --- Scroll reveals -------------------------------------------------- */
  if (allowMotion) {
    root.classList.add('has-motion');

    // Children of a [data-stagger] group enter in sequence rather than together.
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      group.querySelectorAll(':scope > [data-reveal]').forEach((item, index) => {
        item.style.setProperty('--d', Math.min(index * 80, 400) + 'ms');
      });
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    document.querySelectorAll('[data-reveal], [data-reveal-lines]').forEach((item) => revealObserver.observe(item));

    // If the visitor switches motion preference mid-visit, show everything.
    reduceMotion.addEventListener('change', (event) => {
      if (!event.matches) return;
      revealObserver.disconnect();
      root.classList.remove('has-motion');
      endIntro();
    });
    window.addEventListener('beforeprint', () => {
      document.querySelectorAll('[data-reveal], [data-reveal-lines]').forEach((item) => item.classList.add('is-inview'));
    });
  }

  /* --- Header, progress and parallax on one frame loop ------------------ */
  const header = document.querySelector('[data-header]');
  const parallaxEl = document.querySelector('[data-parallax]');
  const parallaxFactor = parallaxEl ? parseFloat(parallaxEl.dataset.parallax) || 0 : 0;
  const hero = document.querySelector('.hero');

  let scrollRange = 1;
  let lastY = window.scrollY;
  let frameQueued = false;
  let heroVisible = true;

  const measure = () => {
    scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  };

  const render = () => {
    frameQueued = false;
    const y = window.scrollY;

    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      header.style.setProperty('--progress', String(Math.min(y / scrollRange, 1)));
      // Reclaim vertical space while reading downward, return the header on the way up.
      const hide = y > 320 && y > lastY && !document.body.classList.contains('menu-open');
      header.classList.toggle('is-hidden', hide);
    }

    if (parallaxEl && allowMotion && heroVisible) {
      parallaxEl.style.transform = 'translate3d(0,' + (y * parallaxFactor).toFixed(2) + 'px,0)';
    }

    lastY = y;
  };

  const onScroll = () => {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(render);
  };

  measure();
  render();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener('load', measure);

  // Parallax only needs to run while the hero is actually on screen.
  if (hero && supportsObserver) {
    new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
    }, { rootMargin: '120px' }).observe(hero);
  }

  /* --- Mobile navigation ----------------------------------------------- */
  const menu = document.querySelector('#mobile-menu');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menuClose = document.querySelector('[data-menu-close]');

  // The native dialog gives focus containment, an inert background and Escape.
  if (menu && menuToggle && menuClose && typeof menu.showModal === 'function') {
    root.classList.add('nav-enhanced');
    menuToggle.hidden = false;

    const resetMenu = () => {
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };
    const closeMenu = () => {
      if (menu.open) menu.close();
      resetMenu();
    };

    menuToggle.addEventListener('click', () => {
      endIntro();
      menu.showModal();
      document.body.classList.add('menu-open');
      menuToggle.setAttribute('aria-expanded', 'true');
    });
    menuClose.addEventListener('click', closeMenu);
    menu.addEventListener('close', resetMenu);
    menu.addEventListener('cancel', resetMenu);
    menu.addEventListener('click', (event) => {
      if (event.target !== menu) return;
      const bounds = menu.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
    });

    // Closing on navigation keeps focus with the section the visitor chose.
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      closeMenu();
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }));

    const desktop = window.matchMedia('(min-width: 900px)');
    desktop.addEventListener('change', (event) => { if (event.matches) closeMenu(); });
    window.addEventListener('pagehide', closeMenu);
  }

  /* --- Mobile call shortcut -------------------------------------------- */
  // Shown only in the stretch between the hero and the contact details.
  const mobileCall = document.querySelector('.mobile-call');
  const contact = document.querySelector('#contact');
  const footer = document.querySelector('.site-footer');

  if (mobileCall && hero && contact && footer && supportsObserver) {
    const visibility = new Map([[hero, true], [contact, false], [footer, false]]);
    const callObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
      mobileCall.classList.toggle('is-visible', [...visibility.values()].every((visible) => !visible));
    });
    visibility.forEach((_, element) => callObserver.observe(element));
  }

  /* --- Footer year ------------------------------------------------------ */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
