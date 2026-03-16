if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.registerPlugin(ScrollTrigger);

  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTl
    .from(".hero-label", { y: 20, opacity: 0, duration: 0.6 })
    .from(".hero-title", { y: 40, opacity: 0, duration: 0.8 }, "-=0.3")
    .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.6 }, "-=0.4")
    .from(".hero-ctas", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
    .from(".hero-stats li", { y: 20, opacity: 0, stagger: 0.15, duration: 0.5 }, "-=0.2");

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    gsap.fromTo(
      { val: 0 },
      { val: target },
      {
        duration: 2,
        ease: "power2.out",
        onUpdate: function () {
          el.textContent = prefix + Math.round(this.targets()[0].val) + suffix;
        },
      }
    );
  }

  ScrollTrigger.create({
    trigger: "#impacto-numerico",
    onEnter: () => document.querySelectorAll(".stat-number").forEach(animateCounter),
    once: true,
  });

  gsap.from(".service-card", {
    scrollTrigger: { trigger: "#servicios", start: "top 75%" },
    y: 60,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: "power3.out",
  });

  document.querySelectorAll(".section-title").forEach((el) => {
    const words = el.textContent.split(" ");
    el.innerHTML = words.map((w) => `<span class="word-wrap"><span>${w}</span></span>`).join(" ");
    gsap.from(el.querySelectorAll("span > span"), {
      scrollTrigger: { trigger: el, start: "top 85%" },
      y: "100%",
      opacity: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power3.out",
    });
  });

  gsap.from(".timeline-line", {
    scrollTrigger: { trigger: "#metodologia", start: "top 70%", scrub: 1 },
    scaleX: 0,
    transformOrigin: "left center",
  });

  gsap.to(".hero-logo", {
    scrollTrigger: { trigger: "#hero", scrub: true },
    y: -80,
    opacity: 0.3,
  });
} else {
  gsap.globalTimeline.timeScale(0);
}
