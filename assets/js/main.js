/* NoTF BLR Small Grants v2: scroll-story motion (GSAP + ScrollTrigger).
   Page: Hero (short pin) → What (4 tabs) → FAQs → Footer.
   Works without animation too (reduced motion / CDN blocked). */
(function () {
  'use strict';

  // Set once the application form exists. Empty = buttons show "opens soon".
  var APPLY_URL = '';

  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduce;
  if (!animate) html.classList.add('no-anim');
  if (reduce) html.classList.add('reduced');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Looping videos (hero + About tab): always playing, never a still ---------- */
  var loopVideos = $$('video.js-loop');
  function playAll() { loopVideos.forEach(function (v) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }); }
  loopVideos.forEach(function (v) { v.muted = true; v.addEventListener('canplay', playAll); v.addEventListener('pause', function () { if (!document.hidden) playAll(); }); });
  playAll();
  ['touchstart', 'click', 'scroll'].forEach(function (ev) { window.addEventListener(ev, playAll, { once: true, passive: true }); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) playAll(); });

  /* ---------- Split text into word spans (keeps nested tags) ---------- */
  function splitWords(el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'w'; s.style.display = 'inline-block'; s.textContent = part;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) { walk(child); }
      });
    })(el);
    return $$('.w', el);
  }

  /* ---------- Rotating neighbourhood ---------- */
  var places = ['Yelahanka', 'Jayanagar', 'Whitefield', 'Malleswaram', 'HSR Layout', 'Frazer Town', 'Basavanagudi', 'Hebbal'];
  var placeEl = $('#place'), pi = 0;
  if (placeEl && !reduce) {
    setInterval(function () {
      placeEl.classList.add('swap');
      setTimeout(function () { pi = (pi + 1) % places.length; placeEl.textContent = places[pi]; placeEl.classList.remove('swap'); }, 250);
    }, 2400);
  }

  /* ---------- Bottom nav pill ---------- */
  var navpill = $('.navpill'), navBtn = $('#navBtn'), navPanel = $('#navPanel'), navLabel = $('#navLabel');
  function setMenu(open) {
    navpill.classList.toggle('open', open);
    navBtn.setAttribute('aria-expanded', String(open));
    navBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      navPanel.hidden = false;
      if (animate) {
        gsap.fromTo(navPanel, { opacity: 0, y: 16, scale: .94 }, { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(1.6)' });
        gsap.fromTo($$('a', navPanel), { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: .03, duration: .3, delay: .08 });
      }
    } else if (animate) {
      gsap.to(navPanel, { opacity: 0, y: 10, scale: .96, duration: .25, ease: 'power2.in', onComplete: function () { navPanel.hidden = true; } });
    } else { navPanel.hidden = true; }
  }
  navBtn.addEventListener('click', function () { setMenu(!navpill.classList.contains('open')); });
  $$('a', navPanel).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navpill.classList.contains('open')) { setMenu(false); navBtn.focus(); } });
  document.addEventListener('click', function (e) { if (navpill.classList.contains('open') && !navpill.contains(e.target)) setMenu(false); });

  function setNavLabel(text) {
    if (navLabel.textContent === text) return;
    if (!animate) { navLabel.textContent = text; return; }
    gsap.to(navLabel, { yPercent: -100, opacity: 0, duration: .18, ease: 'power2.in', onComplete: function () {
      navLabel.textContent = text;
      gsap.fromTo(navLabel, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .3, ease: 'power3.out' });
    } });
  }

  /* ---------- WHAT: four tabs ---------- */
  var tabNames = ['about', 'fund', 'how', 'fit'];
  var tabBtns = $$('.what-tabs [role="tab"]');
  var currentTab = null;
  var currentTabWasSet = false;
  var aboutPlayed = false;
  var whatSeen = false; // panel entrance animations wait until the section is on screen
  var fillWords = splitWords($('.fill-text'));

  function onPanelShown(name) {
    if (!animate || !whatSeen) return;
    var panel = document.getElementById(name);
    gsap.fromTo(panel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' });
    if (name === 'about' && !aboutPlayed) {
      aboutPlayed = true;
      gsap.fromTo(fillWords, { color: 'rgba(33,72,149,.16)' }, { color: function (i, el) { return el.closest('em') ? '#37863A' : '#214895'; }, stagger: .04, duration: .4, ease: 'none' });
      gsap.from('.about-frame .bubble', { y: 20, opacity: 0, stagger: .2, duration: .6, ease: 'back.out(1.6)', delay: .3 });
      gsap.from('.stamp', { scale: 0, rotation: -45, opacity: 0, stagger: .12, duration: .7, ease: 'back.out(2.2)', delay: .5 });
    }
    if (name === 'fund') {
      gsap.from('#fundTile', { y: 60, rotation: -6, opacity: 0, duration: .8, ease: 'back.out(1.4)' });
      gsap.from('.cloud-bubble', { y: 20, opacity: 0, duration: .6, ease: 'back.out(1.6)', delay: .1 });
      gsap.timeline({ delay: .2 })
        .from('.range-bar', { scaleX: 0, duration: .8, ease: 'power2.inOut' })
        .from('.range-item', { opacity: 0, y: 30, scale: .5, stagger: .1, duration: .45, ease: 'back.out(2)' }, '-=0.5');
    }
    if (name === 'how') {
      var tl = $('.timeline');
      gsap.fromTo(tl, { '--fill': 0 }, { '--fill': 1, duration: 1.2, ease: 'power2.inOut' });
      gsap.from('.tl-node', { scale: 0, stagger: .25, duration: .5, ease: 'back.out(2.4)' });
      gsap.from('.tl-card', { y: 26, opacity: 0, stagger: .25, duration: .6, ease: 'power3.out', delay: .1 });
      gsap.from('.checks > div', { y: 24, opacity: 0, stagger: .12, duration: .6, delay: .9 });
    }
    if (name === 'fit') {
      gsap.from('.q', { x: -20, opacity: 0, stagger: .08, duration: .5, delay: .1 });
      gsap.from('.verdict', { scale: .95, opacity: 0, duration: .5, delay: .2 });
    }
  }

  function showTab(name, opts) {
    opts = opts || {};
    if (tabNames.indexOf(name) < 0) return;
    var changed = name !== currentTab;
    currentTab = name;
    tabBtns.forEach(function (b, i) {
      var on = b.dataset.tab === name;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    tabNames.forEach(function (n) { document.getElementById(n).hidden = n !== name; });
    if (typeof placeLens === 'function') placeLens($('.what-tabs [data-tab="' + name + '"]'), changed && currentTabWasSet);
    currentTabWasSet = true;
    if (opts.focus) $('[data-tab="' + name + '"][role="tab"]').focus();
    // Recalculate layout first (panel heights differ), then scroll, so the refresh can't cancel the scroll
    if (hasGsap && changed) ScrollTrigger.refresh();
    if (opts.scroll) {
      whatSeen = true;
      var top = $('#what').getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (changed) onPanelShown(name);
  }

  tabBtns.forEach(function (b, i) {
    b.addEventListener('click', function () { if (dragMoved) return; showTab(b.dataset.tab); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      showTab(tabNames[(i + d + tabNames.length) % tabNames.length], { focus: true });
    });
  });
  /* ---------- Glass lens on the tab bar: click, drag, or arrow keys ---------- */
  var tabsEl = $('.what-tabs'), lens = $('.lens');
  var dragging = false, dragMoved = false, dragStartX = 0, lensStartLeft = 0;
  function markUnder(centerX) {
    tabBtns.forEach(function (b) {
      var under = centerX == null ? b.getAttribute('aria-selected') === 'true'
        : (centerX >= b.offsetLeft && centerX < b.offsetLeft + b.offsetWidth);
      b.classList.toggle('is-under', under);
    });
  }
  function placeLens(btn, squash) {
    if (!lens || !btn) return;
    lens.style.left = btn.offsetLeft + 'px';
    lens.style.width = btn.offsetWidth + 'px';
    markUnder();
    if (squash && animate) gsap.fromTo(lens, { scaleX: 1.12, scaleY: .88 }, { scaleX: 1, scaleY: 1, duration: .7, ease: 'elastic.out(1, .45)' });
  }
  function nearestTab(centerX) {
    var best = tabBtns[0], dist = Infinity;
    tabBtns.forEach(function (b) { var c = b.offsetLeft + b.offsetWidth / 2, d = Math.abs(c - centerX); if (d < dist) { dist = d; best = b; } });
    return best;
  }
  if (lens) {
    tabsEl.addEventListener('pointerdown', function (e) {
      var r = lens.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right) return; // not on the lens: normal tab click
      dragging = true; dragMoved = false; dragStartX = e.clientX; lensStartLeft = lens.offsetLeft;
      lens.classList.add('dragging');
      tabsEl.setPointerCapture(e.pointerId);
    });
    tabsEl.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 4) dragMoved = true;
      var min = tabBtns[0].offsetLeft, max = tabBtns[tabBtns.length - 1].offsetLeft + tabBtns[tabBtns.length - 1].offsetWidth - lens.offsetWidth;
      var left = Math.max(min, Math.min(max, lensStartLeft + dx));
      lens.style.left = left + 'px';
      // stretch a little with speed, like liquid glass
      var stretch = Math.min(.12, Math.abs(e.movementX || 0) / 120);
      lens.style.transform = 'scaleX(' + (1 + stretch) + ') scaleY(' + (1 - stretch / 1.5) + ')';
      markUnder(left + lens.offsetWidth / 2);
    });
    var endDrag = function (e) {
      if (!dragging) return;
      dragging = false;
      lens.classList.remove('dragging');
      lens.style.transform = '';
      var target = nearestTab(lens.offsetLeft + lens.offsetWidth / 2);
      if (dragMoved) { showTab(target.dataset.tab); target.focus({ preventScroll: true }); }
      else { placeLens($('.what-tabs [aria-selected="true"]')); }
      setTimeout(function () { dragMoved = false; }, 0);
    };
    tabsEl.addEventListener('pointerup', endDrag);
    tabsEl.addEventListener('pointercancel', endDrag);
    window.addEventListener('resize', function () { placeLens($('.what-tabs [aria-selected="true"]')); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeLens($('.what-tabs [aria-selected="true"]')); });
  }

  // Any link to #about / #fund / #how / #fit (menu, footer, hero CTA) opens that tab
  $$('a[data-tab]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); showTab(a.dataset.tab, { scroll: true }); history.replaceState(null, '', '#' + a.dataset.tab); });
  });
  // Initial: hide non-active panels (they stay visible if JS fails); honour a deep link
  var initial = tabNames.indexOf(location.hash.slice(1)) >= 0 ? location.hash.slice(1) : 'about';
  showTab(initial);

  /* ---------- What we fund ---------- */
  var themes = [
    { t: 'Public spaces', l: 'Parks, footpaths, play areas, bus stops', d: 'Reclaim a corner, fix a footpath, light up a dark stretch, or turn a dumping spot into a place people stop and sit.', i: 'fa-tree-city' },
    { t: 'Waste', l: 'Segregation, composting, clean streets', d: 'Ward-level composting, cutlery banks, segregation drives, or keeping a black spot clean for good.', i: 'fa-recycle' },
    { t: 'Water', l: 'Lakes, drains, rainwater, flooding', d: 'Rain gardens, recharge wells, drain clean-ups, or a lake group that needs equipment to keep going.', i: 'fa-droplet' },
    { t: 'Trees and greening', l: 'Street trees, gardens, shade', d: 'Planting and caring for street trees, shade for bus stops, or a community garden on an unused plot.', i: 'fa-seedling' },
    { t: 'Walking and mobility', l: 'Safe streets, crossings, cycling', d: 'Safer school routes, crossings, cycle days, or signage that helps people walk their neighbourhood.', i: 'fa-person-walking' }
  ];
  var fundIdx = 0;
  var fundPills = $$('.fund-pills .pill');
  var details = $('#fundDetails');
  function setTheme(i) {
    if (i === fundIdx) return;
    var dir = i > fundIdx ? 1 : -1;
    fundIdx = i;
    var th = themes[i];
    fundPills.forEach(function (p, k) { p.classList.toggle('is-active', k === i); p.setAttribute('aria-selected', String(k === i)); });
    var apply = function () {
      $('#fundTitle').textContent = th.t; $('#fundLine').textContent = th.l; details.textContent = th.d;
      $('#fundIcon').className = 'fa-solid ' + th.i;
    };
    if (!animate) { apply(); return; }
    gsap.to(['#fundTile', '#fundBubble'], { rotationY: -90 * dir, opacity: 0, duration: .22, ease: 'power2.in', onComplete: function () {
      apply();
      gsap.fromTo('#fundTile', { rotationY: 90 * dir, opacity: 0 }, { rotationY: 0, opacity: 1, duration: .6, ease: 'back.out(1.5)' });
      gsap.fromTo('#fundBubble', { rotationY: 0, opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, ease: 'power3.out' });
    } });
  }
  details.textContent = themes[0].d;
  fundPills.forEach(function (p, k) { p.addEventListener('click', function () { setTheme(k); }); });

  /* ---------- Fit checker ---------- */
  var answers = {};
  $$('.q').forEach(function (q) {
    $$('button', q).forEach(function (b) {
      b.addEventListener('click', function () {
        answers[q.dataset.q] = b.dataset.a;
        $$('button', q).forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        renderVerdict();
      });
    });
  });
  ['#fitWho', '#fitWhat', '#fitWhere'].forEach(function (s) { $(s).addEventListener('input', renderVerdict); });
  function renderVerdict() {
    var n = Object.keys(answers).length;
    var state = n === 0 ? 'idle' : n < 3 ? 'partial' : (answers[1] === 'yes' && answers[2] === 'yes' && answers[3] === 'yes') ? 'fit' : 'nofit';
    var v = $('#verdict'), title = $('#verdictTitle'), text = $('#verdictText');
    v.dataset.state = state;
    $('#verdictBar').style.width = (n / 3 * 100) + '%';
    if (state === 'idle') { title.textContent = 'Answer all three.'; text.textContent = 'Your verdict shows up here. Nothing is saved or sent.'; }
    if (state === 'partial') { title.textContent = n + ' of 3 answered.'; text.textContent = 'Your verdict shows up here. Nothing is saved or sent.'; }
    if (state === 'fit') {
      var who = $('#fitWho').value, what = $('#fitWhat').value, where = $('#fitWhere').value.trim() || 'your neighbourhood';
      title.textContent = 'Sounds like a fit.';
      text.textContent = who.charAt(0).toUpperCase() + who.slice(1) + ' working on ' + what + ' in ' + where + '? We\'d love to hear from you.';
    }
    if (state === 'nofit') { title.textContent = 'Maybe not this round.'; text.textContent = 'This round is for Bengaluru-based fixes to a specific neighbourhood problem, that could travel. Not sure? Read the FAQs or write to us.'; }
    $('#verdictCta').hidden = state !== 'fit';
    if (animate && (state === 'fit' || state === 'nofit')) gsap.fromTo(title, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(2)' });
  }

  /* ---------- Buttons: shine follows the cursor, slight magnetic lean ---------- */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  $$('.btn').forEach(function (btn) {
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      btn.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (finePointer && !reduce) {
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.translate = (dx * 6).toFixed(1) + 'px ' + (dy * 5).toFixed(1) + 'px';
      }
    });
    btn.addEventListener('pointerleave', function () { btn.style.translate = ''; });
  });

  /* ---------- FAQ: one open at a time, smooth height ---------- */
  var faqItems = $$('.faq-item');
  faqItems.forEach(function (d) {
    var sum = $('summary', d), body = $('.faq-a', d);
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      var opening = !d.open;
      // close the others
      faqItems.forEach(function (o) {
        if (o === d || !o.open) return;
        var ob = $('.faq-a', o);
        if (animate) gsap.to(ob, { height: 0, duration: .3, ease: 'power2.inOut', onComplete: function () { o.open = false; ob.style.height = ''; } });
        else o.open = false;
      });
      if (opening) {
        d.open = true;
        if (animate) gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: .4, ease: 'power3.out', onComplete: function () { body.style.height = ''; } });
      } else if (animate) {
        gsap.to(body, { height: 0, duration: .3, ease: 'power2.inOut', onComplete: function () { d.open = false; body.style.height = ''; } });
      } else { d.open = false; }
    });
  });

  /* ---------- Apply links ---------- */
  $$('.js-apply').forEach(function (a) {
    if (APPLY_URL) { a.href = APPLY_URL; a.target = '_blank'; a.rel = 'noopener'; return; }
    // Form not live yet: show a clear "opens soon" state instead of a faded button
    a.classList.remove('btn-green'); a.classList.add('btn-soon');
    a.setAttribute('aria-disabled', 'true');
    a.innerHTML = '<i class="fa-regular fa-clock" aria-hidden="true"></i><span>Form opens soon</span>';
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---------- Without animation: done ---------- */
  if (!animate) {
    var l = $('.loader'); if (l) l.remove();
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setNavLabel(e.target.dataset.nav); }); }, { rootMargin: '-50% 0px -50% 0px' });
      $$('[data-nav]').forEach(function (s) { io.observe(s); });
    }
    $('.statement').style.cssText = 'position:relative;opacity:1;padding:10vh 24px';
    $$('.stat').forEach(function (s) { s.style.cssText = 'position:static;opacity:1;margin:0 auto 20px'; });
    $('.stats').style.height = 'auto';
    $('.hero').style.height = 'auto';
    return;
  }

  /* ================= GSAP motion ================= */
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  var heroWords = splitWords($('.hero-title'));
  gsap.set('.reveal', { opacity: 0, y: 30 });
  gsap.set(['.hero-sub', '.hero-copy .btn'], { opacity: 0, y: 20 });
  gsap.set(heroWords, { yPercent: 110, opacity: 0 });
  gsap.set('.island', { y: 160, opacity: 0 });
  gsap.set(fillWords, { color: 'rgba(33,72,149,.16)' });

  /* Loader → hero intro */
  var counter = { v: 0 };
  gsap.timeline()
    .to(counter, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: function () { $('#loaderNum').textContent = Math.round(counter.v); } })
    .to('.loader-logo', { scale: .9, opacity: 0, duration: .3 }, '-=0.1')
    .to('.loader', { yPercent: -100, duration: .8, ease: 'power4.inOut' })
    .add(function () { $('.loader').remove(); })
    .to(heroWords, { yPercent: 0, opacity: 1, stagger: .07, duration: .9, ease: 'power4.out' }, '-=0.45')
    .to('.hero-sub', { opacity: 1, y: 0, duration: .7 }, '-=0.6')
    .to('.hero-copy .btn', { opacity: 1, y: 0, duration: .6, ease: 'back.out(2)', clearProps: 'transform' }, '-=0.5')
    .to('.island', { y: 0, opacity: 1, duration: 1.3, ease: 'back.out(1.2)' }, '-=1.1');

  /* 1. Hero: short pin. Video zooms away, statement, then stats in quick succession */
  var heroTl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=160%', scrub: .8, pin: true, anticipatePin: 1 } });
  heroTl
    .to('.hero-copy', { y: -120, opacity: 0, duration: .8, ease: 'none' }, 0)
    .to('.hero-why', { opacity: 0, duration: .3 }, 0)
    .to('.island-wrap', { scale: 1.8, yPercent: -12, opacity: 0, filter: 'blur(16px)', duration: 1.2, ease: 'power1.in' }, 0)
    .to('.clouds-hero', { scale: 1.25, duration: 1.5 }, 0)
    .to('.sky', { opacity: .6, duration: 1.2 }, 0)
    .set('.statement', { opacity: 1 }, .7)
    .fromTo('.statement-text', { y: 60, opacity: 0, filter: 'blur(14px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .6 }, .7);
  $$('.stat').forEach(function (s, i, all) {
    var at = 1.2 + i * .6;
    heroTl.fromTo(s, { opacity: 0, y: 30, filter: 'blur(10px)', scale: .92 }, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: .3, ease: 'back.out(1.6)' }, at);
    if (i < all.length - 1) heroTl.to(s, { opacity: 0, y: -24, filter: 'blur(8px)', duration: .22, ease: 'power2.in' }, at + .4);
  });
  heroTl.to({}, { duration: .3 });

  /* What header + tabs rise in; the open panel's entrance plays when the section arrives */
  gsap.from(['.what-head', '.what-tabs'], { y: 40, opacity: 0, stagger: .12, duration: .8, scrollTrigger: { trigger: '.what', start: 'top 75%' } });
  ScrollTrigger.create({ trigger: '.what', start: 'top 60%', once: true, onEnter: function () { if (!whatSeen) { whatSeen = true; onPanelShown(currentTab); } } });

  /* Generic reveals (FAQ, footer) */
  ScrollTrigger.batch('.reveal', { start: 'top 88%', onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, stagger: .08, duration: .8, overwrite: true }); } });


  /* Nav label follows section (created last so positions include pin spacing) */
  $$('[data-nav]').forEach(function (s) {
    ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: function (self) { if (self.isActive) setNavLabel(s.dataset.nav); } });
  });
  // Frosted top bar once past the top (plain listener: a ScrollTrigger range drops the class at the very bottom)
  var topbar = $('.topbar');
  var setScrolled = function () { topbar.classList.toggle('scrolled', window.scrollY > 120); };
  window.addEventListener('scroll', setScrolled, { passive: true }); setScrolled();

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
