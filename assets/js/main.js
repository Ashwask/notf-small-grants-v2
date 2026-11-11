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

  /* ---------- Rotating neighbourhood: always rotates (by request, also with reduced motion) ---------- */
  var places = ['Basavanagudi', 'Yelahanka', 'Jayanagar', 'Whitefield', 'Malleswaram', 'HSR Layout', 'Frazer Town', 'Hebbal'];
  var placeEl = $('#place'), pi = 0;
  if (placeEl) {
    placeEl.textContent = places[0];
    setInterval(function () {
      // roll: current name slides up and out, next slides in from below
      placeEl.classList.add('roll-out');
      setTimeout(function () {
        pi = (pi + 1) % places.length;
        placeEl.textContent = places[pi];
        placeEl.classList.remove('roll-out');
        placeEl.classList.add('roll-in');
        void placeEl.offsetWidth; // restart transition
        placeEl.classList.remove('roll-in');
      }, 280);
    }, 2200);
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

  /* ---------- Section entrances (About / What we fund / How it works / Is this you?) ---------- */
  var fillWords = splitWords($('.fill-text'));
  var entrances = {
    about: function () {
      gsap.fromTo(fillWords, { color: 'rgba(16,54,87,.16)' }, { color: function (i, el) { return el.closest('em') ? '#3C5631' : '#2C2B32'; }, stagger: .04, duration: .4, ease: 'none' });
      gsap.from('.principle', { y: 24, opacity: 0, stagger: .1, duration: .55, ease: 'power3.out', delay: .3 });
      gsap.from('.fact', { y: 20, opacity: 0, stagger: .08, duration: .5, ease: 'back.out(1.6)', delay: .4 });
    },
    fund: function () {
      gsap.fromTo('.gs-track', { '--fill': 0 }, { '--fill': 1, duration: 1.3, ease: 'power2.inOut' });
      gsap.from('.gs-end', { y: 20, opacity: 0, stagger: .5, duration: .6 });
      gsap.from('.gs-item', { y: 40, opacity: 0, scale: .6, stagger: .22, duration: .6, ease: 'back.out(2)', delay: .2 });
      gsap.from('.gs-text', { y: 20, opacity: 0, duration: .6, delay: 1.1 });
    },
    how: function () {
      gsap.fromTo('.timeline', { '--fill': 0 }, { '--fill': 1, duration: 1.2, ease: 'power2.inOut' });
      gsap.from('.tl-node', { scale: 0, stagger: .25, duration: .5, ease: 'back.out(2.4)' });
      gsap.from('.tl-card', { y: 26, opacity: 0, stagger: .25, duration: .6, ease: 'power3.out', delay: .1 });
      gsap.from('.checks > div', { y: 24, opacity: 0, stagger: .12, duration: .6, delay: .9 });
    },
    fit: function () {
      gsap.from('.q', { x: -20, opacity: 0, stagger: .08, duration: .5, delay: .1 });
      gsap.from('.verdict', { scale: .95, opacity: 0, duration: .5, delay: .2 });
    }
  };

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
    $('.hero').style.height = 'auto';
    return;
  }

  /* ================= GSAP motion ================= */
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });

  var heroWords = splitWords($('.hero-title'));
  gsap.set('.reveal', { opacity: 0, y: 30 });
  gsap.set(['.hero-place', '.hero-btns'], { opacity: 0, y: 20 });
  gsap.set(heroWords, { yPercent: 110, opacity: 0 });
  gsap.set('.island', { y: 160, opacity: 0 });

  /* Loader → hero intro */
  var counter = { v: 0 };
  gsap.timeline()
    .to(counter, { v: 100, duration: 1.1, ease: 'power2.inOut', onUpdate: function () { $('#loaderNum').textContent = Math.round(counter.v); } })
    .to('.loader-logo', { scale: .9, opacity: 0, duration: .3 }, '-=0.1')
    .to('.loader', { yPercent: -100, duration: .8, ease: 'power4.inOut' })
    .add(function () { $('.loader').remove(); })
    .to(heroWords, { yPercent: 0, opacity: 1, stagger: .07, duration: .9, ease: 'power4.out' }, '-=0.45')
    .to('.hero-place', { opacity: 1, y: 0, duration: .7 }, '-=0.6')
    .to('.hero-btns', { opacity: 1, y: 0, duration: .6, ease: 'back.out(2)', clearProps: 'transform' }, '-=0.5')
    .to('.island', { y: 0, opacity: 1, duration: 1.3, ease: 'back.out(1.2)' }, '-=1.1');

  /* 1. Hero: gentle parallax as you scroll away (no pin) */
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } })
    .to('.hero-copy', { y: -80, opacity: 0, ease: 'none' }, 0)
    .to('.island-wrap', { scale: 1.15, yPercent: 8, opacity: .2, ease: 'none' }, 0);

  /* Each section's entrance plays once, when it scrolls into view */
  Object.keys(entrances).forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (id !== 'fit') gsap.from(el.querySelectorAll('.sec-eyebrow'), { y: 20, opacity: 0, duration: .6, scrollTrigger: { trigger: el, start: 'top 80%' } });
    ScrollTrigger.create({ trigger: el, start: 'top 72%', once: true, onEnter: entrances[id] });
  });
  gsap.set(fillWords, { color: 'rgba(16,54,87,.16)' });

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
