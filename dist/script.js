(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('#mobile-menu');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menuClose = document.querySelector('[data-menu-close]');
  const mobileCall = document.querySelector('.mobile-call');
  const hero = document.querySelector('.hero');
  const contact = document.querySelector('#contact');
  const footer = document.querySelector('.site-footer');

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
