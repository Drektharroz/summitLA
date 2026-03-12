const nav = document.querySelector('.nav');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (nav) {
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 18);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

if (menuButton && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  navAnchors.forEach((anchor) => anchor.addEventListener('click', closeMenu));

  document.addEventListener('click', (event) => {
    if (!menuButton.contains(event.target) && !navLinks.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeMenu();
    menuButton.focus();
  });
}

const sections = [...navAnchors]
  .map((anchor) => document.querySelector(anchor.getAttribute('href')))
  .filter(Boolean);

if (sections.length && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeId = `#${entry.target.id}`;
        navAnchors.forEach((anchor) => {
          const isActive = anchor.getAttribute('href') === activeId;
          anchor.classList.toggle('active', isActive);
          if (isActive) {
            anchor.setAttribute('aria-current', 'page');
          } else {
            anchor.removeAttribute('aria-current');
          }
        });
      });
    },
    { threshold: 0.45, rootMargin: '-20% 0px -45% 0px' },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length) {
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index * 36, 220)}ms`;
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }
}

const yearElement = document.getElementById('year');
if (yearElement) yearElement.textContent = String(new Date().getFullYear());
