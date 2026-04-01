/* ============================================================
   FACTSENSE LANDING — INTERACTIONS & ANIMATIONS
   ============================================================ */

(function () {
  'use strict';

  /* ---- Navbar scroll effect ---- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  function onScroll() {
    // Frosted glass effect after scrolling
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link based on visible section
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
  onScroll(); // initial call

  /* ---- Mobile hamburger ---- */
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    // Animate burger lines
    const spans = hamburger.querySelectorAll('span');
    const isOpen = mobileMenu.classList.contains('open');
    spans[0].style.transform = isOpen ? 'translateY(7px) rotate(45deg)' : '';
    spans[1].style.opacity   = isOpen ? '0' : '';
    spans[2].style.transform = isOpen ? 'translateY(-7px) rotate(-45deg)' : '';
  });

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ---- Intersection Observer — reveal animations ---- */
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

  // Sticky notes reveal
  const stickyObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.sticky-note').forEach(note => stickyObs.observe(note));

  // Trigger hero sections immediately (they're visible on load)
  setTimeout(() => {
    const heroLeft  = document.getElementById('hero-left');
    const heroRight = document.getElementById('hero-right');
    if (heroLeft)  heroLeft.classList.add('visible');
    if (heroRight) heroRight.classList.add('visible');
  }, 200);

  /* ---- Status ticker cycling ---- */
  const tickerMessages = [
    'All systems nominal — 5 machines online',
    'Temperature: 72°C — Within safe range',
    'Vibration: 3.2g — Normal operation',
    'Gas Level: 82ppm — Monitoring closely',
    'Current Draw: 14A — Optimal efficiency',
    'Uptime: 99.9% — 12 days continuous',
  ];

  let tickerIndex = 0;
  const tickerEl = document.getElementById('ticker-text');

  function cycleTicker() {
    if (!tickerEl) return;
    tickerEl.style.opacity = '0';
    tickerEl.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      tickerIndex = (tickerIndex + 1) % tickerMessages.length;
      tickerEl.textContent = tickerMessages[tickerIndex];
      tickerEl.style.transition = 'opacity 0.4s, transform 0.4s';
      tickerEl.style.opacity = '1';
      tickerEl.style.transform = 'translateY(0)';
    }, 300);
  }

  if (tickerEl) {
    tickerEl.style.transition = 'opacity 0.4s, transform 0.4s';
    setInterval(cycleTicker, 3500);
  }

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

  /* ---- Node value pulsing (live feel) ---- */
  const sensorValues = {
    temp:    { el: null, base: 72,  range: 5,  unit: '°C',  key: 'node-temp' },
    vib:     { el: null, base: 3.2, range: 0.8, unit: 'g',  key: 'node-vib'  },
    gas:     { el: null, base: 82,  range: 8,  unit: 'ppm', key: 'node-gas'  },
    current: { el: null, base: 14,  range: 2,  unit: 'A',   key: 'node-cur'  },
  };

  // Grab val spans within orbit nodes
  document.querySelectorAll('.orbit-node').forEach(node => {
    const valEl = node.querySelector('.node-val');
    const labelEl = node.querySelector('.node-label');
    if (!valEl || !labelEl) return;
    const label = labelEl.textContent.trim().toLowerCase();
    if (label === 'temp')    sensorValues.temp.el    = valEl;
    if (label === 'vib')     sensorValues.vib.el     = valEl;
    if (label === 'gas')     sensorValues.gas.el     = valEl;
    if (label === 'current') sensorValues.current.el = valEl;
  });

  function jitter(base, range) {
    return (base + (Math.random() - 0.5) * 2 * range).toFixed(1);
  }

  function updateNodeValues() {
    Object.values(sensorValues).forEach(s => {
      if (!s.el) return;
      const val = jitter(s.base, s.range);
      s.el.style.transition = 'opacity 0.3s';
      s.el.style.opacity = '0.4';
      setTimeout(() => {
        s.el.textContent = val + s.unit;
        s.el.style.opacity = '1';
      }, 300);
    });
  }

  setInterval(updateNodeValues, 2500);

  /* ---- Reinitialise Lucide after DOM is ready ---- */
  document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
  });

})();
