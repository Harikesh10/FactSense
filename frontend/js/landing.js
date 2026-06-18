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

  /* ---- Status ticker cycling ---- */
  const tickerMessages = [
    'All systems nominal — 5 machines online',
    'Temperature: 72°C — Within safe range',
    'Vibration: 3.2g — Normal operation',
    'Gas Level: 82ppm — Monitoring closely',
    'Current Draw: 14A — Optimal efficiency',
    'Load Sensor: 25kg — Within capacity',
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

  /* ---- Three.js 3D Scene ---- */
  const canvas = document.getElementById('three-canvas');
  const container = document.getElementById('iiot-visual');

  function initThreeScene() {
    if (!canvas || !container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 380;

    canvas.width = width;
    canvas.height = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 180);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /* Ambient light */
    scene.add(new THREE.AmbientLight(0x404060));

    /* Main light */
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    const backLight = new THREE.DirectionalLight(0xdc2626, 0.3);
    backLight.position.set(-1, -1, -1);
    scene.add(backLight);

    /* Central glowing cube - machine core */
    const coreGeo = new THREE.BoxGeometry(18, 18, 18);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0xdc2626,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.9,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0, 0);
    scene.add(core);

    /* Inner glow sphere */
    const glowGeo = new THREE.SphereGeometry(12, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xdc2626,
      transparent: true,
      opacity: 0.15,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    /* Orbiting rings */
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xdc2626,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });

    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(36 + i * 12, 0.5, 16, 64);
      const ring = new THREE.Mesh(ringGeo, ringMat.clone());
      ring.rotation.x = Math.PI / 2 + i * 0.3;
      ring.rotation.y = i * 0.5;
      scene.add(ring);
      rings.push(ring);
    }

    /* Orbiting particles */
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 40 + Math.random() * 50;
      particlePos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = radius * Math.cos(phi);
      particleSizes[i] = 0.5 + Math.random() * 2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0xdc2626,
      size: 0.8,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* Small floating dots near core */
    const dotCount = 80;
    const dotGeo = new THREE.BufferGeometry();
    const dotPos = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 14 + Math.random() * 16;
      dotPos[i * 3] = radius * Math.cos(theta);
      dotPos[i * 3 + 1] = radius * Math.sin(theta) * 0.5;
      dotPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xff6666,
      size: 0.4,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    /* Data flow lines */
    const flowGroup = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const points = [];
      for (let t = 0; t <= 1; t += 0.02) {
        const r = 20 + t * 35;
        const a = angle + t * 0.8;
        points.push(new THREE.Vector3(
          r * Math.cos(a),
          r * Math.sin(a) * 0.3,
          (t - 0.5) * 20
        ));
      }
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineBasicMaterial({
        color: 0xdc2626,
        transparent: true,
        opacity: 0.08 + i * 0.02,
      });
      const curve = new THREE.Line(curveGeo, curveMat);
      flowGroup.add(curve);
    }
    scene.add(flowGroup);

    function animate() {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      core.rotation.x += 0.008;
      core.rotation.y += 0.012;
      core.rotation.z += 0.004;

      glow.scale.setScalar(1 + Math.sin(time * 0.5) * 0.1);

      rings.forEach((ring, i) => {
        ring.rotation.z += 0.003 * (i + 1);
        ring.rotation.x += 0.002 * (i + 1);
      });

      particles.rotation.y += 0.0015;
      particles.rotation.x += 0.0005;

      dots.rotation.y += 0.005;
      dots.rotation.x += 0.003;

      flowGroup.rotation.y += 0.004;
      flowGroup.rotation.x += 0.002;

      renderer.render(scene, camera);
    }

    animate();

    /* Resize handler */
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 380;
      canvas.width = w;
      canvas.height = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);
  }

  if (typeof THREE !== 'undefined') {
    initThreeScene();
  }

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
    load:    { el: null, base: 25,  range: 5,  unit: 'kg',  key: 'node-load' },
  };

  Object.keys(sensorValues).forEach(key => {
    const s = sensorValues[key];
    const el = document.getElementById(s.key);
    if (el) s.el = el;
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
