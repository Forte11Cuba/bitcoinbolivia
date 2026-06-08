/* ════════════════════════════════════════════════════════════════
   enhance.js — micro-interacciones del rediseño
   · Scroll reveal (IntersectionObserver)
   · Conteo animado de estadísticas
   · Barra de progreso de paridad SAT/BOB (escala logarítmica honesta)
   ════════════════════════════════════════════════════════════════ */

/* ─── 1. SCROLL REVEAL ────────────────────────────────────── */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
})();

/* ─── 2. COUNT-UP STATS ───────────────────────────────────── */
(function () {
  const nums = document.querySelectorAll('[data-countup]');
  if (!nums.length) return;

  function animate(el) {
    const target = parseFloat(el.dataset.countup);
    const suffix = el.dataset.suffix || '';
    const dur = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  nums.forEach((el) => io.observe(el));
})();

/* ─── 3. BARRA DE PARIDAD SAT/BOB ─────────────────────────── */
(function () {
  const fill = document.getElementById('parityFill');
  if (!fill) return;

  // Escala logarítmica: del punto de referencia 1 BOB = 1.000 sats
  // hacia la meta 1 BOB = 1 sat. Refleja órdenes de magnitud recorridos.
  const REF = 1000;
  function setBar(satPerBob) {
    const prog = (Math.log10(REF) - Math.log10(satPerBob)) /
                 (Math.log10(REF) - Math.log10(1));
    const frac = Math.max(0.025, Math.min(1, prog));
    // scaleX transiciona de forma fiable (width se atasca en algunos motores)
    fill.style.transform = 'scaleX(' + frac.toFixed(3) + ')';
  }

  // valor estático de respaldo
  setBar(161);

  fetch('https://api.yadio.io/exrates/BOB')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !d.BTC) return;
      const satPerBob = Math.round(100_000_000 / d.BTC);
      if (satPerBob > 0) setBar(satPerBob);
    })
    .catch(() => {});
})();

/* ─── 4. NEWS CAROUSEL · flechas de navegación ─────────────── */
(function () {
  const carousel = document.getElementById('newsCarousel');
  if (!carousel) return;
  const prev = document.querySelector('.news-arrow-prev');
  const next = document.querySelector('.news-arrow-next');
  if (!prev || !next) return;

  function updateArrows() {
    const max = carousel.scrollWidth - carousel.clientWidth - 2;
    prev.disabled = carousel.scrollLeft <= 2;
    next.disabled = carousel.scrollLeft >= max;
  }

  const cardWidth = 358; // 340px card + ~18px gap
  prev.addEventListener('click', () => {
    carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
  });
  carousel.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();
})();

/* ─── 5. BLOCK HEIGHT + COIN SPIN ON NEW BLOCK ────────────── */
(function () {
  const heightEl = document.getElementById('blockHeight');
  if (!heightEl) return;
  const coin = document.querySelector('.parity-strip .ps-coin');
  const fmt = new Intl.NumberFormat('es-BO');
  let lastHeight = 0;

  function triggerSpin() {
    if (!coin) return;
    coin.classList.remove('spin');
    // forzar reflow para reiniciar la animación
    void coin.offsetWidth;
    coin.classList.add('spin');
    setTimeout(() => coin.classList.remove('spin'), 1600);
  }

  async function tick() {
    try {
      const res = await fetch('https://mempool.space/api/blocks/tip/height');
      if (!res.ok) return;
      const h = parseInt(await res.text(), 10);
      if (!h || Number.isNaN(h)) return;
      if (lastHeight && h > lastHeight) triggerSpin();
      heightEl.textContent = '#' + fmt.format(h);
      lastHeight = h;
    } catch (_) { /* offline o bloqueado: silencioso */ }
  }

  tick();
  setInterval(tick, 30_000); // poll cada 30s
})();
