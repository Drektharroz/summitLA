const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("active"));
        document
          .querySelector(`.nav-link[href="#${entry.target.id}"]`)
          ?.classList.add("active");
      }
    });
  },
  { threshold: 0.4 }
);
sections.forEach((s) => observer.observe(s));

window.addEventListener("scroll", () => {
  document.querySelector("nav").classList.toggle("scrolled", window.scrollY > 80);
});

const menuBtn = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
menuBtn?.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
});

document.querySelectorAll(".mobile-menu .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

const form = document.getElementById("contact-form");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = form.querySelector('[type="submit"]');
  btn.textContent = "Enviando...";
  btn.disabled = true;
  try {
    const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      showToast("Mensaje enviado. Le contactaremos en 24 horas.", "success");
      form.reset();
    } else {
      throw new Error();
    }
  } catch {
    showToast("Error al enviar. Escríbanos por WhatsApp.", "error");
    window.location.href =
      "mailto:contacto@summitlegaladvisors.com?subject=Consulta%20legal%20Summit%20Legal%20Advisors";
  } finally {
    btn.textContent = "Enviar consulta";
    btn.disabled = false;
  }
});

function showToast(msg, type) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 10);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

const imgObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const img = e.target;
      img.src = img.dataset.src;
      img.classList.remove("lazy");
      imgObserver.unobserve(img);
    }
  });
});
document.querySelectorAll("img[data-src]").forEach((img) => imgObserver.observe(img));

document.getElementById("year").textContent = new Date().getFullYear();
