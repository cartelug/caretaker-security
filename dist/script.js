(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('#mobile-menu');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menuClose = document.querySelector('[data-menu-close]');
  const mobileCall = document.querySelector('.mobile-call');
  const hero = document.querySelector('.hero');
  const contact = document.querySelector('#contact');
  const footer = document.querySelector('.site-footer');

  // A slow image or unavailable storage must never leave the introduction on screen.
  const finishIntro = () => {
    root.classList.remove('is-loading');
    clearTimeout(window.caretakerLoaderTimeout);
    try { sessionStorage.setItem('caretaker-intro', 'seen'); } catch (_) { /* Optional enhancement. */ }
  };
  const heroImage = document.querySelector('[data-hero-image]');
  const introDeadline = setTimeout(finishIntro, 1200);
  const imageReady = heroImage && typeof heroImage.decode === 'function' ? heroImage.decode() : Promise.resolve();
  imageReady.catch(() => {}).then(() => {
    clearTimeout(introDeadline);
    finishIntro();
  });
  window.addEventListener('pointerdown', finishIntro, { once: true, passive: true });
  window.addEventListener('keydown', finishIntro, { once: true });
  window.addEventListener('pageshow', (event) => { if (event.persisted) finishIntro(); });

  // Native dialog provides focus containment, an inert background and Escape support.
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
      finishIntro();
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
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      closeMenu();
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    }));
    const desktop = window.matchMedia('(min-width: 900px)');
    desktop.addEventListener('change', (event) => { if (event.matches) closeMenu(); });
    window.addEventListener('pagehide', closeMenu);
  }

  let framePending = false;
  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    framePending = false;
  };
  updateHeader();
  window.addEventListener('scroll', () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateHeader);
  }, { passive: true });

  const revealItems = document.querySelectorAll('[data-reveal]');
  let revealObserver;
  const showAll = () => {
    root.classList.remove('motion-ready');
    revealObserver?.disconnect();
  };
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -24px 0px', threshold: 0.05 });
    revealItems.forEach((item) => revealObserver.observe(item));
    root.classList.add('motion-ready');
  }
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) { showAll(); finishIntro(); }
  });
  window.addEventListener('beforeprint', showAll);

  // Keep the mobile shortcut clear of the hero and full contact/footer area.
  if (mobileCall && hero && contact && footer && 'IntersectionObserver' in window) {
    const visibility = new Map([[hero, true], [contact, false], [footer, false]]);
    const callObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
      mobileCall.classList.toggle('is-visible', [...visibility.values()].every((visible) => !visible));
    });
    visibility.forEach((_, element) => callObserver.observe(element));
  }
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
