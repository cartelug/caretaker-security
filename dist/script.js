(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const mobileCall = document.querySelector('.mobile-call');
  const contact = document.querySelector('#contact');

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 64);
  };

  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  if (contact && mobileCall && 'IntersectionObserver' in window) {
    const contactObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => mobileCall.classList.toggle('is-hidden', entry.isIntersecting));
    }, { threshold: 0.08 });
    contactObserver.observe(contact);
  }
})();
