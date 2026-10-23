(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Reveal on scroll */
  const targets = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  }

  /* Mobile menu */
  const toggle = $('.nav__toggle'), menu = $('#menu');
  const setMenu = open => { toggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open); };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Current section in nav */
  const links = $$('.nav__menu a');
  if ('IntersectionObserver' in window) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const so = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.remove('is-current'));
          const a = map.get(e.target.id); if (a) a.classList.add('is-current');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* Timeline (tabs, arrow keys) */
  const tabs = $$('.tl__node'), panels = $$('.tl__panel');
  const select = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(p => { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
    if (focus) tab.focus();
  };
  panels.forEach((p, i) => { p.hidden = i !== 0; });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      // RTL: ArrowLeft moves to the next (later) year, ArrowRight to the previous one
      let n = null;
      if (e.key === 'ArrowLeft') n = tabs[Math.min(i + 1, tabs.length - 1)];
      if (e.key === 'ArrowRight') n = tabs[Math.max(i - 1, 0)];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n, true); }
    });
  });

  /* Print action: open the print layout and print it */
  $$('[data-print]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const w = window.open(a.href + '?print=1', '_blank');
    if (!w) window.location.href = a.href + '?print=1';
  }));

  /* Highlight fields that still need confirmation */
  const vt = $('.verify-toggle');
  vt.addEventListener('click', () => {
    const on = document.body.classList.toggle('show-verify');
    vt.setAttribute('aria-pressed', String(on));
  });
  if (location.hash === '#verify') vt.click();
})();
