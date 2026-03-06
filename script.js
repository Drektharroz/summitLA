const siteNav = document.querySelector('.nav');

if (siteNav) {
  const updateNavState = () => {
    siteNav.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });
}

const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const heroPanel = document.querySelector('#heroPanel');
const heroCanvas = document.querySelector('#heroCanvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isExpanded = navLinks.classList.contains('open');
    menuButton.setAttribute('aria-expanded', String(isExpanded));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

if (heroPanel && !reducedMotion) {
  heroPanel.addEventListener('pointermove', (event) => {
    const rect = heroPanel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 5;
    const rotateY = (x - 0.5) * 7;

    heroPanel.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });

  heroPanel.addEventListener('pointerleave', () => {
    heroPanel.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
  });
}

if (heroCanvas && !reducedMotion) {
  const header = document.querySelector('.site-header');
  const ctx = heroCanvas.getContext('2d');

  if (ctx && header) {
    const points = [];
    const pointCount = 44;
    const maxDistance = 120;

    const resizeCanvas = () => {
      const { width, height } = header.getBoundingClientRect();
      heroCanvas.width = Math.floor(width * window.devicePixelRatio);
      heroCanvas.height = Math.floor(height * window.devicePixelRatio);
      heroCanvas.style.width = `${Math.floor(width)}px`;
      heroCanvas.style.height = `${Math.floor(height)}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

      if (!points.length) {
        for (let i = 0; i < pointCount; i += 1) {
          points.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.34,
            vy: (Math.random() - 0.5) * 0.34,
            r: Math.random() * 1.7 + 0.3,
          });
        }
      }
    };

    const animate = () => {
      const width = heroCanvas.width / window.devicePixelRatio;
      const height = heroCanvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, width, height);

      points.forEach((point) => {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(22, 30, 46, 0.32)';
        ctx.fill();
      });

      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = 1 - dist / maxDistance;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.strokeStyle = `rgba(31, 39, 58, ${alpha * 0.11})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      window.requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();
    window.addEventListener('resize', resizeCanvas);
  }
}


if (!reducedMotion) {
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
      );

      revealElements.forEach((element, index) => {
        element.style.transitionDelay = `${Math.min(index * 55, 260)}ms`;
        revealObserver.observe(element);
      });
    } else {
      revealElements.forEach((element) => {
        element.classList.add('is-visible');
      });
    }
  }
} else {
  document.querySelectorAll('.reveal').forEach((element) => {
    element.classList.add('is-visible');
  });
}
