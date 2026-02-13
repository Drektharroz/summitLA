const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');
const revealElements = document.querySelectorAll('.reveal');
const stats = document.querySelectorAll('.stat');
const riskForm = document.querySelector('#riskForm');
const riskResult = document.querySelector('#riskResult');
const contactForm = document.querySelector('#contactForm');
const contactFeedback = document.querySelector('#contactFeedback');
const toTop = document.querySelector('#toTop');
const testimonials = document.querySelectorAll('.testimonial');
const nextTestimonial = document.querySelector('#nextTestimonial');
const prevTestimonial = document.querySelector('#prevTestimonial');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(navLinks.classList.contains('open')));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

if (themeToggle) {
  const savedTheme = localStorage.getItem('sla-theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('sla-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

const revealOnScroll = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  },
  { threshold: 0.2 }
);

revealElements.forEach((element) => revealOnScroll.observe(element));

const countUp = (element, target) => {
  let value = 0;
  const increment = Math.max(1, Math.round(target / 40));
  const timer = setInterval(() => {
    value += increment;
    if (value >= target) {
      value = target;
      clearInterval(timer);
    }
    element.textContent = `${value}${target === 96 ? '%' : '+'}`;
  }, 25);
};

const statsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = Number(entry.target.dataset.target || 0);
        countUp(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);

stats.forEach((stat) => statsObserver.observe(stat));

if (riskForm && riskResult) {
  riskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(riskForm);
    const score = ['size', 'area', 'history'].reduce(
      (sum, field) => sum + Number(formData.get(field) || 0),
      0
    );

    if (score <= 4) {
      riskResult.textContent = 'Riesgo inicial: Bajo. Recomendamos auditoría preventiva trimestral.';
    } else if (score <= 7) {
      riskResult.textContent = 'Riesgo inicial: Medio. Sugerimos plan legal integral en 30 días.';
    } else {
      riskResult.textContent = 'Riesgo inicial: Alto. Te recomendamos una sesión estratégica urgente.';
    }
  });
}

if (contactForm && contactFeedback) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = String(new FormData(contactForm).get('email') || '');

    if (!email.includes('@')) {
      contactFeedback.textContent = 'Por favor ingresa un correo válido.';
      return;
    }

    contactFeedback.textContent = 'Solicitud recibida. Te contactaremos dentro de 24 horas hábiles.';
    contactForm.reset();
  });
}

if (toTop) {
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('show', window.scrollY > 360);
  });

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

let testimonialIndex = 0;

const showTestimonial = (index) => {
  testimonials.forEach((card, idx) => {
    card.classList.toggle('active', idx === index);
  });
};

if (testimonials.length > 0) {
  showTestimonial(testimonialIndex);

  nextTestimonial?.addEventListener('click', () => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    showTestimonial(testimonialIndex);
  });

  prevTestimonial?.addEventListener('click', () => {
    testimonialIndex = (testimonialIndex - 1 + testimonials.length) % testimonials.length;
    showTestimonial(testimonialIndex);
  });

  setInterval(() => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    showTestimonial(testimonialIndex);
  }, 5000);
}
