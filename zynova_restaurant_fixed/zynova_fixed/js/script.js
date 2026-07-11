// ===== Z Y N O V A — Enhanced JS 2026 (v2 — scroll-fix + richer interactions) =====
// WHY THIS VERSION EXISTS:
// The previous build depended on 3 external CDN scripts (GSAP, ScrollTrigger,
// Lenis) to drive scrolling AND scroll-based animation. That caused two
// real problems:
//   1) CSS had `html{scroll-behavior:smooth}` while Lenis ALSO hijacked the
//      wheel/touch scroll to animate it manually — two systems fighting for
//      control of scroll makes it feel stuck / laggy / "broken".
//   2) If any of those 3 CDN files were slow, blocked, or mismatched in
//      version (a real risk with third-party CDNs), scroll-triggered
//      animation and page scroll behaviour degraded unpredictably.
// This version removes that dependency completely. Scrolling is 100%
// native (fast + always works, no network dependency). All animation is
// done with plain JS (IntersectionObserver + requestAnimationFrame), and
// there are more mouse-reactive touches throughout: a live cursor glow,
// smoothed magnetic buttons, hero parallax on mouse move, and a scroll
// progress bar.

const MOBILE_BREAKPOINT = 820;
const isTouchDevice = () =>
  window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
  window.innerWidth <= MOBILE_BREAKPOINT;
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Scroll helper (plain, native, always correct) ----------
const getScrollY = () => window.scrollY || document.documentElement.scrollTop;
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

// ---------- Custom cursor (dot + ring + soft glow) ----------
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  const lbl  = ring ? ring.querySelector('.cursor-lbl') : null;
  if (!dot || !ring) return;
  if (isTouchDevice()) { dot.style.display = 'none'; ring.style.display = 'none'; return; }

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let mx = -200, my = -200, dx = -200, dy = -200, cx = -200, cy = -200, gx = -200, gy = -200;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const tick = () => {
    dx += (mx - dx) * 0.28; dy += (my - dy) * 0.28;
    cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12;
    gx += (mx - gx) * 0.07; gy += (my - gy) * 0.07;
    dot.style.cssText   = `left:${dx}px;top:${dy}px`;
    ring.style.cssText  = `left:${cx}px;top:${cy}px`;
    glow.style.cssText  = `left:${gx}px;top:${gy}px`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const setCursor = (type, text = '') => {
    if (lbl) lbl.textContent = text;
    document.body.classList.toggle('cursor-hover', type === 'hover');
  };
  const HOVER_MAP = [
    ['.dish-card','YUM'], ['.gal-item','VIEW'], ['.offer-card','OFFER'],
    ['.review-card','INFO'], ['.dish-mini','ORDER'], ['.chit','INFO'],
    ['a','GO'], ['button','GO'], ['[role="button"]','GO'],
  ];
  document.addEventListener('mouseover', e => {
    for (const [sel, label] of HOVER_MAP) {
      if (e.target.closest(sel)) { setCursor('hover', label); return; }
    }
  });
  document.addEventListener('mouseout', e => {
    if (HOVER_MAP.some(([sel]) => e.target.closest(sel))) setCursor('none');
  });
})();

// ---------- Scroll progress bar (top of page) ----------
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  const fill = document.createElement('div');
  fill.className = 'scroll-progress-fill';
  bar.appendChild(fill);
  document.body.appendChild(bar);
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (getScrollY() / max) * 100 : 0;
    fill.style.width = pct + '%';
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
})();

document.addEventListener('DOMContentLoaded', () => {

  // ── Preloader ──────────────────────────────────────────────────
  const preloader = document.querySelector('.preloader');
  const triggerHeroEntrance = () => {
    if (prefersReducedMotion()) return;
    const els = [
      ['.hero-content', { transform: ['translateY(60px)', 'translateY(0)'], opacity: [0, 1] }],
      ['.hero-figure',  { transform: ['scale(.9) rotateY(12deg)', 'scale(1) rotateY(0deg)'], opacity: [0, 1] }],
      ['.hero-tag',     { transform: ['translateY(20px)', 'translateY(0)'], opacity: [0, 1] }],
    ];
    els.forEach(([sel, keyframes], i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.animate(keyframes, { duration: 900, delay: i * 140, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    });
  };

  if (preloader) {
    document.body.classList.add('loading-active');
    const bar = preloader.querySelector('.bar-progress');
    let w = 0;
    const finish = () => {
      preloader.classList.add('loaded');
      document.body.classList.remove('loading-active');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      triggerHeroEntrance();
    };
    const iv = setInterval(() => {
      w += Math.random() * 14 + 4;
      if (w >= 100) {
        w = 100; clearInterval(iv);
        setTimeout(finish, 300);
      }
      if (bar) bar.style.width = `${w}%`;
    }, 55);
    // Hard safety net: whatever happens, unlock scroll after 3.5s max.
    setTimeout(() => {
      if (document.body.classList.contains('loading-active')) finish();
    }, 3500);
  } else {
    triggerHeroEntrance();
  }

  // ── Ambient floating particles ─────────────────────────────────
  if (!prefersReducedMotion()) {
    const colors = ['rgba(240,160,40,.3)', 'rgba(200,80,26,.22)', 'rgba(77,140,114,.18)', 'rgba(232,142,16,.28)'];
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'floating-particle';
      const sz = Math.random() * 7 + 3;
      const dur = Math.random() * 14 + 10;
      p.style.cssText = `
        width:${sz}px;height:${sz}px;
        background:${colors[i % colors.length]};
        left:${Math.random() * 100}vw;
        animation-duration:${dur}s;
        animation-delay:${Math.random() * -dur}s;
        filter:blur(${Math.random() * 1.5}px);
      `;
      document.body.appendChild(p);
    }
  }

  // ── Ember canvas ───────────────────────────────────────────────
  const emberCanvas = document.getElementById('ember-canvas');
  if (emberCanvas && !prefersReducedMotion()) {
    const ctx = emberCanvas.getContext('2d');
    let W = emberCanvas.width  = window.innerWidth;
    let H = emberCanvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      W = emberCanvas.width  = window.innerWidth;
      H = emberCanvas.height = window.innerHeight;
    }, { passive: true });

    class Ember {
      constructor() { this.reset(); this.y = Math.random() * H; }
      reset() {
        this.x = Math.random() * W;
        this.y = H + 20;
        this.sz = Math.random() * 2.4 + 0.4;
        this.vy = -(Math.random() * 1.3 + 0.3);
        this.vx = Math.random() * 0.6 - 0.3;
        this.alpha = Math.random() * 0.4 + 0.08;
        this.hue = Math.random() > 0.4 ? 40 : 12;
      }
      update() {
        this.y += this.vy; this.x += this.vx;
        this.vx += Math.sin(this.y * 0.013) * 0.012;
        this.alpha -= 0.0007;
        if (this.y < -10 || this.alpha <= 0) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue},90%,60%,${Math.max(0, this.alpha)})`;
        ctx.fill();
      }
    }
    const embers = Array.from({ length: 46 }, () => new Ember());
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      embers.forEach(e => { e.update(); e.draw(); });
      requestAnimationFrame(loop);
    };
    loop();
  }

  // ── Promo ticker ───────────────────────────────────────────────
  if (!document.querySelector('.promo-ticker')) {
    if (sessionStorage.getItem('zynova-ticker-dismissed'))
      document.body.classList.add('ticker-dismissed');
    const msgs = [
      '🔥 Tuesday Thali — ₹299 today only',
      '👯 Bring-a-Friend Biryani — 2nd biryani at 50% off',
      '🍽 Family Feast Combo feeds 4 for ₹2,399',
      '⭐ Rated 4.8 on Google — 2,000+ reviews',
      '📍 Walk-ins welcome; reserve ahead on weekends',
      '🕒 Open daily 12 pm – 11 pm · Besant Nagar, Chennai',
      '🎁 Use code ZYNOVA10 for 10% off your first order',
    ];
    const t = document.createElement('div');
    t.className = 'promo-ticker';
    t.setAttribute('aria-live', 'off');
    t.innerHTML = `<div class="ticker-track">${msgs.concat(msgs).map(m => `<span>${m}</span>`).join('')}</div>
      <button class="ticker-close" aria-label="Dismiss announcement bar">&times;</button>`;
    document.body.prepend(t);
    t.querySelector('.ticker-close').addEventListener('click', () => {
      document.body.classList.add('ticker-dismissed');
      sessionStorage.setItem('zynova-ticker-dismissed', '1');
    });
  }

  // ── Mobile nav ─────────────────────────────────────────────────
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('nav.primary');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('click', e => {
      if (nav.classList.contains('open') &&
          !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Fixed header scroll ────────────────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', getScrollY() > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── WhatsApp float ─────────────────────────────────────────────
  if (!document.querySelector('.whatsapp-float')) {
    const wa = document.createElement('a');
    wa.href = 'https://wa.me/919788812525?text=Hi%20Zynova%2C%20I%27d%20like%20to%20know%20more';
    wa.className = 'whatsapp-float';
    wa.target = '_blank'; wa.rel = 'noopener noreferrer';
    wa.setAttribute('aria-label', 'Chat on WhatsApp');
    wa.innerHTML = `<svg viewBox="0 0 32 32"><path d="M16.02 3C9.4 3 4.02 8.38 4.02 15c0 2.36.64 4.56 1.86 6.5L4 29l7.7-1.83c1.84.99 3.94 1.55 6.32 1.55 6.62 0 12-5.38 12-12S22.64 3 16.02 3zm7.02 17.06c-.3.84-1.5 1.58-2.4 1.76-.64.13-1.48.24-4.3-.92-3.6-1.5-5.92-5.16-6.1-5.4-.18-.24-1.46-1.94-1.46-3.7 0-1.76.92-2.62 1.24-2.98.32-.36.7-.44.94-.44.24 0 .48 0 .68.01.22.02.52-.08.8.62.3.74 1.02 2.5 1.1 2.68.08.18.14.4.02.64-.12.24-.18.38-.36.58-.18.2-.38.46-.54.62-.18.18-.36.38-.16.74.2.36.9 1.5 1.94 2.42 1.34 1.2 2.46 1.58 2.82 1.76.36.18.58.16.78-.08.22-.24.9-1.04 1.14-1.4.24-.36.48-.3.8-.18.32.12 2.06.98 2.42 1.16.36.18.6.26.68.42.1.16.1.9-.2 1.72z"/></svg>`;
    document.body.appendChild(wa);
  }

  // ── Scroll-to-top button ───────────────────────────────────────
  if (!document.getElementById('scroll-top')) {
    const btn = document.createElement('button');
    btn.id = 'scroll-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline></svg>`;
    document.body.appendChild(btn);

    const toggleScrollBtn = () => btn.classList.toggle('visible', getScrollY() > 400);
    toggleScrollBtn();
    window.addEventListener('scroll', toggleScrollBtn, { passive: true });

    btn.addEventListener('click', () => {
      scrollToTop();
      launchConfetti(btn, 10);
    });
  }

  // ── Magnetic pull (desktop only, smoothed with rAF) ─────────────
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic], .btn, nav.primary a, .nav-toggle').forEach(el => {
      let tx = 0, ty = 0, cx2 = 0, cy2 = 0, raf = null;
      const render = () => {
        cx2 += (tx - cx2) * 0.25;
        cy2 += (ty - cy2) * 0.25;
        el.style.transform = `translate(${cx2.toFixed(2)}px,${cy2.toFixed(2)}px)`;
        if (Math.abs(tx - cx2) > 0.1 || Math.abs(ty - cy2) > 0.1) {
          raf = requestAnimationFrame(render);
        } else { raf = null; }
      };
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
        ty = (e.clientY - (r.top  + r.height / 2)) * 0.28;
        if (!raf) raf = requestAnimationFrame(render);
      });
      el.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(render);
      });
    });
  }

  // ── 3D card tilt (desktop only) ───────────────────────────────
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.chit,.dish-card,.offer-card,.gal-item,.review-card,.hero-figure,.dish-mini').forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `rotateX(${(-y * 12).toFixed(1)}deg) rotateY(${(x * 12).toFixed(1)}deg) translateY(-8px) scale(1.02)`;
        const img   = card.querySelector('img,video');
        const body  = card.querySelector('.dish-body,.offer-body,.gal-cap,.dish-mini-body,.chit-photo');
        const price = card.querySelector('.price');
        if (img)   img.style.transform   = `translateZ(20px) scale(1.07) translate(${(x*8).toFixed(1)}px,${(y*8).toFixed(1)}px)`;
        if (body)  body.style.transform  = `translateZ(30px) translate(${(x*5).toFixed(1)}px,${(y*5).toFixed(1)}px)`;
        if (price) price.style.transform = `translateZ(44px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.querySelectorAll('img,video,.dish-body,.offer-body,.gal-cap,.dish-mini-body,.chit-photo,.price')
            .forEach(c => c.style.transform = '');
      });
    });
  }

  // ── Hero parallax on mouse move (desktop only) ─────────────────
  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const orbs = hero.querySelectorAll('.hero-orb');
    const figure = hero.querySelector('.hero-figure');
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      orbs.forEach((orb, i) => {
        const depth = (i + 1) * 16;
        orb.style.transform = `translate(${(px * depth).toFixed(1)}px,${(py * depth).toFixed(1)}px)`;
      });
      if (figure) figure.style.transform = `translate(${(px * 10).toFixed(1)}px,${(py * 10).toFixed(1)}px)`;
    });
    hero.addEventListener('mouseleave', () => {
      orbs.forEach(orb => { orb.style.transform = ''; });
      if (figure) figure.style.transform = '';
    });
  }

  // ── Click ripple ───────────────────────────────────────────────
  document.addEventListener('click', e => {
    const target = e.target.closest('.btn,nav.primary a,.gal-item,.chit,.dish-card,.offer-card,.review-card,.logo,.filter-btn,.dish-mini');
    if (!target) return;
    const r = target.getBoundingClientRect();
    const span = document.createElement('span');
    const sz = Math.max(r.width, r.height);
    span.className = 'ripple';
    span.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz/2}px;top:${e.clientY - r.top - sz/2}px`;
    if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
    target.appendChild(span);
    span.addEventListener('animationend', () => span.remove(), { once: true });
  });

  // ── TABLE ROW CLICK EFFECTS ────────────────────────────────────
  const offerTable = document.querySelector('table.offer-table');
  if (offerTable) {
    let selectedRow = null;
    const expandData = [
      { pills:[{text:'Solo / Quick',cls:'green'},{text:'Tuesdays only',cls:''}],   note:'Dal, sabzi, curd, pickle, papad, rice & two rotis. Show code ZYNOVA10 for an extra 10% off.' },
      { pills:[{text:'Mon–Thu',cls:'green'},{text:'For 2 people',cls:''}],          note:'Any tandoori starter + naan + soft drink for two. Best deal on weeknights!' },
      { pills:[{text:'Every day',cls:'green'},{text:'Solo',cls:''}],                note:'1 main + 1 bread or rice + 1 drink, served in under 20 minutes. Perfect for the lunch rush.' },
      { pills:[{text:'Every day',cls:'green'},{text:'For 2',cls:''}],               note:'1 starter, 2 mains, 2 breads, 1 dessert to share. The perfect date night choice.' },
      { pills:[{text:'Every day',cls:'green'},{text:'Best value',cls:''}],          note:'2 starters, 3 mains, 4 breads, rice & 2 desserts for 4 people. Biggest saving on the menu.' },
    ];
    const dataRows = Array.from(offerTable.querySelectorAll('tbody tr:not(.table-expand-row)'));
    dataRows.forEach((row, i) => {
      const expandRow = document.createElement('tr');
      expandRow.className = 'table-expand-row';
      const cols = row.cells.length;
      const d = expandData[i] || { pills:[], note:'' };
      const pillsHtml = d.pills.map(p => `<span class="tag-pill ${p.cls}">${p.text}</span>`).join('');
      expandRow.innerHTML = `<td colspan="${cols}"><div class="table-expand-content">${pillsHtml}<p>${d.note}</p><a href="contact.html" class="btn btn-solid" style="padding:10px 20px;font-size:.68rem;">Reserve now</a></div></td>`;
      row.after(expandRow);
      row.style.cursor = 'pointer';
      row.setAttribute('tabindex', '0');
      row.setAttribute('role', 'button');
      row.setAttribute('aria-expanded', 'false');

      const toggleRow = () => {
        const td = row.cells[0];
        const r = td.getBoundingClientRect();
        const rip = document.createElement('span');
        rip.className = 'table-ripple';
        const sz = Math.max(r.width, r.height) * 2;
        rip.style.cssText = `width:${sz}px;height:${sz}px;left:0;top:0`;
        td.appendChild(rip);
        rip.addEventListener('animationend', () => rip.remove(), { once: true });

        if (selectedRow === row) {
          row.classList.remove('row-selected'); row.setAttribute('aria-expanded','false');
          expandRow.classList.remove('show'); selectedRow = null;
        } else {
          if (selectedRow) {
            selectedRow.classList.remove('row-selected'); selectedRow.setAttribute('aria-expanded','false');
            selectedRow.nextElementSibling?.classList.remove('show');
          }
          row.classList.add('row-selected','row-clicked'); row.setAttribute('aria-expanded','true');
          setTimeout(() => row.classList.remove('row-clicked'), 400);
          expandRow.classList.add('show'); selectedRow = row;
          setTimeout(() => row.scrollIntoView({ behavior:'smooth', block:'nearest' }), 80);
        }
      };
      row.addEventListener('click', toggleRow);
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRow(); } });
    });
  }

  // ── Gallery lightbox ───────────────────────────────────────────
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const items = Array.from(document.querySelectorAll('.gal-item'));
    let current = 0;
    if (!lightbox.querySelector('.lightbox-prev')) {
      lightbox.insertAdjacentHTML('beforeend',
        `<button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#8249;</button>
         <button class="lightbox-nav lightbox-next" aria-label="Next image">&#8250;</button>
         <div class="lightbox-cap"></div>`);
    }
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const capEl   = lightbox.querySelector('.lightbox-cap');
    const visible = () => items.filter(i => !i.hidden);
    const open = item => {
      const img = item.querySelector('img');
      const cap = item.querySelector('.gal-cap');
      lbImg.src = img.src; lbImg.alt = img.alt || '';
      if (capEl) capEl.textContent = cap ? cap.textContent.trim() : img.alt;
      current = items.indexOf(item);
      lightbox.classList.add('open');
      lightbox.querySelector('.lightbox-close')?.focus();
    };
    const step = dir => {
      const v = visible(); if (!v.length) return;
      let idx = v.indexOf(items[current]);
      idx = (idx + dir + v.length) % v.length;
      open(v[idx]);
    };
    items.forEach(item => item.addEventListener('click', () => open(item)));
    prevBtn?.addEventListener('click', e => { e.stopPropagation(); step(-1); });
    nextBtn?.addEventListener('click', e => { e.stopPropagation(); step(1); });
    lightbox.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')      lightbox.classList.remove('open');
      if (e.key === 'ArrowLeft')   step(-1);
      if (e.key === 'ArrowRight')  step(1);
    });
    let tx0 = 0;
    lightbox.addEventListener('touchstart', e => { tx0 = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - tx0;
      if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // ── Gallery filter ─────────────────────────────────────────────
  const galFilter = document.querySelector('.gallery-filter');
  if (galFilter) {
    const btns  = galFilter.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.gal-item');
    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      items.forEach(item => { item.hidden = !(cat === 'all' || item.dataset.category === cat); });
    }));
  }

  // ── Menu category filter ───────────────────────────────────────
  const menuFilter = document.querySelector('.menu-filter');
  if (menuFilter) {
    const btns = menuFilter.querySelectorAll('.filter-btn');
    const secs = document.querySelectorAll('.menu-section');
    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      secs.forEach(sec => {
        const show = cat === 'all' || sec.dataset.category === cat;
        sec.classList.toggle('visible', show);
        sec.style.display = show ? '' : 'none';
      });
      if (cat !== 'all') {
        const target = document.querySelector(`.menu-section[data-category="${cat}"]`);
        if (target) setTimeout(() => target.scrollIntoView({ behavior:'smooth', block:'start' }), 60);
      }
    }));
  }

  // ── Contact form ───────────────────────────────────────────────
  const form = document.querySelector('#feedback-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = form.querySelector('.form-msg');
      if (msg) {
        msg.textContent = "Thanks — we've got your message and will reply shortly.";
        msg.classList.add('show','ok');
      }
      form.reset();
      launchConfetti(form.querySelector('[type="submit"]'), 18);
    });
  }

  // ── Daily countdown ────────────────────────────────────────────
  const cEl = document.querySelector('#daily-countdown');
  if (cEl) {
    const tick = () => {
      const now = new Date(), midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const d = midnight - now;
      const h = String(Math.floor(d / 3.6e6)).padStart(2, '0');
      const m = String(Math.floor((d % 3.6e6) / 6e4)).padStart(2, '0');
      const s = String(Math.floor((d % 6e4) / 1000)).padStart(2, '0');
      cEl.innerHTML = `<span>${h}</span><span style="animation:blink .75s step-start infinite">:</span><span>${m}</span><span style="animation:blink .75s step-start infinite">:</span><span>${s}</span>`;
    };
    tick(); setInterval(tick, 1000);
  }

  // ── Scratch box ────────────────────────────────────────────────
  document.querySelectorAll('.scratch-box').forEach(box => {
    const reveal = () => { box.classList.add('revealed'); launchConfetti(box, 12); };
    box.addEventListener('click', reveal);
    box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } });
  });

  // ── Copy-code elements ─────────────────────────────────────────
  document.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', () => {
      navigator.clipboard?.writeText(el.dataset.copy).catch(() => {});
      const orig = el.textContent;
      el.textContent = '✓ Copied!';
      setTimeout(() => { el.textContent = orig; }, 1600);
    });
  });

  // ── Stat counters ──────────────────────────────────────────────
  document.querySelectorAll('.stat b[data-count]').forEach(el => {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const decimals = el.dataset.count.includes('.') ? 1 : 0;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);
        const start = performance.now(), dur = 1400;
        const step = now => {
          const p = Math.min(1, (now - start) / dur);
          el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  // ── Scroll reveals (IntersectionObserver — no external library) ─
  const revealEls = document.querySelectorAll(
    '.section-head,.chit,.dish-card,.offer-card,.review-card,.gal-item,.dish-mini,.timeline-item'
  );
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 6) * 0.07}s`;
  });
  if ('IntersectionObserver' in window && !prefersReducedMotion()) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // ── OFFER POPUP ────────────────────────────────────────────────
  if (!sessionStorage.getItem('zynova-promo-seen')) {
    setTimeout(() => {
      const overlay = document.createElement('div');
      overlay.className = 'promo-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Welcome offer');
      overlay.innerHTML = `
        <div class="promo-modal">
          <div class="promo-banner-strip">🔥 Limited-time offer — today only 🔥</div>
          <button class="promo-close" aria-label="Close offer">&times;</button>
          <div class="promo-media">
            <div class="promo-hot-ribbon">Hot deal</div>
            <div class="promo-save-badge"><span class="pct">10%</span><span class="off">OFF</span></div>
            <img src="https://images.unsplash.com/photo-1680993032090-1ef7ea9b51e5?q=80&w=900&auto=format&fit=crop"
                 alt="Zynova special thali offer" loading="lazy">
          </div>
          <div class="promo-body">
            <span class="eyebrow">✨ Welcome gift — first visit</span>
            <h3>10% off your first order</h3>
            <p>Show this code to your server or mention it when you reserve. Valid on dine-in orders.</p>
            <div class="promo-countdown" id="promo-timer"></div>
            <div class="promo-code" role="button" tabindex="0" data-copy="ZYNOVA10" aria-label="Copy code ZYNOVA10">
              <span>🎁</span><span>ZYNOVA10</span><span class="copy-icon">📋 Tap to copy</span>
            </div>
            <a href="offers.html" class="btn btn-solid">🍽️ See all offers</a>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      sessionStorage.setItem('zynova-promo-seen', '1');

      const timerEl = overlay.querySelector('#promo-timer');
      const updateTimer = () => {
        const now = new Date(), midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const d = midnight - now;
        const h = String(Math.floor(d / 3.6e6)).padStart(2, '0');
        const m = String(Math.floor((d % 3.6e6) / 6e4)).padStart(2, '0');
        const s = String(Math.floor((d % 6e4) / 1000)).padStart(2, '0');
        timerEl.innerHTML = `
          <div class="promo-count-unit"><span class="num">${h}</span><span class="lbl">hrs</span></div>
          <span class="promo-count-sep">:</span>
          <div class="promo-count-unit"><span class="num">${m}</span><span class="lbl">min</span></div>
          <span class="promo-count-sep">:</span>
          <div class="promo-count-unit"><span class="num">${s}</span><span class="lbl">sec</span></div>`;
      };
      updateTimer();
      const timerIv = setInterval(updateTimer, 1000);

      requestAnimationFrame(() => overlay.classList.add('open'));
      setTimeout(() => launchConfetti(document.body, 36, true), 500);

      const close = () => {
        clearInterval(timerIv);
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 400);
      };
      overlay.querySelector('.promo-close').addEventListener('click', close);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      const escClose = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escClose); } };
      document.addEventListener('keydown', escClose);

      overlay.querySelectorAll('[data-copy]').forEach(el => {
        el.addEventListener('click', () => {
          navigator.clipboard?.writeText(el.dataset.copy).catch(() => {});
          const icon = el.querySelector('.copy-icon');
          if (icon) { icon.textContent = '✓ Copied!'; setTimeout(() => { icon.textContent = '📋 Tap to copy'; }, 1600); }
          launchConfetti(el, 14);
        });
        el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
      });
    }, 1500);
  }

  // ── Social proof toasts ────────────────────────────────────────
  if (!document.querySelector('.proof-toast')) {
    const events = [
      { name:'Priya R.',   action:'just reserved a table for 2',         when:'a minute ago' },
      { name:'Arjun K.',   action:'ordered the Zynova Tandoori Platter', when:'3 min ago' },
      { name:'Sneha M.',   action:'claimed the Weeknight Grill Deal',     when:'5 min ago' },
      { name:'Farhan S.',  action:'left a 5★ review',                    when:'7 min ago' },
      { name:'Divya N.',   action:'booked the Family Feast Combo',        when:'9 min ago' },
      { name:'Rohan T.',   action:'used code ZYNOVA10 for 10% off',       when:'just now' },
    ];
    let idx = 0;
    const showToast = () => {
      document.querySelector('.proof-toast')?.remove();
      const ev = events[idx++ % events.length];
      const t = document.createElement('div');
      t.className = 'proof-toast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      t.innerHTML = `<span class="proof-dot"></span><span><b>${ev.name} ${ev.action}</b><small>${ev.when}</small></span>`;
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 600); }, 5000);
    };
    setTimeout(showToast, 10000);
    setInterval(showToast, 17000);
  }

  // ── Mouse-trail sparkle (desktop only) ────────────────────────
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion()) {
    const sparkleColors = ['#c8501a','#d4940a','#4d8c72','#e8a820','#a34020'];
    let lastSparkle = 0;
    const sparkleStyle = document.createElement('style');
    sparkleStyle.textContent = `@keyframes sparkOut{0%{transform:translate(-50%,-50%) scale(1);opacity:1;}100%{transform:translate(-50%,-60px) scale(0);opacity:0;}}`;
    document.head.appendChild(sparkleStyle);
    document.addEventListener('mousemove', e => {
      const now = Date.now();
      if (now - lastSparkle < 65) return;
      lastSparkle = now;
      const s = document.createElement('div');
      const size = Math.random() * 5 + 3;
      s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;border-radius:${Math.random()>.5?'50%':'2px'};background:${sparkleColors[Math.floor(Math.random()*sparkleColors.length)]};pointer-events:none;z-index:9999;animation:sparkOut .55s ease-out forwards;transform:translate(-50%,-50%)`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 650);
    });
  }

}); // end DOMContentLoaded

// ── Confetti helper ────────────────────────────────────────────────
function launchConfetti(origin, count = 20, fromCenter = false) {
  const confettiColors = ['#c8501a','#d4940a','#4d8c72','#e8a820','#a34020','#b86a28','#7a3010'];
  let bx = window.innerWidth / 2, by = window.innerHeight / 2;
  if (!fromCenter && origin) {
    const r = origin.getBoundingClientRect();
    bx = r.left + r.width  / 2;
    by = r.top  + r.height / 2;
  }
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    const angle = Math.random() * 360;
    const dist  = Math.random() * 150 + 60;
    const tx    = Math.cos(angle * Math.PI / 180) * dist;
    const ty    = Math.sin(angle * Math.PI / 180) * dist;
    const dur   = Math.random() * .8 + .75;
    p.style.cssText = `left:${bx}px;top:${by}px;background:${confettiColors[Math.floor(Math.random()*confettiColors.length)]};animation-duration:${dur}s;animation-delay:${Math.random()*.25}s;width:${Math.random()*7+4}px;height:${Math.random()*7+4}px;border-radius:${Math.random()>.5?'50%':'2px'};`;
    document.body.appendChild(p);
    p.animate([
      { transform:`translate(-50%,-50%) scale(1)`, opacity:1 },
      { transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0) rotate(${Math.random()*720}deg)`, opacity:0 },
    ], { duration: dur * 1000, delay: Math.random() * 250, easing:'cubic-bezier(.2,.8,.3,1)', fill:'forwards' });
    setTimeout(() => p.remove(), (dur + 0.4) * 1000);
  }
}
