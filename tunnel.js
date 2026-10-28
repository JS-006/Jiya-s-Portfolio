/* ===================================================================
   tunnel.js — IMMERSIVE FLY-THROUGH SCROLL
   Every page is a "screen" floating in a 3D tunnel. Scrolling flies the camera
   forward / back through them. Pages stay exactly as designed (cream and all);
   only the space around them is dark. Pages list: assets/pages.js
   =================================================================== */
const PAGES = window.PAGES;
const N = PAGES.length;
const DW = 1440, DH = 810;
const T = {
  gap: 1000,          // distance between screens in 3D (bigger = longer flight)
  speed: 6.0,         // how fast the camera catches the target (higher = snappier)
  wheelSens: .0035,   // page-fraction per wheel pixel
  gestureGap: 140,    // ms of silence that ends one scroll gesture
  fill: .9,           // how much of the window the resting page fills
};

const world = document.getElementById('world');
const hudTitle = document.querySelector('#now b');
const hudNum = document.querySelector('#now small');
const rail = document.getElementById('rail');

/* ---- build cards ---- */
const cards = PAGES.map((p, i) => {
  const el = document.createElement('div'); el.className = 'card';
  let poster;
  if (p.poster) { poster = document.createElement('img'); poster.className = 'poster'; poster.src = p.poster; poster.alt = p.title; poster.decoding = 'async'; }
  else { poster = document.createElement('div'); poster.className = 'ph'; poster.textContent = p.title; }
  const fr = document.createElement('iframe'); fr.title = p.title; fr.tabIndex = -1; fr.setAttribute('scrolling', 'no'); fr.allow = 'autoplay; fullscreen';
  el.append(poster, fr); world.appendChild(el);
  const tick = document.createElement('i'); rail.appendChild(tick);
  return { el, fr, tick, i, live: false, side: i % 2 ? 1 : -1, lift: (i % 3) - 1, shown: '' };
});

function load(c) {
  if (c.live) return; c.live = true; c.fr.classList.remove('show');
  c.fr.onload = () => { if (c.live) c.ready = true; };
  c.ready = false;
  const s = PAGES[c.i].src; c.fr.src = s + (s.includes('?') ? '&' : '?') + 't=' + Date.now();
}
function unload(c) {
  if (!c.live) return; c.live = false; c.ready = false;
  c.fr.classList.remove('show', 'hit'); c.fr.removeAttribute('src');
}

/* ---- sizing ---- */
let S = 1;
function fit() { S = Math.min(innerWidth / DW, innerHeight / DH) * T.fill; }
addEventListener('resize', fit); fit();

/* ---- camera state ---- */
let pos = -1.15, target = 0, vel = 0, want = 0;     // starts outside the tunnel and flies in
let gStart = 0, gActive = false, gTimer = 0;

const ss = t => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function render() {
  for (const c of cards) {
    const r = c.i - pos, ar = Math.abs(r);
    if (r < -0.75 || r > 4.2) { if (c.shown !== 'none') { c.el.style.display = 'none'; c.shown = 'none'; } continue; }
    if (c.shown !== 'on') { c.el.style.display = ''; c.shown = 'on'; }
    const k = ss(clamp(r >= 0 ? r : -r * 1.3, 0, 1));            // 0 at the camera → 1 away
    const ox = c.side * 640 * k, oy = c.lift * 150 * k;
    const ry = -c.side * 30 * k, rz = c.side * 4.5 * k;
    c.el.style.transform = `translate3d(${ox}px,${oy}px,${-r * T.gap}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${S})`;
    c.el.style.opacity = r < 0 ? clamp(1 - (-r) / 0.5, 0, 1) : clamp(1.1 - Math.max(0, r - 0.8) * 0.42, 0, 1);
    c.el.style.setProperty('--fog', r > 0 ? clamp(r * 0.3, 0, .8) : 0);
    // live page only for the one we are going to / sitting on
    const isWant = c.i === want;
    if (isWant) {
      if (!c.live) load(c);
      const near = ar < 0.28;
      c.fr.classList.toggle('show', near && c.ready);
      c.fr.classList.toggle('hit', ar < 0.03 && c.ready);
    } else if (c.live && ar > 0.5) unload(c);
    else if (c.live) c.fr.classList.remove('show', 'hit');
  }
  // camera tilt with speed
  world.style.transform = `rotateZ(${clamp(vel * -1.4, -5, 5)}deg) rotateX(${clamp(vel * 1.2, -4, 4)}deg)`;
  // HUD
  const idx = clamp(Math.round(pos), 0, N - 1);
  if (hudNum.dataset.i !== String(idx)) {
    hudNum.dataset.i = idx; hudTitle.classList.add('swap');
    setTimeout(() => { hudTitle.textContent = PAGES[idx].title; hudNum.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'); hudTitle.classList.remove('swap'); }, 220);
  }
  cards.forEach(c => { c.tick.classList.toggle('on', c.i === idx); c.tick.classList.toggle('past', c.i < idx); });
}

/* ---- dust / speed streaks (canvas, reacts to camera speed) ---- */
const cv = document.getElementById('dust'), cx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
function size() { DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; }
addEventListener('resize', size); size();
const COLORS = ['247,246,229', '201,96,72', '159,169,139'];
const dust = Array.from({ length: 170 }, () => ({
  x: (Math.random() - .5) * 2600, y: (Math.random() - .5) * 1600, z: Math.random() * 3200,
  s: .6 + Math.random() * 1.8, c: COLORS[Math.random() < .6 ? 0 : Math.random() < .5 ? 1 : 2],
}));
const Z = 3200, FOC = 1100;
function drawDust(dt) {
  cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.clearRect(0, 0, W, H);
  const cz = pos * T.gap * .55, pz = (pos - vel * dt * 1.0) * T.gap * .55;
  for (const p of dust) {
    const z1 = ((p.z - cz) % Z + Z) % Z, z0 = ((p.z - pz) % Z + Z) % Z;
    const f1 = FOC / (z1 + 150), f0 = FOC / (z0 + 150);
    const x1 = W / 2 + p.x * f1, y1 = H / 2 + p.y * f1, x0 = W / 2 + p.x * f0, y0 = H / 2 + p.y * f0;
    if (x1 < -50 || x1 > W + 50 || y1 < -50 || y1 > H + 50) continue;
    const a = clamp((1 - z1 / Z) * .85, 0, .85);
    cx.strokeStyle = `rgba(${p.c},${a})`; cx.lineWidth = Math.max(.6, p.s * f1 * 1.4); cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x1, y1 + (Math.abs(vel) < .02 ? .01 : 0)); cx.stroke();
  }
}

/* ---- main loop: spring the camera toward the target ---- */
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  const prev = pos;
  pos += (target - pos) * (1 - Math.exp(-dt * T.speed));
  if (Math.abs(target - pos) < .0008) pos = target;
  vel = dt ? (pos - prev) / dt : 0;
  if (!gActive) want = clamp(Math.round(target), 0, N - 1);
  render(); drawDust(dt);
  requestAnimationFrame(frame);
}

/* ---- input: a gesture can scrub, but ends on exactly one page ---- */
function endGesture() {
  gActive = false;
  const d = target - gStart;
  target = clamp(gStart + (Math.abs(d) > .18 ? Math.sign(d) : 0), 0, N - 1);
}
function nudge(delta) {                                 // wheel pixels → camera
  document.body.classList.add('moved');
  if (!gActive) { gActive = true; gStart = Math.round(target); }
  target = clamp(target + delta * T.wheelSens, gStart - 1, gStart + 1);
  target = clamp(target, 0, N - 1);
  clearTimeout(gTimer); gTimer = setTimeout(endGesture, T.gestureGap);
}
function step(dir) {
  document.body.classList.add('moved');
  const base = Math.round(target); target = clamp(base + dir, 0, N - 1);
}
function onKey(k, shift) {
  if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(k) || (k === ' ' && !shift)) step(1);
  else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(k) || (k === ' ' && shift)) step(-1);
  else if (k === 'Home') { target = 0; } else if (k === 'End') { target = N - 1; }
}
addEventListener('wheel', e => { e.preventDefault(); nudge(e.deltaY); }, { passive: false });
addEventListener('keydown', e => { if (e.key === ' ') e.preventDefault(); onKey(e.key, e.shiftKey); });
let ty = null;
addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', e => e.preventDefault(), { passive: false });
addEventListener('touchend', e => { if (ty == null) return; const dy = ty - e.changedTouches[0].clientY; ty = null; if (Math.abs(dy) > 40) step(dy > 0 ? 1 : -1); }, { passive: true });
addEventListener('message', e => {                       // events forwarded from inside the pages (bridge.js)
  const d = e.data; if (!d || !d.__nav) return;
  if (d.t === 'wheel') nudge(d.dy);
  else if (d.t === 'swipe' && Math.abs(d.dy) > 40) step(d.dy > 0 ? 1 : -1);
  else if (d.t === 'key') onKey(d.key, d.shift);
});

requestAnimationFrame(frame);
