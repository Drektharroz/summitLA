const navEl = document.querySelector('nav');
window.addEventListener('scroll', () => {
  navEl?.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      activeLink?.classList.add('active');
      activeLink?.setAttribute('aria-current', 'page');
    });
  },
  { threshold: 0.35 }
);
sections.forEach((section) => sectionObserver.observe(section));

const menuBtn = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
menuBtn?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mobile-menu .nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

function runCounter(el) {
  if (el.dataset.counted === 'true') return;
  el.dataset.counted = 'true';

  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const steps = 60;
  const increment = target / steps;
  let step = 0;

  const timer = setInterval(() => {
    step += 1;
    const current = Math.min(Math.round(increment * step), target);
    el.textContent = `${prefix}${current}${suffix}`;
    if (step >= steps) clearInterval(timer);
  }, duration / steps);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-number').forEach(runCounter);
      }
    });
  },
  { threshold: 0.2 }
);

const statsSection = document.getElementById('impacto-numerico');
if (statsSection) statObserver.observe(statsSection);

const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const toast = document.getElementById('form-toast');

function showToast(msg, isError = false) {
  if (!toast) return;
  toast.textContent = msg;
  toast.className = isError ? 'toast toast-error' : 'toast toast-success';
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 6000);
}

function validateField(input) {
  const errorEl = input.parentElement.querySelector('.field-error');
  if (!errorEl) return true;

  if (!input.validity.valid) {
    const msg =
      input.type === 'email'
        ? 'Ingrese un correo electrónico válido'
        : input.tagName === 'SELECT'
          ? 'Por favor seleccione una opción'
          : 'Este campo es obligatorio';
    errorEl.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
    return false;
  }

  errorEl.textContent = '';
  input.setAttribute('aria-invalid', 'false');
  return true;
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const required = form.querySelectorAll('[required]');
  let valid = true;
  required.forEach((field) => {
    if (!validateField(field)) valid = false;
  });

  if (!valid) {
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  submitBtn.textContent = 'Enviando...';
  submitBtn.disabled = true;

  try {
    const res = await fetch('https://formspree.io/f/mkoqqnly', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (res.ok) {
      showToast('Mensaje recibido. Le contactaremos dentro de las próximas 24 horas.');
      form.reset();
    } else {
      const data = await res.json().catch(() => ({}));
      const errMsg = data?.errors?.[0]?.message || 'Error al enviar';
      showToast(`No se pudo enviar: ${errMsg}. Escríbanos por WhatsApp.`, true);
    }
  } catch {
    showToast('Sin conexión. Por favor escríbanos por WhatsApp.', true);
  } finally {
    submitBtn.textContent = 'Enviar consulta';
    submitBtn.disabled = false;
  }
});

form?.querySelectorAll('[required]').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
});

const LEGAL_CONTENT = {
  privacidad: {
    title: 'Política de Privacidad',
    body: `<p><strong>Última actualización:</strong> Marzo 2025</p><p>Summit Legal Advisors S.A.C., con domicilio en Lima, Perú, trata los datos personales que nos confías con la finalidad exclusiva de atender tu consulta, brindar asesoría legal y, con tu consentimiento, enviarte comunicaciones relevantes sobre nuestros servicios.</p><h3>Datos que recopilamos</h3><p>Nombre, empresa, correo electrónico, teléfono y el mensaje que nos envías a través de nuestros formularios de contacto.</p><h3>Finalidad del tratamiento</h3><p>Responder a tu consulta, coordinar reuniones de diagnóstico y, en su caso, formalizar la prestación de servicios profesionales.</p><h3>Base legal</h3><p>Ley N° 29733, Ley de Protección de Datos Personales del Perú, y su Reglamento aprobado por D.S. N° 003-2013-JUS.</p><h3>Conservación</h3><p>Conservamos tus datos durante el tiempo necesario para cumplir la finalidad para la que fueron recopilados y las obligaciones legales aplicables.</p><h3>Tus derechos</h3><p>Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición escribiéndonos a <a href="mailto:contacto@summitlegaladvisors.com" style="color:var(--color-gold)">contacto@summitlegaladvisors.com</a>.</p><h3>Seguridad</h3><p>Aplicamos medidas técnicas y organizativas razonables para proteger tus datos frente a accesos no autorizados, pérdida o divulgación.</p>`
  },
  terminos: {
    title: 'Términos y Condiciones',
    body: `<p><strong>Última actualización:</strong> Marzo 2025</p><p>El acceso y uso del sitio web de Summit Legal Advisors (summitlegaladvisors.com) implica la aceptación de los presentes Términos y Condiciones.</p><h3>Naturaleza de la información</h3><p>El contenido de este sitio tiene carácter informativo general y no constituye asesoría legal. La relación profesional nace únicamente mediante la suscripción de un contrato de servicios.</p><h3>Propiedad intelectual</h3><p>Todos los contenidos, textos, imágenes y elementos de este sitio son propiedad de Summit Legal Advisors o sus licenciantes. Queda prohibida su reproducción sin autorización escrita.</p><h3>Limitación de responsabilidad</h3><p>Summit Legal Advisors no asume responsabilidad por decisiones tomadas en base a la información general publicada en este sitio, ni por posibles inexactitudes o desactualizaciones del contenido.</p><h3>Legislación aplicable</h3><p>Estos términos se rigen por la legislación peruana. Cualquier controversia se someterá a los juzgados de Lima.</p><h3>Contacto</h3><p>Consultas sobre estos términos: <a href="mailto:contacto@summitlegaladvisors.com" style="color:var(--color-gold)">contacto@summitlegaladvisors.com</a>.</p>`
  },
  cookies: {
    title: 'Política de Cookies',
    body: `<p><strong>Última actualización:</strong> Marzo 2025</p><p>Este sitio web no utiliza cookies de rastreo ni de publicidad. Únicamente podría utilizar cookies técnicas estrictamente necesarias para el funcionamiento del sitio (p.ej., recordar preferencias de accesibilidad).</p><h3>¿Qué son las cookies?</h3><p>Las cookies son pequeños archivos de texto que un sitio web almacena en tu dispositivo cuando lo visitas.</p><h3>Cookies que usamos</h3><p>Actualmente este sitio no instala ninguna cookie propia ni de terceros. Si en el futuro incorporamos herramientas de análisis (como Google Analytics), actualizaremos esta política y solicitaremos tu consentimiento.</p><h3>Control de cookies</h3><p>Puedes configurar tu navegador para bloquear o eliminar cookies. Consulta la ayuda de tu navegador para instrucciones específicas.</p><h3>Contacto</h3><p>Consultas sobre cookies: <a href="mailto:contacto@summitlegaladvisors.com" style="color:var(--color-gold)">contacto@summitlegaladvisors.com</a>.</p>`
  }
};

function openLegalModal(type) {
  const modal = document.getElementById('legal-modal');
  const content = LEGAL_CONTENT[type];
  if (!content || !modal) return;
  document.getElementById('modal-title').textContent = content.title;
  document.getElementById('modal-body').innerHTML = content.body;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal-close').focus();
}

function closeLegalModal() {
  const modal = document.getElementById('legal-modal');
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

window.openLegalModal = openLegalModal;
window.closeLegalModal = closeLegalModal;

document.getElementById('legal-modal')?.querySelector('.modal-backdrop')?.addEventListener('click', closeLegalModal);
document.getElementById('legal-modal')?.querySelector('.modal-close')?.addEventListener('click', closeLegalModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLegalModal();
});

document.getElementById('year').textContent = new Date().getFullYear();
