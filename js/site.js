(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const root = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- hero name: split by WORDS (never letters — Arabic letters must stay joined) ---------- */
  const nm = $('.hero__name');
  if (nm) {
    const words = nm.textContent.trim().split(/\s+/);
    nm.textContent = '';
    words.forEach((w, i) => {
      const o = document.createElement('span'); o.className = 'w'; o.style.setProperty('--i', i);
      const s = document.createElement('span'); s.textContent = w; o.append(s); nm.append(o);
    });
  }
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  /* ---------- reveal on scroll ---------- */
  $$('.skills,.more__grid,.pills,.learn__grid,.exp-list,.stats__in').forEach(g =>
    [...g.children].forEach((c, i) => c.style.setProperty('--d', (i * .1).toFixed(2) + 's')));
  const targets = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) targets.forEach(el => el.classList.add('is-in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  }

  /* ---------- nav: mobile toggle, current section, hide on scroll down ---------- */
  const nav = $('.nav'), toggle = $('.nav__toggle'), menu = $('#menu');
  const setMenu = open => { toggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open); };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  const links = $$('.nav__menu a');
  if ('IntersectionObserver' in window) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { links.forEach(a => a.classList.remove('is-current')); const a = map.get(e.target.id); if (a) a.classList.add('is-current'); }
    }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- counters ---------- */
  const count = el => {
    const to = +el.dataset.count; if (reduce) { el.textContent = to; return; }
    const dur = to > 100 ? 1800 : 1400, t0 = performance.now();
    const tick = t => { const p = clamp((t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const ring = $('#ring');
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      $$('[data-count]', e.target).forEach(count);
      if (e.target.id === 'edu') ring.style.setProperty('--v', 73);
      co.unobserve(e.target);
    }), { threshold: .4 });
    [$('.stats__in'), $('#edu')].forEach(el => el && co.observe(el));
  } else { $$('[data-count]').forEach(count); ring && ring.style.setProperty('--v', 73); }

  /* ---------- marquees: repeat until full, then double for a seamless loop ---------- */
  const fill = (tr, pxPerSec) => {
    if (!tr) return;
    const base = [...tr.children], box = tr.parentElement.clientWidth;
    while (tr.scrollWidth < box * 1.2) base.forEach(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.append(c); });
    [...tr.children].forEach(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.append(c); });
    tr.style.animationDuration = Math.max(14, tr.scrollWidth / 2 / pxPerSec) + 's';
  };
  fill($('.marquee__track'), 55);
  const bt = $('.big__track'); if (bt) { [...bt.children].forEach(n => bt.append(n.cloneNode(true))); bt.style.animationDuration = Math.max(20, bt.scrollWidth / 2 / 70) + 's'; }

  /* ---------- about: words light up as you scroll ---------- */
  const at = $('#aboutText');
  if (at) {
    const ws = at.textContent.trim().split(/\s+/); at.textContent = '';
    ws.forEach((w, i) => { const s = document.createElement('span'); s.className = 'wd'; s.textContent = w; at.append(s, i < ws.length - 1 ? ' ' : ''); });
  }
  const wds = $$('.wd'), expList = $('#expList');

  /* ---------- scroll-driven bits (one rAF-throttled handler) ---------- */
  const bar = $('.progress'), blobs = $$('[data-par]');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const h = root, y = h.scrollTop || document.body.scrollTop, vh = innerHeight;
    bar.style.setProperty('--p', (y / (h.scrollHeight - h.clientHeight || 1)).toFixed(3));
    nav.classList.toggle('is-scrolled', y > 30);
    nav.classList.toggle('is-hidden', y > lastY + 4 && y > 500 && !menu.classList.contains('is-open'));
    if (y < lastY - 4 || y < 500) nav.classList.remove('is-hidden');
    lastY = y;
    if (at) { const r = at.getBoundingClientRect(), p = clamp((vh * .85 - r.top) / (r.height + vh * .35)); const n = Math.round(p * wds.length); wds.forEach((w, i) => w.classList.toggle('on', i < n)); }
    if (expList) { const r = expList.getBoundingClientRect(); expList.style.setProperty('--fill', clamp((vh * .62 - r.top) / r.height).toFixed(3)); }
    if (!reduce && y < vh * 1.4) blobs.forEach(b => b.style.translate = `0 ${(y * b.dataset.par).toFixed(1)}px`);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll); onScroll();

  /* ---------- timeline: tabs + progress rail + gentle autoplay ---------- */
  const tabs = $$('.tl__node'), panels = $$('.tl__panel'), tl = $('#tl');
  let cur = 0, auto = true, timer = null;
  const select = (i, focus) => {
    cur = i;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.classList.toggle('is-active', on); t.classList.toggle('is-passed', k < i);
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p, k) => { p.hidden = k !== i; });
    tl.style.setProperty('--tp', (i / (tabs.length - 1)).toFixed(3));
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { auto = false; select(i); });
    t.addEventListener('keydown', e => {
      let n = null;   // RTL: ArrowLeft = later year
      if (e.key === 'ArrowLeft') n = Math.min(i + 1, tabs.length - 1);
      if (e.key === 'ArrowRight') n = Math.max(i - 1, 0);
      if (e.key === 'Home') n = 0; if (e.key === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); auto = false; select(n, true); }
    });
  });
  select(0);
  if (!reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => {
      clearInterval(timer);
      if (es[0].isIntersecting && auto) timer = setInterval(() => { if (!auto) return clearInterval(timer); select((cur + 1) % tabs.length); }, 5500);
    }, { threshold: .5 }).observe(tl);
  }

  /* ---------- print ---------- */
  $$('[data-print]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const w = open(a.href + '?print=1', '_blank');
    if (!w) location.href = a.href + '?print=1';
  }));

  /* ---------- typing rotor ---------- */
  const rot = $('#rotor');
  if (rot) {
    const list = ['Flutter', 'KoBoToolbox', 'التصميم', 'أي أداة جديدة'];
    if (reduce) rot.textContent = list[0];
    else {
      let i = 0, c = 0, del = false;
      (function t() {
        const s = list[i]; c += del ? -1 : 1; rot.textContent = s.slice(0, c) || '​';
        let d = del ? 45 : 95;
        if (!del && c === s.length) { del = true; d = 1500; } else if (del && c === 0) { del = false; i = (i + 1) % list.length; d = 350; }
        setTimeout(t, d);
      })();
    }
  }

  /* ---------- fine-pointer effects ---------- */
  if (fine && !reduce) {
    const g = $('.glow');
    addEventListener('pointermove', e => { g.style.setProperty('--x', e.clientX - 260 + 'px'); g.style.setProperty('--y', e.clientY - 260 + 'px'); }, { passive: true });

    // spotlight follows the cursor inside cards
    $$('.exp,.card,.skill').forEach(el => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(); el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
    }));

    // 3D tilt (cards that carry no reveal transform conflicts)
    $$('.card,.skill,.lc').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg) translateY(-4px)`; });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });

    // portrait parallax
    const ps = $('.portrait__stage');
    if (ps) addEventListener('pointermove', e => { ps.style.transform = `translate(${((e.clientX / innerWidth - .5) * -16).toFixed(1)}px,${((e.clientY / innerHeight - .5) * -12).toFixed(1)}px)`; }, { passive: true });

    // magnetic buttons
    $$('.btn').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .16).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .24).toFixed(1)}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
  }

  /* ---------- items still needing confirmation: open index.html#verify ---------- */
  if (location.hash === '#verify') document.body.classList.add('show-verify');
})();
