// Mabimzaa : effets du site. Tout le contenu reste lisible sans JavaScript.
document.documentElement.classList.add("js");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Caviardage du dossier (clic / toucher) ----------
document.querySelectorAll(".redact").forEach((el) => {
  el.addEventListener("click", () => {
    const open = el.classList.toggle("is-open");
    el.setAttribute("aria-expanded", open ? "true" : "false");
  });
});

// ---------- Année du pied de page ----------
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// ---------- Barre de progression de lecture ----------
const bar = document.querySelector(".progress");
if (bar) {
  const upd = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty("--p", h > 0 ? scrollY / h : 0);
  };
  addEventListener("scroll", upd, { passive: true });
  upd();
}

// ---------- Titre qui se déchiffre ----------
const title = document.querySelector("[data-scramble]");
if (title && !reduce) {
  const final = title.textContent;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@";
  title.setAttribute("aria-label", final);
  const start = performance.now();
  const dur = 1100;
  const tick = (t) => {
    const k = Math.min(1, (t - start) / dur);
    const solved = Math.floor(final.length * k);
    let out = final.slice(0, solved);
    let noise = "";
    for (let i = solved; i < final.length; i++) {
      noise += final[i] === " " ? " " : chars[(Math.random() * chars.length) | 0];
    }
    title.textContent = out;
    if (noise) {
      const s = document.createElement("span");
      s.className = "scr";
      s.setAttribute("aria-hidden", "true");
      s.textContent = noise;
      title.appendChild(s);
    }
    if (k < 1) requestAnimationFrame(tick);
    else title.textContent = final;
  };
  requestAnimationFrame(tick);
}

// ---------- Graphe de liens en fond du hero ----------
const canvas = document.querySelector(".graph");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const labels = (canvas.dataset.labels || "").split("|").filter(Boolean);
  let W = 0, H = 0, nodes = [], mouse = { x: -999, y: -999 }, running = true;
  const dpr = Math.min(devicePixelRatio || 1, 2);

  const build = () => {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = W < 700 ? 26 : 58;
    nodes = Array.from({ length: n }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 1.2,
      label: W >= 700 && i < labels.length ? labels[i] : null,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const max = 150;
    for (const a of nodes) {
      if (!reduce) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        const dx = a.x - mouse.x, dy = a.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 140 && d > 0) { a.x += (dx / d) * 0.6; a.y += (dy / d) * 0.6; }
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < max) {
          const near = Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) < 170;
          ctx.strokeStyle = near ? `rgba(242,193,78,${0.55 * (1 - d / max)})` : `rgba(46,155,255,${0.32 * (1 - d / max)})`;
          ctx.lineWidth = near ? 1.2 : 0.8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.font = '12px "IBM Plex Sans", sans-serif';
    for (const a of nodes) {
      const near = Math.hypot(a.x - mouse.x, a.y - mouse.y) < 170;
      ctx.fillStyle = near ? "#f2c14e" : a.label ? "#2e9bff" : "rgba(143,161,186,.7)";
      ctx.beginPath(); ctx.arc(a.x, a.y, a.label ? a.r + 1.5 : a.r, 0, Math.PI * 2); ctx.fill();
      if (a.label) {
        ctx.fillStyle = near ? "#f2c14e" : "rgba(143,161,186,.85)";
        ctx.fillText(a.label, a.x + 8, a.y + 4);
      }
    }
    if (running && !reduce) requestAnimationFrame(draw);
  };

  build();
  draw();
  addEventListener("resize", () => { build(); if (reduce) draw(); });
  canvas.parentElement.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  canvas.parentElement.addEventListener("pointerleave", () => { mouse = { x: -999, y: -999 }; });
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting;
    if (running && !was && !reduce) requestAnimationFrame(draw);
  }).observe(canvas);
}

// ---------- Halo qui suit la souris ----------
document.querySelectorAll(".glow").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// ---------- Apparition au défilement ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- Frise d'attaque ----------
const attack = document.querySelector(".attack");
if (attack) {
  const steps = [...attack.querySelectorAll("li")];
  const upd = () => {
    const r = attack.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    attack.style.setProperty("--fill", k);
    steps.forEach((s) => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle("is-on", sr.top < innerHeight * 0.6);
    });
  };
  addEventListener("scroll", upd, { passive: true });
  upd();
}

// ---------- Test d'exposition ----------
const exp = document.querySelector("[data-exposure]");
if (exp) {
  const boxes = [...exp.querySelectorAll("input[type=checkbox]")];
  const total = boxes.reduce((s, b) => s + Number(b.value), 0);
  const arc = exp.querySelector(".val-arc");
  const len = arc.getTotalLength();
  arc.style.strokeDasharray = len;
  const scoreEl = exp.querySelector(".meter-score");
  const levelEl = exp.querySelector(".meter-level");
  const adviceEl = exp.querySelector(".meter-advice");
  const levels = JSON.parse(exp.dataset.levels);
  let shown = 0;
  const animateTo = (target) => {
    if (reduce) { shown = target; scoreEl.textContent = target; return; }
    const from = shown, t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 500);
      shown = Math.round(from + (target - from) * k);
      scoreEl.textContent = shown;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const upd = () => {
    const pts = boxes.filter((b) => b.checked).reduce((s, b) => s + Number(b.value), 0);
    const pct = Math.round((pts / total) * 100);
    arc.style.strokeDashoffset = len * (1 - pct / 100);
    const lvl = levels.find((l) => pct <= l.max);
    arc.style.stroke = lvl.color;
    levelEl.textContent = lvl.label;
    levelEl.style.color = lvl.color;
    adviceEl.textContent = lvl.advice;
    animateTo(pct);
  };
  boxes.forEach((b) => b.addEventListener("change", upd));
  upd();
}

// ---------- E-mail caviardé (anti-robots) ----------
document.querySelectorAll("[data-mail]").forEach((box) => {
  const val = box.querySelector(".mail-value");
  const btn = box.querySelector("[data-reveal]");
  const copy = box.querySelector("[data-copy]");
  const addr = () => atob(box.dataset.u).split("").reverse().join("") + "@" + atob(box.dataset.d);
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  btn.hidden = false;
  btn.addEventListener("click", () => {
    const a = addr();
    val.classList.remove("is-hidden");
    btn.hidden = true;
    const done = () => {
      val.innerHTML = "";
      const link = document.createElement("a");
      link.href = "mailto:" + a;
      link.textContent = a;
      val.appendChild(link);
      if (copy) copy.hidden = false;
    };
    if (reduce) return done();
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 700);
      const n = Math.floor(a.length * k);
      val.textContent = a.slice(0, n) + Array.from(a.slice(n), (c) => (c === "@" || c === "." ? c : chars[(Math.random() * 36) | 0])).join("");
      if (k < 1) requestAnimationFrame(tick); else done();
    };
    requestAnimationFrame(tick);
  });
  if (copy) {
    copy.addEventListener("click", async () => {
      const a = addr();
      try { await navigator.clipboard.writeText(a); copy.textContent = copy.dataset.done; }
      catch { const r = document.createRange(); r.selectNodeContents(val); getSelection().removeAllRanges(); getSelection().addRange(r); }
      setTimeout(() => { copy.textContent = copy.dataset.label; }, 2000);
    });
  }
});
