/* ═══════════════════════════════════════════════
   BRIVENT — GLOBAL JAVASCRIPT
   Cursor · Nav · Reveal · Count · Tilt · Grid
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── PAGE LOADER ─── */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) setTimeout(() => loader.classList.add('gone'), 700);
  });

  /* ─── CUSTOM CURSOR ─── */
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  if (dot && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
    (function animCursor() {
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      rx += (mx - rx) * 0.10;
      ry += (my - ry) * 0.10;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animCursor);
    })();
    document.querySelectorAll('a, button, [data-hov]').forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.add('hov'); ring.classList.add('hov'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('hov'); ring.classList.remove('hov'); });
    });
  }

  /* ─── NAVIGATION ─── */
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const mmenu  = document.getElementById('mMenu');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  if (burger && mmenu) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      mmenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mmenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        mmenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* Active nav link */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ─── SCROLL REVEAL ─── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const d  = parseInt(el.dataset.d || 0);
        setTimeout(() => el.classList.add('vis'), d * 80);
        io.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('vis'));
  }

  /* ─── COUNT-UP ─── */
  function runCount(el) {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 2200;
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + (decimals ? (target * e).toFixed(decimals) : Math.floor(target * e)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const cntIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target._counted) {
        e.target._counted = true;
        runCount(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => cntIO.observe(el));

  /* ─── 3D CARD TILT ─── */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - .5) * 10;
      const y = ((e.clientY - r.top)  / r.height - .5) * 10;
      card.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-6px)`;
      card.style.transition = 'none';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1)';
    });
  });

  /* ─── MAGNETIC BUTTONS ─── */
  document.querySelectorAll('[data-mag]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * .28;
      const y = (e.clientY - r.top  - r.height / 2) * .28;
      el.style.transform  = `translate(${x}px,${y}px)`;
      el.style.transition = 'none';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform  = '';
      el.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1)';
    });
  });

  /* ─── PERSPECTIVE GRID CANVAS ─── */
  const canvas = document.getElementById('gridCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, frame = 0;
    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    const LINES_V = 20;
    const LINES_H = 18;
    const SPEED   = 0.4;
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      const hy  = H * 0.52;
      const cx  = W / 2;
      const off = (frame * SPEED) % (H / LINES_H);
      /* vertical converging lines */
      for (let i = 0; i <= LINES_V; i++) {
        const t     = i / LINES_V;
        const bx    = t * W;
        const dist  = Math.abs(t - .5) * 2;
        const alpha = Math.max(0, (1 - dist) * .22);
        ctx.beginPath();
        ctx.moveTo(cx, hy);
        ctx.lineTo(bx, H * 1.1);
        ctx.strokeStyle = `rgba(21,43,249,${alpha})`;
        ctx.lineWidth   = .8;
        ctx.stroke();
      }
      /* receding horizontal lines */
      for (let i = 0; i < LINES_H; i++) {
        const raw  = ((i / LINES_H) * (H - hy) + off);
        const prog = raw / (H - hy);
        if (prog < 0 || prog > 1.1) continue;
        const ease = prog * prog;
        const y    = hy + ease * (H - hy);
        const span = ease * W * 1.6;
        const a    = ease * .28;
        ctx.beginPath();
        ctx.moveTo(cx - span / 2, y);
        ctx.lineTo(cx + span / 2, y);
        ctx.strokeStyle = `rgba(21,43,249,${a})`;
        ctx.lineWidth   = .7;
        ctx.stroke();
      }
      /* subtle horizon glow */
      const grd = ctx.createLinearGradient(0, hy - 40, 0, hy + 60);
      grd.addColorStop(0, 'transparent');
      grd.addColorStop(.5, 'rgba(21,43,249,.06)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, hy - 40, W, 100);
      frame++;
      requestAnimationFrame(draw);
    })();
  }

  /* ─── PARTICLE CANVAS ─── */
  const pCanvas = document.getElementById('particleCanvas');
  if (pCanvas) {
    const pCtx = pCanvas.getContext('2d');
    let pW, pH;
    const resizeP = () => {
      pW = pCanvas.width  = pCanvas.offsetWidth;
      pH = pCanvas.height = pCanvas.offsetHeight;
    };
    window.addEventListener('resize', resizeP);
    resizeP();
    const NUM    = 90;
    const LINK   = 110;
    const COLORS = ['rgba(21,43,249,', 'rgba(255,17,11,', 'rgba(215,215,255,'];
    const particles = Array.from({ length: NUM }, () => ({
      x: Math.random() * pW,
      y: Math.random() * pH,
      vx: (Math.random() - .5) * .5,
      vy: (Math.random() - .5) * .5,
      r:  Math.random() * 2 + .8,
      c:  COLORS[Math.floor(Math.random() * COLORS.length)],
      o:  Math.random(),
      op: (Math.random() - .5) * .008,
    }));
    (function animP() {
      pCtx.clearRect(0, 0, pW, pH);
      particles.forEach((p, i) => {
        p.x  += p.vx; p.y  += p.vy;
        p.o  += p.op;
        if (p.o > .9 || p.o < .1) p.op *= -1;
        if (p.x < 0) p.x = pW; if (p.x > pW) p.x = 0;
        if (p.y < 0) p.y = pH; if (p.y > pH) p.y = 0;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pCtx.fillStyle = p.c + p.o + ')';
        pCtx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q  = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) {
            const a = (1 - dist / LINK) * .18;
            pCtx.beginPath();
            pCtx.moveTo(p.x, p.y);
            pCtx.lineTo(q.x, q.y);
            pCtx.strokeStyle = `rgba(21,43,249,${a})`;
            pCtx.lineWidth   = .6;
            pCtx.stroke();
          }
        }
      });
      requestAnimationFrame(animP);
    })();
  }

  /* ─── FORM HANDLER ─── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const msg = document.getElementById('formMsg');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          msg.className = 'form-msg success';
          msg.textContent = 'Message sent! We\'ll get back to you shortly.';
          form.reset();
        } else {
          throw new Error();
        }
      } catch {
        msg.className = 'form-msg error';
        msg.textContent = 'Something went wrong. Please email us directly at hello@brivent.co';
      }
      btn.disabled = false;
      btn.innerHTML = 'Send Message <i class="fa-solid fa-arrow-right"></i>';
      setTimeout(() => { msg.className = 'form-msg'; msg.textContent = ''; }, 6000);
    });
  }

})();
