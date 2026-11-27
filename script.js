const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;

/* ---------- Año del footer ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Tema ----------
   El tema inicial (guardado o el del sistema) se aplica en un script dentro de <head>
   para que no haya parpadeo. Aquí solo se cambia y se recuerda. */
document.getElementById("theme-toggle").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (_) {}
});

/* ---------- Menú móvil ---------- */
const nav = document.getElementById("nav");
const navToggle = document.getElementById("nav-toggle");
const setMenu = (open) => {
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
};
navToggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
document.querySelectorAll("#nav-links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); navToggle.focus(); }
});
document.addEventListener("click", (e) => {
  if (nav.classList.contains("is-open") && !nav.contains(e.target)) setMenu(false);
});
matchMedia("(min-width: 641px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

/* ---------- Nav + barra de progreso ---------- */
const progress = document.getElementById("scroll-progress");
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  nav.classList.toggle("is-scrolled", scrollY > 20);
};
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Texto que se escribe solo ---------- */
const typed = document.getElementById("typed");
const words = ["APIs REST", "plataformas web", "servicios en Go", "bases de datos sólidas", "apps Android"];
if (!reduceMotion) {
  let w = 0, i = words[0].length, deleting = true;
  const tick = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    typed.textContent = word.slice(0, i);
    let delay = deleting ? 45 : 85;
    if (!deleting && i === word.length) { deleting = true; delay = 1800; }
    else if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 2200);
}

/* ---------- Aparición al hacer scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--delay", `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
  io.observe(el);
});

/* ---------- Contadores ---------- */
const counters = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || "";
    const start = performance.now(), dur = 1200;
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    };
    reduceMotion ? (el.textContent = end + suffix) : requestAnimationFrame(step);
    counters.unobserve(el);
  });
});
document.querySelectorAll("[data-count]").forEach((el) => counters.observe(el));

/* ---------- Efectos con ratón ---------- */
if (finePointer && !reduceMotion) {
  // Brillo que sigue al cursor
  const glow = document.getElementById("cursor-glow");
  addEventListener("pointermove", (e) => {
    glow.style.transform = `translate(${e.clientX - 240}px, ${e.clientY - 240}px)`;
  }, { passive: true });

  // Foco de luz dentro de las tarjetas
  document.querySelectorAll(".spotlight").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Inclinación 3D
  document.querySelectorAll(".tilt").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const rx = `${(-y * 8).toFixed(2)}deg`, ry = `${(x * 10).toFixed(2)}deg`;
      el.style.setProperty("--rx", rx);
      el.style.setProperty("--ry", ry);
      if (!el.classList.contains("project")) el.style.transform = `perspective(900px) rotateX(${rx}) rotateY(${ry})`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      if (!el.classList.contains("project")) el.style.transform = "";
    });
  });

  // Botones magnéticos
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/* ---------- Copiar email ---------- */
const copyBtn = document.getElementById("email-copy");
const hint = document.getElementById("email-hint");
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    hint.textContent = "¡Copiado!";
  } catch (_) {
    location.href = `mailto:${copyBtn.dataset.email}`;
  }
  setTimeout(() => (hint.textContent = "Copiar"), 1800);
});

/* ---------- Red de partículas en el hero ---------- */
const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");
let pts = [], W = 0, H = 0, mouse = { x: -9999, y: -9999 }, running = true;
const dpr = Math.min(devicePixelRatio || 1, 2);

const resize = () => {
  W = canvas.offsetWidth; H = canvas.offsetHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.round(Math.min(90, (W * H) / 16000));
  pts = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
  }));
};

const color = () => getComputedStyle(root).getPropertyValue("--accent-2").trim() || "#22d3ee";

const draw = () => {
  if (!running) return;
  ctx.clearRect(0, 0, W, H);
  const c = color();
  for (const p of pts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
    if (d < 140) { p.x += dx / d; p.y += dy / d; }
  }
  ctx.strokeStyle = c; ctx.fillStyle = c;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    for (let j = i + 1; j < pts.length; j++) {
      const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) { ctx.globalAlpha = (1 - d / 130) * 0.35; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (!reduceMotion) requestAnimationFrame(draw);
};

resize(); draw();
addEventListener("resize", resize);
canvas.parentElement.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
});
canvas.parentElement.addEventListener("pointerleave", () => (mouse = { x: -9999, y: -9999 }));
// Pausa la animación cuando el hero no está visible
new IntersectionObserver(([e]) => {
  const was = running; running = e.isIntersecting;
  if (running && !was && !reduceMotion) requestAnimationFrame(draw);
}).observe(canvas);
