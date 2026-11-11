/* NoTF BLR Small Grants v2: scroll-story motion (GSAP + ScrollTrigger).
   Everything still works without JS animation (reduced motion / CDN blocked):
   content is visible, pinned scenes fall back to click-driven tabs. */
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
            s.className = 'w';
            s.style.display = 'inline-block';
            s.textContent = part;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
    return $$('.w', el);
  }

  /* ---------- Looping videos (hero + about panel): always playing, never a still ---------- */
  var loopVideos = $$('video.js-loop');
  function playAll() { loopVideos.forEach(function (v) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }); }
  loopVideos.forEach(function (v) { v.muted = true; v.addEventListener('canplay', playAll); v.addEventListener('pause', function () { if (!document.hidden) playAll(); }); });
  playAll();
  // Some mobile browsers block autoplay until the first touch; start them then
  ['touchstart', 'click', 'scroll'].forEach(function (ev) { window.addEventListener(ev, playAll, { once: true, passive: true }); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) playAll(); });

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
      if (animate) gsap.fromTo(navPanel, { opacity: 0, y: 16, scale: .94 }, { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(1.6)' });
      if (animate) gsap.fromTo($$('a', navPanel), { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: .03, duration: .3, delay: .08 });
    } else if (animate) {
      gsap.to(navPanel, { opacity: 0, y: 10, scale: .96, duration: .25, ease: 'power2.in', onComplete: function () { navPanel.hidden = true; } });
    } else {
      navPanel.hidden = true;
    }
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

  /* ---------- What we fund ---------- */
  var themes = [
    { t: 'Public spaces', l: 'Parks, footpaths, play areas, bus stops', d: 'Reclaim a corner, fix a footpath, light up a dark stretch, or turn a dumping spot into a place people stop and sit.', i: 'fa-tree-city' },
    { t: 'Waste', l: 'Segregation, composting, clean streets', d: 'Ward-level composting, cutlery banks, segregation drives, or keeping a black spot clean for good.', i: 'fa-recycle' },
    { t: 'Water', l: 'Lakes, drains, rainwater, flooding', d: 'Rain gardens, recharge wells, drain clean-ups, or a lake group that needs equipment to keep going.', i: 'fa-droplet' },
    { t: 'Trees and greening', l: 'Street trees, gardens, shade', d: 'Planting and caring for street trees, shade for bus stops, or a community garden on an unused plot.', i: 'fa-seedling' },
    { t: 'Walking and mobility', l: 'Safe streets, crossings, cycling', d: 'Safer school routes, crossings, cycle days, or signage that helps people walk their neighbourhood.', i: 'fa-person-walking' }
  ];
  var fundIdx = 0, fundST = null;
  var fundPills = $$('.fund-pills .pill');
  var detailsBtn = $('#fundDetailsBtn'), details = $('#fundDetails');
  function setDetails(open) {
    detailsBtn.setAttribute('aria-expanded', String(open));
    details.hidden = !open;
    detailsBtn.querySelector('i').className = 'fa-solid ' + (open ? 'fa-minus' : 'fa-plus');
  }
  detailsBtn.addEventListener('click', function () { setDetails(detailsBtn.getAttribute('aria-expanded') !== 'true'); });
  function setTheme(i) {
    if (i === fundIdx && $('#fundTitle').textContent === themes[i].t) return;
    var dir = i > fundIdx ? 1 : -1;
    fundIdx = i;
    var th = themes[i];
    fundPills.forEach(function (p, k) { p.classList.toggle('is-active', k === i); p.setAttribute('aria-selected', String(k === i)); });
    var apply = function () {
      $('#fundTitle').textContent = th.t; $('#fundLine').textContent = th.l; details.textContent = th.d;
      $('#fundIcon').className = 'fa-solid ' + th.i;
    };
    setDetails(false);
    if (!animate) { apply(); return; }
    gsap.to('#fundTile', { rotationY: -90 * dir, opacity: 0, duration: .22, ease: 'power2.in', onComplete: function () {
      apply();
      gsap.fromTo('#fundTile', { rotationY: 90 * dir, opacity: 0 }, { rotationY: 0, opacity: 1, duration: .6, ease: 'back.out(1.5)' });
      gsap.fromTo(['#fundTitle', '#fundLine'], { y: 10, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .4, ease: 'power3.out' });
    } });
  }
  details.textContent = themes[0].d;
  fundPills.forEach(function (p, k) {
    p.addEventListener('click', function () {
      if (fundST) window.scrollTo({ top: fundST.start + (k + .5) / themes.length * (fundST.end - fundST.start), behavior: 'smooth' });
      else setTheme(k);
    });
  });

  /* ---------- How it works ---------- */
  var steps = [
    { t: 'Fill in and submit the application form linked at the end of this page.', i: 'fa-pen-to-square', s: 'fa-file-pen', bg: 'linear-gradient(140deg, #F4EFD9, #E3D5B5)' },
    { t: 'A short conversation and, if it helps, a visit to see the problem and your work on it.', i: 'fa-comments', s: 'fa-people-arrows', bg: 'linear-gradient(140deg, #E4F2DC, #9CCB6A)' },
    { t: 'You hear back from us, yes or no, within about six weeks of applying.', i: 'fa-circle-check', s: 'fa-envelope-open-text', bg: 'linear-gradient(140deg, #EAF3FB, #9DB7D6)' },
    { t: 'The grant is transferred and you get on with the fix.', i: 'fa-indian-rupee-sign', s: 'fa-hand-holding-heart', bg: 'linear-gradient(140deg, #FCEBD9, #F5B82E)' }
  ];
  var howIdx = -1, howST = null;
  var howTabs = $$('.how-tabs button');
  function setStep(i) {
    if (i === howIdx) return;
    howIdx = i;
    var st = steps[i];
    howTabs.forEach(function (b, k) { b.classList.toggle('is-active', k === i); b.setAttribute('aria-selected', String(k === i)); });
    var apply = function () {
      $('#howText').textContent = st.t;
      $('#howBig').textContent = '0' + (i + 1);
      $('#howIcon').className = 'fa-solid ' + st.i;
      $('#howScene').style.background = st.bg;
      $('#howScene i').className = 'fa-solid ' + st.s;
    };
    if (!animate) { apply(); return; }
    gsap.to(['#howText', '.how-card'], { opacity: 0, y: -12, duration: .2, ease: 'power2.in', onComplete: function () {
      apply();
      gsap.fromTo('#howText', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .45, ease: 'power3.out' });
      gsap.fromTo('.how-card', { opacity: 0, y: 30, rotation: -4 }, { opacity: 1, y: 0, rotation: 0, duration: .6, ease: 'back.out(1.6)' });
      gsap.fromTo('#howScene i', { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(1.8)' });
    } });
  }
  setStep(0);
  howTabs.forEach(function (b, k) {
    b.addEventListener('click', function () {
      if (howST) window.scrollTo({ top: howST.start + (k + .5) / steps.length * (howST.end - howST.start), behavior: 'smooth' });
      else setStep(k);
    });
  });

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

  /* ---------- Apply links ---------- */
  $$('.js-apply').forEach(function (a) {
    if (APPLY_URL) { a.href = APPLY_URL; a.target = '_blank'; a.rel = 'noopener'; return; }
    a.setAttribute('aria-disabled', 'true');
    a.addEventListener('click', function (e) { e.preventDefault(); });
    $('#applySoon').hidden = false;
  });

  /* ---------- Without animation: done ---------- */
  if (!animate) {
    var l = $('.loader'); if (l) l.remove();
    // Keep the nav label in sync without ScrollTrigger
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

  // Pre-split text
  var heroWords = splitWords($('.hero-title'));
  var fillWords = splitWords($('.fill-text'));
  var rollTitle = splitWords($('.rolling-title'));
  var rollPara = splitWords($('.rolling-para'));
  gsap.set('.reveal', { opacity: 0, y: 30 });
  gsap.set(['.hero-sub', '.hero-copy .btn'], { opacity: 0, y: 20 });
  gsap.set(heroWords, { yPercent: 110, opacity: 0 });
  gsap.set('.island', { y: 160, opacity: 0 });

  /* Loader */
  var counter = { v: 0 };
  gsap.timeline()
    .to(counter, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: function () { $('#loaderNum').textContent = Math.round(counter.v); } })
    .to('.loader-logo', { scale: .9, opacity: 0, duration: .3 }, '-=0.1')
    .to('.loader', { yPercent: -100, duration: .8, ease: 'power4.inOut' })
    .add(function () { $('.loader').remove(); })
    // Hero intro
    .to(heroWords, { yPercent: 0, opacity: 1, stagger: .07, duration: .9, ease: 'power4.out' }, '-=0.45')
    .to('.hero-sub', { opacity: 1, y: 0, duration: .7 }, '-=0.6')
    .to('.hero-copy .btn', { opacity: 1, y: 0, duration: .6, ease: 'back.out(2)' }, '-=0.5')
    .to('.island', { y: 0, opacity: 1, duration: 1.3, ease: 'back.out(1.2)' }, '-=1.1');

  /* 1. Hero: pinned zoom-out, statement, stats one at a time */
  var heroTl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=320%', scrub: 1, pin: true, anticipatePin: 1 } });
  heroTl
    .to('.hero-copy', { y: -140, opacity: 0, duration: 1, ease: 'none' }, 0)
    .to('.hero-why', { opacity: 0, duration: .3 }, 0)
    .to('.island-wrap', { scale: 1.9, yPercent: -12, opacity: 0, filter: 'blur(16px)', duration: 1.6, ease: 'power1.in' }, 0)
    .to('.clouds-hero', { scale: 1.25, duration: 2 }, 0)
    .to('.sky', { opacity: .6, duration: 1.6 }, 0)
    .set('.statement', { opacity: 1 }, 1.0)
    .fromTo('.statement-text', { y: 70, opacity: 0, filter: 'blur(14px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .9 }, 1.0);
  $$('.stat').forEach(function (s, i, all) {
    var at = 1.8 + i * 1.1;
    heroTl.fromTo(s, { opacity: 0, y: 40, filter: 'blur(10px)', scale: .92 }, { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: .5, ease: 'back.out(1.6)' }, at);
    if (i < all.length - 1) heroTl.to(s, { opacity: 0, y: -30, filter: 'blur(8px)', duration: .4, ease: 'power2.in' }, at + .75);
  });
  heroTl.to({}, { duration: .6 });

  /* 2. About: words fill in as you scroll */
  gsap.to(fillWords, { color: '#214895', stagger: .1, ease: 'none', scrollTrigger: { trigger: '.fill-text', start: 'top 80%', end: 'bottom 35%', scrub: true } });
  // Photo grows to full bleed, then stamps pop
  gsap.to('.grow-media', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.grow', start: 'top 90%', end: 'top top', scrub: true } });
  gsap.from('.grow-scene .bubble', { y: 30, opacity: 0, stagger: .25, duration: .7, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.grow', start: 'top 30%' } });
  gsap.from('.stamp', { scale: 0, rotation: -45, opacity: 0, stagger: .14, duration: .8, ease: 'back.out(2.2)', scrollTrigger: { trigger: '.grow', start: 'top 10%' } });

  var mm = gsap.matchMedia();

  mm.add('(min-width: 901px)', function () {
    /* 3. Fund: pinned, scroll drives the theme */
    fundST = ScrollTrigger.create({
      trigger: '.fund', start: 'top top', end: '+=' + (themes.length * 70) + '%', pin: true, anticipatePin: 1,
      onUpdate: function (self) { setTheme(Math.min(themes.length - 1, Math.floor(self.progress * themes.length))); }
    });
    gsap.from('#fundTile', { y: 120, rotation: -8, opacity: 0, duration: 1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.fund', start: 'top 70%' } });
    gsap.from('.cloud-bubble', { scale: .6, opacity: 0, duration: .8, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.fund', start: 'top 40%' } });

    /* 5. How: pinned, scroll drives the step; arc slides in */
    howST = ScrollTrigger.create({
      trigger: '.how', start: 'top top', end: '+=' + (steps.length * 70) + '%', pin: true, anticipatePin: 1,
      onUpdate: function (self) { setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))); }
    });
    gsap.from('.how-arc', { xPercent: 40, ease: 'none', scrollTrigger: { trigger: '.how', start: 'top bottom', end: 'top top', scrub: true } });

    /* 6. Rolling: pinned word-by-word reveal */
    var rt = gsap.timeline({ scrollTrigger: { trigger: '.rolling', start: 'top top', end: '+=200%', scrub: 1, pin: true, anticipatePin: 1 } });
    rt.to(rollTitle, { opacity: 1, stagger: .12, duration: .3, ease: 'none' })
      .to(rollPara, { opacity: 1, stagger: .05, duration: .2, ease: 'none' }, '+=.2')
      .from('.checks > div', { y: 60, opacity: 0, stagger: .2, duration: .6 }, '+=.1')
      .to('.scroll-hint', { opacity: 0, duration: .3 }, '<');

    return function () { fundST = null; howST = null; };
  });

  mm.add('(max-width: 900px)', function () {
    setTheme(0);
    var rt = gsap.timeline({ scrollTrigger: { trigger: '.rolling-inner', start: 'top 75%', end: 'bottom 60%', scrub: 1 } });
    rt.to(rollTitle, { opacity: 1, stagger: .1, ease: 'none' })
      .to(rollPara, { opacity: 1, stagger: .04, ease: 'none' })
      .from('.checks > div', { y: 40, opacity: 0, stagger: .2 });
  });

  /* 4. Range line draws, items grow along it */
  var rangeTl = gsap.timeline({ scrollTrigger: { trigger: '.range', start: 'top 70%', end: 'center 45%', scrub: 1 } });
  rangeTl.from('.range-bar', { scaleX: 0, ease: 'none', duration: 1 })
    .from('.range-end', { opacity: 0, y: 20, stagger: .5, duration: .4 }, 0)
    .from('.range-item', { opacity: 0, y: 40, scale: .5, stagger: .2, duration: .4, ease: 'back.out(2)' }, .2);

  /* 7. City: title, disc, pins */
  gsap.from('.city-title', { opacity: 0, y: 60, scale: .94, scrollTrigger: { trigger: '.city', start: 'top 75%', end: 'top 35%', scrub: true } });
  gsap.from('.city-disc', { opacity: 0, scale: .8, rotation: -25, transformOrigin: '50% 50%', duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.city-disc', start: 'top 80%' } });
  gsap.from('.pins > g > *', { opacity: 0, y: -20, stagger: .05, duration: .5, ease: 'back.out(2.5)', scrollTrigger: { trigger: '.city-disc', start: 'top 55%' } });
  gsap.from('.orbit', { scale: .7, opacity: 0, transformOrigin: '50% 50%', stagger: .15, duration: 1.4, scrollTrigger: { trigger: '.city-disc', start: 'top 70%' } });

  /* Generic reveals */
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, stagger: .08, duration: .8, overwrite: true }); }
  });

  /* Footer globe rises */
  gsap.from('.footer-globe', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* Nav label follows section. Created last so positions include all pin spacing. */
  $$('[data-nav]').forEach(function (s) {
    ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: function (self) { if (self.isActive) setNavLabel(s.dataset.nav); } });
  });
  /* Top bar gets a frosted backdrop once past the hero */
  ScrollTrigger.create({ start: 120, end: 'max', toggleClass: { targets: '.topbar', className: 'scrolled' } });
  /* Top bar turns light over the dark section */
  ScrollTrigger.create({ trigger: '.rolling', start: 'top 40px', end: 'bottom 40px', toggleClass: { targets: '.topbar', className: 'on-dark' } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
