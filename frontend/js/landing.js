(function () {
  'use strict';

  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    const sections = ['home', 'about', 'features', 'footer'];
    let current = 'home';

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.45) current = id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    const isOpen = mobileMenu.classList.contains('open');
    spans[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '';
    spans[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
  });

  document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ---- Intersection Observer -- reveal animations ---- */
  const revealTargets = [
    { id: 'hero-left',    cls: 'visible' },
    { id: 'hero-right',   cls: 'visible' },
    { id: 'about-left',   cls: 'visible' },
    { id: 'about-right',  cls: 'visible' },
  ];

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });

  revealTargets.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) revealObs.observe(el);
  });

  const stickyObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.sticky-note').forEach(note => stickyObs.observe(note));

  setTimeout(() => {
    const heroLeft  = document.getElementById('hero-left');
    const heroRight = document.getElementById('hero-right');
    if (heroLeft)  heroLeft.classList.add('visible');
    if (heroRight) heroRight.classList.add('visible');
  }, 200);

  /* ---- Smooth scroll for all anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- Parallax orb effect on mouse move ---- */
  const heroOrbs = document.querySelectorAll('.hero-orb');

  document.addEventListener('mousemove', (e) => {
    const { innerWidth: W, innerHeight: H } = window;
    const cx = e.clientX / W - 0.5;
    const cy = e.clientY / H - 0.5;

    heroOrbs.forEach((orb, i) => {
      const depth = (i + 1) * 12;
      orb.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
    });
  });

  /* ---- About metric bars animation trigger ---- */
  const aboutSection = document.getElementById('about');
  let barsAnimated = false;

  const metricsObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !barsAnimated) {
        barsAnimated = true;
        document.querySelectorAll('.av-metric-bar').forEach(bar => {
          bar.style.animationPlayState = 'running';
        });
      }
    });
  }, { threshold: 0.3 });

  if (aboutSection) metricsObs.observe(aboutSection);

  /* ---- Reinitialise Lucide after DOM is ready ---- */
  document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
  });

})();

