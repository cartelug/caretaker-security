/* =========================================================================
   Caretaker Security Services — behaviour

   Progressive enhancement only. With this file blocked every section is
   readable, navigable and contactable; nothing here rescues content from a
   hidden state, it only adds motion and the mobile dialog.

   Structure: a frame scheduler that all scroll work shares, then one
   self-contained module per behaviour. Modules return a teardown function
   where they own resources worth releasing.
   ========================================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  // Re-running would double every listener; the flag makes init idempotent.
  if (root.dataset.caretakerReady) return;
  root.dataset.caretakerReady = 'true';

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const desktopQuery = matchMedia('(min-width: 900px)');
  const canObserve = 'IntersectionObserver' in window;
  const allowMotion = () => !motionQuery.matches && canObserve;

  const TIMING = {
    introMin: 1700,      // let the logo sequence read before the curtain lifts
    introMax: 3200,      // never hold the page longer than this
    introExit: 180,
    headerShadowAt: 24,  // px scrolled before the header gains its shadow
    headerHideAt: 320,   // px scrolled before the header may retract
    staggerStep: 80,
    staggerMax: 400
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* --- Frame scheduler --------------------------------------------------
     Every scroll-driven effect reads window.scrollY once per frame here,
     rather than each registering its own listener and its own read. */
  const createScheduler = () => {
    const tasks = new Set();
    let queued = false;

    const flush = () => {
      queued = false;
      const y = window.scrollY;
      for (const task of tasks) task(y);
    };

    return {
      add(task) {
        tasks.add(task);
        return () => tasks.delete(task);
      },
      request() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(flush);
      }
    };
  };

  const scheduler = createScheduler();

  /* --- Animated introduction --------------------------------------------
     The <head> already decided whether this runs (once per tab, never under
     reduced motion) and armed a fallback timer. This drives the progress
     readout and ends the sequence exactly once. */
  const createIntro = () => {
    const el = $('[data-intro]');
    const fill = $('[data-intro-fill]');
    const counter = $('[data-intro-count]');
    const heroImage = $('[data-hero-image]');

    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(window.__introFallback);
      try {
        sessionStorage.setItem('caretaker-intro', 'seen');
      } catch (_) {
        // Private browsing can refuse storage; the intro simply replays.
      }
      el?.classList.add('is-done');
      root.classList.remove('is-loading');
      root.classList.add('is-ready');
    };

    if (!root.classList.contains('is-loading')) {
      root.classList.add('is-ready');
      return { finish };
    }

    const startedAt = performance.now();
    let shown = 0;
    let assetsReady = false;

    Promise.all([
      document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
      heroImage?.decode ? heroImage.decode().catch(() => {}) : Promise.resolve()
    ]).then(() => { assetsReady = true; });

    const step = (now) => {
      const elapsed = now - startedAt;
      // Ease toward 92% while loading, and only complete once the hero and
      // fonts have settled, so the counter never lies about being done.
      const target = assetsReady && elapsed >= TIMING.introMin ? 100 : 92;
      shown += (target - shown) * 0.06;
      if (target === 100 && shown > 99.4) shown = 100;

      const value = Math.round(shown);
      if (fill) fill.style.width = `${value}%`;
      if (counter) counter.textContent = String(value);

      if (shown >= 100 || elapsed >= TIMING.introMax) {
        if (fill) fill.style.width = '100%';
        if (counter) counter.textContent = '100';
        setTimeout(finish, TIMING.introExit);
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    // An impatient visitor should never have to wait out the animation.
    addEventListener('pointerdown', finish, { once: true, passive: true });
    addEventListener('keydown', finish, { once: true });

    return { finish };
  };

  const intro = createIntro();
  // A page restored from the back/forward cache must not show a stale curtain.
  addEventListener('pageshow', (event) => { if (event.persisted) intro.finish(); });

  /* --- Scroll reveals ---------------------------------------------------- */
  const createReveals = () => {
    if (!allowMotion()) return null;

    root.classList.add('has-motion');

    // Items inside a [data-stagger] group enter in sequence, driven by their
    // position in the markup rather than a hand-written delay per element.
    for (const group of $$('[data-stagger]')) {
      $$(':scope > [data-reveal]', group).forEach((item, index) => {
        item.style.setProperty('--d', `${Math.min(index * TIMING.staggerStep, TIMING.staggerMax)}ms`);
      });
    }

    const targets = $$('[data-reveal], [data-reveal-lines]');
    const observer = new IntersectionObserver((entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-inview');
        self.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach((target) => observer.observe(target));

    const showAll = () => targets.forEach((target) => target.classList.add('is-inview'));
    const controller = new AbortController();
    addEventListener('beforeprint', showAll, { signal: controller.signal });

    return {
      teardown() {
        observer.disconnect();
        controller.abort();
        root.classList.remove('has-motion');
      }
    };
  };

  let reveals = createReveals();

  // Switching the preference mid-visit should take effect immediately.
  motionQuery.addEventListener('change', () => {
    if (motionQuery.matches) {
      reveals?.teardown();
      reveals = null;
      intro.finish();
    } else if (!reveals) {
      reveals = createReveals();
    }
  });

  /* --- Header state, reading progress and hero parallax ------------------
     Three effects, one frame task each, all fed by the shared scheduler. */
  const createScrollEffects = () => {
    const header = $('[data-header]');
    const parallaxEl = $('[data-parallax]');
    const hero = $('.hero');
    const parallaxFactor = Number(parallaxEl?.dataset.parallax) || 0;

    let scrollRange = 1;
    let previousY = window.scrollY;
    let heroOnScreen = true;

    const measure = () => {
      scrollRange = Math.max(root.scrollHeight - window.innerHeight, 1);
    };

    if (header) {
      scheduler.add((y) => {
        header.classList.toggle('is-scrolled', y > TIMING.headerShadowAt);
        header.style.setProperty('--progress', String(Math.min(y / scrollRange, 1)));
        // Give the reading area back on the way down, return on the way up.
        const retract = y > TIMING.headerHideAt && y > previousY &&
          !document.body.classList.contains('menu-open');
        header.classList.toggle('is-hidden', retract);
      });
    }

    if (parallaxEl && parallaxFactor) {
      scheduler.add((y) => {
        if (!heroOnScreen || !root.classList.contains('has-motion')) return;
        parallaxEl.style.transform = `translate3d(0,${(y * parallaxFactor).toFixed(2)}px,0)`;
      });
    }

    // previousY must update after every task has compared against it.
    scheduler.add((y) => { previousY = y; });

    measure();
    scheduler.request();

    addEventListener('scroll', () => scheduler.request(), { passive: true });
    addEventListener('resize', () => { measure(); scheduler.request(); }, { passive: true });
    addEventListener('load', measure);

    // Parallax has nothing to say once the hero has left the viewport.
    if (hero && canObserve) {
      new IntersectionObserver(([entry]) => { heroOnScreen = entry.isIntersecting; },
        { rootMargin: '120px' }).observe(hero);
    }
  };

  createScrollEffects();

  /* --- Mobile navigation -------------------------------------------------
     A native <dialog> supplies focus containment, an inert background,
     Escape handling and focus return; none of that is reimplemented here. */
  const createNav = () => {
    const menu = $('#mobile-menu');
    const toggle = $('[data-menu-toggle]');
    const close = $('[data-menu-close]');
    if (!menu || !toggle || !close || typeof menu.showModal !== 'function') return;

    root.classList.add('nav-enhanced');
    toggle.hidden = false;

    const reset = () => {
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    const closeMenu = () => {
      if (menu.open) menu.close();
      reset();
    };

    toggle.addEventListener('click', () => {
      intro.finish();
      menu.showModal();
      document.body.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');
    });
    close.addEventListener('click', closeMenu);
    menu.addEventListener('close', reset);
    menu.addEventListener('cancel', reset);

    // A click landing outside the dialog's own box is a click on the backdrop.
    menu.addEventListener('click', (event) => {
      if (event.target !== menu) return;
      const box = menu.getBoundingClientRect();
      const outside = event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom;
      if (outside) closeMenu();
    });

    for (const link of $$('a', menu)) {
      link.addEventListener('click', () => {
        closeMenu();
        const href = link.getAttribute('href');
        if (!href?.startsWith('#')) return;
        const target = $(href);
        if (!target) return;
        // Move focus to the chosen section so the keyboard follows the eye.
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      });
    }

    desktopQuery.addEventListener('change', (event) => { if (event.matches) closeMenu(); });
    addEventListener('pagehide', closeMenu);
  };

  createNav();

  /* --- Mobile call shortcut ----------------------------------------------
     Visible only in the stretch between the hero and the contact details,
     where no phone number is already on screen. */
  const createCallShortcut = () => {
    const shortcut = $('.mobile-call');
    const hero = $('.hero');
    const contact = $('#contact');
    const footer = $('.site-footer');
    if (!shortcut || !hero || !contact || !footer || !canObserve) return;

    const onScreen = new Map([[hero, true], [contact, false], [footer, false]]);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) onScreen.set(entry.target, entry.isIntersecting);
      const anchorVisible = [...onScreen.values()].some(Boolean);
      shortcut.classList.toggle('is-visible', !anchorVisible);
    });
    for (const section of onScreen.keys()) observer.observe(section);
  };

  createCallShortcut();

  /* --- Pointer-tracked light and magnetic buttons ------------------------
     Both are pure decoration on a fine pointer. Touch and keyboard users get
     the static design, which is why neither is required for anything. */
  const createPointerEffects = () => {
    if (!allowMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const lit = [$('.hero'), $('#contact')].filter(Boolean);
    if (lit.length && canObserve) {
      const litObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) entry.target.classList.toggle('is-lit', entry.isIntersecting);
      }, { rootMargin: '0px' });
      lit.forEach((section) => litObserver.observe(section));

      let pointerFrame = false;
      let px = 0;
      let py = 0;
      addEventListener('pointermove', (event) => {
        px = event.clientX;
        py = event.clientY;
        if (pointerFrame) return;
        pointerFrame = true;
        requestAnimationFrame(() => {
          pointerFrame = false;
          for (const section of lit) {
            if (!section.classList.contains('is-lit') && section !== lit[0]) continue;
            const box = section.getBoundingClientRect();
            if (box.bottom < 0 || box.top > innerHeight) continue;
            section.style.setProperty('--px', `${((px - box.left) / box.width) * 100}%`);
            section.style.setProperty('--py', `${((py - box.top) / box.height) * 100}%`);
          }
        });
      }, { passive: true });
    }

    // Magnetic pull: the button follows the cursor a little way, then releases.
    const PULL = 0.22;
    const MAX = 7;
    for (const button of $$('.button')) {
      button.addEventListener('pointermove', (event) => {
        const box = button.getBoundingClientRect();
        const dx = (event.clientX - (box.left + box.width / 2)) * PULL;
        const dy = (event.clientY - (box.top + box.height / 2)) * PULL;
        button.style.setProperty('--mx', `${Math.max(-MAX, Math.min(MAX, dx)).toFixed(1)}px`);
        button.style.setProperty('--my', `${Math.max(-MAX, Math.min(MAX, dy)).toFixed(1)}px`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.removeProperty('--mx');
        button.style.removeProperty('--my');
      });
    }
  };

  createPointerEffects();

  /* --- Footer year -------------------------------------------------------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
