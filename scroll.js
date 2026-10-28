/* ===================================================================
   scroll.js — joins all page files into ONE smooth scrolling website.
   ADD A NEW PAGE: put your file in /pages and add one line to PAGES.
   =================================================================== */
const PAGES = window.PAGES;

const SETTINGS = {
  duration: 1250,      // ms for one page-to-page move
  ease: t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2,   // easeInOutCubic
  outgoingShift: .28,  // how far the old page drifts up (x screen height) — parallax
  outgoingScale: .08,  // how much the old page shrinks
  outgoingDim: .55,    // how dark the old page gets
  swipeMin: 40,        // px to count as a swipe
  wheelGap: 110,       // ms of quiet needed before a new wheel gesture counts
};

const deck = document.getElementById('deck');
const bar = document.getElementById('bar');
const countEl = document.querySelector('#count b');
const DW = 1440, DH = 810;                      // design size every page is built for

/* ---- build panels ---- */
const panels = PAGES.map((p, i) => {
  const el = document.createElement('section');
  el.className = 'panel'; el.dataset.i = i; el.setAttribute('aria-label', p.title);
  const fr = document.createElement('iframe');
  fr.className = 'frame'; fr.title = p.title; fr.setAttribute('scrolling', 'no'); fr.allow = 'autoplay; fullscreen'; fr.tabIndex = -1;
  el.appendChild(fr); deck.appendChild(el);
  return { el, fr, src: p.src, live: false };
});

/* load / unload so each page replays its own intro animation every time you arrive */
function load(i) {
  const p = panels[i]; if (!p || p.live) return;
  p.live = true; p.fr.classList.remove('ready');
  p.fr.onload = () => requestAnimationFrame(() => p.fr.classList.add('ready'));
  p.fr.src = p.src + (p.src.includes('?') ? '&' : '?') + 'v=' + Date.now();
}
function unload(i) {
  const p = panels[i]; if (!p || !p.live) return;
  p.live = false; p.fr.classList.remove('ready'); p.fr.removeAttribute('src');
}

/* ---- scale pages to always fit the window ---- */
function fit() {
  const s = Math.min(innerWidth / DW, innerHeight / DH);
  document.documentElement.style.setProperty('--s', s);
  document.documentElement.style.setProperty('--w', DW);
  document.documentElement.style.setProperty('--h', DH);
}
addEventListener('resize', fit); fit();

/* ---- the position engine: pos is a float (0 = first page, 1 = second …) ---- */
let pos = 0, from = 0, to = 0, t0 = 0, moving = false, index = 0;

function render() {
  const H = innerHeight;
  panels.forEach((p, i) => {
    const r = i - pos;                                  // <0 above, 0 current, >0 below
    const vis = r < 1 && r > -1.001;
    p.el.style.visibility = vis ? 'visible' : 'hidden';
    if (!vis) return;
    let y, sc = 1, op = 1, dim = 0, z = i;
    if (r > 0) {                                        // incoming: slides up from below, sits on top
      y = r * H; z = 10 + i;
      sc = 1 + r * .04;
    } else {                                            // outgoing: drifts up, shrinks, dims
      const k = -r;
      y = -k * H * SETTINGS.outgoingShift;
      sc = 1 - k * SETTINGS.outgoingScale;
      dim = k * SETTINGS.outgoingDim;
      op = 1 - k * .35;
    }
    p.el.style.transform = `translate3d(0,${y}px,0) scale(${sc})`;
    p.el.style.opacity = op;
    p.el.style.zIndex = z;
    p.el.style.setProperty('--dim', dim);
    p.el.style.borderRadius = r > 0 ? `${Math.min(r,1) * 38}px ${Math.min(r,1) * 38}px 0 0` : '0';
    p.el.style.boxShadow = r > 0 ? `0 -30px 80px rgba(11,42,32,${.30 * (1 - r)})` : 'none';
  });
  const prog = panels.length > 1 ? pos / (panels.length - 1) : 1;
  bar.style.transform = `scaleX(${prog})`;
}

function frame(now) {
  if (moving) {
    const k = Math.min(1, (now - t0) / SETTINGS.duration);
    pos = from + (to - from) * SETTINGS.ease(k);
    if (k >= 1) {
      moving = false; pos = to;
      panels.forEach((_, i) => { if (i !== index) unload(i); });   // free CPU: only the current page stays alive
    }
    render();
  }
  requestAnimationFrame(frame);
}

function go(i) {
  i = Math.max(0, Math.min(panels.length - 1, i));
  if (i === index || moving) return;
  document.body.classList.add('moved');
  load(i);                                              // start the new page's animation as it slides in
  from = pos; to = i; t0 = performance.now(); moving = true; index = i;
  document.body.classList.toggle('last', index === panels.length - 1);
  countEl.style.transform = 'translateY(-6px)'; countEl.style.opacity = 0;
  setTimeout(() => {
    countEl.textContent = String(index + 1).padStart(2, '0');
    countEl.style.transform = 'translateY(6px)';
    requestAnimationFrame(() => { countEl.style.transform = ''; countEl.style.opacity = 1; });
  }, SETTINGS.duration * .3);
}

/* ---- input: wheel, touch/swipe, keyboard (also forwarded from inside pages) ---- */
let lastWheel = 0;
function onWheel(dy) {
  const now = performance.now();
  const fresh = now - lastWheel > SETTINGS.wheelGap;    // momentum tails keep lastWheel fresh → ignored
  lastWheel = now;
  if (moving || !fresh || Math.abs(dy) < 4) return;
  go(index + (dy > 0 ? 1 : -1));
}
function onKey(k, shift) {
  if (['ArrowDown', 'PageDown'].includes(k) || (k === ' ' && !shift)) go(index + 1);
  else if (['ArrowUp', 'PageUp'].includes(k) || (k === ' ' && shift)) go(index - 1);
  else if (k === 'Home') go(0);
  else if (k === 'End') go(panels.length - 1);
}
addEventListener('wheel', e => { e.preventDefault(); onWheel(e.deltaY); }, { passive: false });
addEventListener('keydown', e => { if (e.key === ' ') e.preventDefault(); onKey(e.key, e.shiftKey); });
let ty = null;
addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', e => e.preventDefault(), { passive: false });
addEventListener('touchend', e => {
  if (ty == null) return; const dy = ty - e.changedTouches[0].clientY; ty = null;
  if (Math.abs(dy) > SETTINGS.swipeMin) go(index + (dy > 0 ? 1 : -1));
}, { passive: true });
addEventListener('message', e => {
  const d = e.data; if (!d || !d.__nav) return;
  if (d.t === 'wheel') onWheel(d.dy);
  else if (d.t === 'swipe' && Math.abs(d.dy) > SETTINGS.swipeMin) go(index + (d.dy > 0 ? 1 : -1));
  else if (d.t === 'key') onKey(d.key, d.shift);
});

/* ---- go ---- */
load(0); render(); requestAnimationFrame(frame);
countEl.textContent = '01';
document.getElementById('total').textContent = String(PAGES.length).padStart(2, '0');
