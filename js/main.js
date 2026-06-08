// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// Mobile dropdown toggles
document.querySelectorAll('.has-dropdown > a').forEach(link => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
      e.preventDefault();
      link.parentElement.classList.toggle('open');
    }
  });
});

// Mobile sub-dropdown toggles (Adquiere Bitcoin → lnp2pbot/Mostro)
document.querySelectorAll('.has-subdropdown > a').forEach(link => {
  link.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
      e.preventDefault();
      e.stopPropagation();
      link.parentElement.classList.toggle('open');
    }
  });
});

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links > li > a').forEach(link => {
  const href = link.getAttribute('href').split('#')[0];
  if (href === currentPage) link.parentElement.classList.add('active');
});

// ── Paridad SAT/BOB via Yadio API ────────────────────────────────
async function fetchParidad() {
  const els = document.querySelectorAll('[data-yadio="bob-sat"]');
  if (!els.length) return;

  try {
    // GET /exrates/BOB → data.BTC = precio de 1 BTC en bolivianos
    const res = await fetch('https://api.yadio.io/exrates/BOB');
    if (!res.ok) return;
    const data = await res.json();
    const btcInBob = data.BTC; // ej. 622792 BOB por BTC
    if (!btcInBob || btcInBob <= 0) return;

    const satPerBob = Math.round(100_000_000 / btcInBob); // 1 BOB = X SAT
    // Progress toward 1 SAT = 1 BOB (when satPerBob reaches 1)
    // Current: 1 BOB = 161 SAT → 1 SAT = 1/161 BOB
    // Goal:    1 BOB = 1 SAT  → 1 SAT = 1 BOB
    // Progress = (1/satPerBob) * 100 %
    const progressPct = (1 / satPerBob) * 100;
    const faltaPct    = (100 - progressPct).toFixed(4);
    const progressStr = progressPct.toFixed(4);

    document.querySelectorAll('[data-yadio="bob-sat"]').forEach(el => {
      el.textContent = satPerBob;
    });
    document.querySelectorAll('[data-yadio="progress"]').forEach(el => {
      el.textContent = progressStr;
    });
    document.querySelectorAll('[data-yadio="falta"]').forEach(el => {
      el.textContent = faltaPct;
    });

  } catch {
    // falla silenciosa — queda el valor estático
  }
}

fetchParidad();
// Refresh every 5 minutes
setInterval(fetchParidad, 5 * 60 * 1000);

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});
