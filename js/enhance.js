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
