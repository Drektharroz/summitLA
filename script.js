const siteNav = document.querySelector('.nav');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (siteNav) {
  const updateNavState = () => {
    siteNav.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });
}

if (menuButton && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const willOpen = !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', willOpen);
    menuButton.setAttribute('aria-expanded', String(willOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!navLinks.contains(event.target) && !menuButton.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menuButton.focus();
    }
  });
}

const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length) {
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add('is-visible');
    });
  }
}
