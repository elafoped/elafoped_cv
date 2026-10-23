(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // scroll progress
  const bar = $('.progress');
  const upd = () => { const h = document.documentElement; bar.style.setProperty('--p', (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)).toFixed(3)); };
  addEventListener('scroll', upd, { passive: true }); upd();
  // logos marquee: repeat the set until it fills the screen, then double it for a seamless loop
  const tr = $('.marquee__track');
  if (tr) {
    const base = [...tr.children], box = tr.parentElement.clientWidth;
    let w = tr.scrollWidth, half = base.slice();
    while (w < box * 1.2) { base.forEach(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.append(c); half.push(c); }); w = tr.scrollWidth; }
    [...tr.children].forEach(n => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); tr.append(c); });
    tr.style.animationDuration = Math.max(14, tr.scrollWidth / 2 / 55) + 's'; // ~55px per second
  }
  // stagger reveal
  $$('.trio,.skills,.more__grid,.works,.learn__grid').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--d', i * .09 + 's')));
  // learn block animate on view
  const lr = $('.learn'); if (lr && 'IntersectionObserver' in window) new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { lr.classList.add('is-in'); o.disconnect(); } }, { threshold: .3 }).observe(lr); else lr && lr.classList.add('is-in');
  if (reduce) return;
  // cursor glow
  if (matchMedia('(pointer:fine)').matches) {
    const g = $('.glow');
    addEventListener('pointermove', e => { g.style.setProperty('--x', e.clientX - 230 + 'px'); g.style.setProperty('--y', e.clientY - 230 + 'px'); }, { passive: true });
    // 3D tilt
    $$('.trio__item,.card,.work,.skill,.lc,.port').forEach(el => {
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`; });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
    // portrait parallax
    const pf = $('.portrait__frame');
    addEventListener('pointermove', e => { if (pf) pf.style.transform = `translate(${(e.clientX / innerWidth - .5) * -14}px,${(e.clientY / innerHeight - .5) * -10}px)`; }, { passive: true });
    // magnetic buttons
    $$('.btn').forEach(b => { b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; }); b.addEventListener('pointerleave', () => b.style.transform = ''); });
  }
  // typing rotor
  const el = $('#rotor'); if (el) {
    const w = ['Flutter', 'KoBoToolbox', 'التصميم', 'أي أداة جديدة'];
    let i = 0, c = 0, del = false;
    (function t() { const s = w[i]; c += del ? -1 : 1; el.textContent = s.slice(0, c) || '\u200b';
      let d = del ? 45 : 95; if (!del && c === s.length) { del = true; d = 1400; } else if (del && c === 0) { del = false; i = (i + 1) % w.length; d = 350; } setTimeout(t, d); })();
  }
})();
