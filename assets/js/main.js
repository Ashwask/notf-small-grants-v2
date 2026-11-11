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
    how: function () {
      gsap.from('.step-card', { y: 50, rotation: -6, opacity: 0, duration: .8, ease: 'back.out(1.5)' });
      gsap.from('.step-list li', { x: -16, opacity: 0, stagger: .08, duration: .45, delay: .15 });
      gsap.from('.step-arc', { xPercent: 30, opacity: 0, duration: .9, ease: 'power3.out' });
      gsap.from('.checks > div', { y: 24, opacity: 0, stagger: .12, duration: .6, delay: .5 });
    },
    fit: function () {
      gsap.from('.q', { x: -20, opacity: 0, stagger: .08, duration: .5, delay: .1 });
      gsap.from('.verdict', { scale: .95, opacity: 0, duration: .5, delay: .2 });
    }
  };

  /* ---------- How it works stepper ---------- */
  var steps = [
    { t: 'Fill in the short application form linked at the end of this page.', tag: 'Any time', i: 'fa-pen-to-square', s: 'fa-file-pen', bg: 'linear-gradient(140deg, #FFEFD6, #F6D9B5)' },
    { t: 'A short conversation and, if it helps, a visit to see the problem and your work on it.', tag: 'A call or a visit', i: 'fa-comments', s: 'fa-people-arrows', bg: 'linear-gradient(140deg, #EEF2DC, #B5C37C)' },
    { t: 'You hear back from us, yes or no, within about six weeks of applying.', tag: 'About 6 weeks', i: 'fa-circle-check', s: 'fa-envelope-open-text', bg: 'linear-gradient(140deg, #FFF3D6, #FAB52A)' },
    { t: 'The grant is transferred and you get on with the fix.', tag: 'Up to 6 months to deliver', i: 'fa-indian-rupee-sign', s: 'fa-hand-holding-heart', bg: 'linear-gradient(140deg, #F8E2D6, #D2865D)' }
  ];
  var stepIdx = 0, stepBtns = $$('.step-list button');
  function setStep(i, focus) {
    i = (i + steps.length) % steps.length;
    if (i === stepIdx && !focus) return;
    stepIdx = i; var st = steps[i];
    stepBtns.forEach(function (b, k) { var on = k === i; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    if (focus) stepBtns[i].focus();
    var apply = function () {
      $('#stepText').textContent = st.t; $('#stepTag').textContent = st.tag;
      $('#stepNum').textContent = '0' + (i + 1); $('#stepIcon').className = 'fa-solid ' + st.i;
      $('#stepScene').style.background = st.bg;
      $('#stepBar').style.width = ((i + 1) / steps.length * 100) + '%';
    };
    if (!animate) { apply(); return; }
    gsap.to(['#stepText', '#stepTag', '.step-card'], { opacity: 0, y: -10, duration: .18, ease: 'power2.in', onComplete: function () {
      apply();
      gsap.fromTo(['#stepText', '#stepTag'], { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: .05, duration: .45, ease: 'power3.out' });
      gsap.fromTo('.step-card', { opacity: 0, y: 26, rotation: -4 }, { opacity: 1, y: 0, rotation: 0, duration: .6, ease: 'back.out(1.6)' });
    } });
  }
  // Scroll drives the steps (pinned below, in the GSAP section); clicking a step jumps the scroll there
  var stepST = null;
  function goToStep(k) {
    if (stepST) window.scrollTo({ top: stepST.start + (k + .5) / steps.length * (stepST.end - stepST.start), behavior: reduce ? 'auto' : 'smooth' });
    else setStep(k);
  }
  stepBtns.forEach(function (b, k) {
    b.addEventListener('click', function () { goToStep(k); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); var n = Math.max(0, Math.min(steps.length - 1, stepIdx + d)); goToStep(n); stepBtns[n].focus(); }
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

  /* About: scrubbed with the scroll. Heading rises word by word, lead fills in,
     facts pop one by one, video frame grows into place, principles rise in turn. */
  var aboutWords = splitWords($('.about-title'));
  function aboutTimeline(end) {
    return gsap.timeline({ scrollTrigger: { trigger: '#about', start: 'top 75%', end: end, scrub: 1 } })
      .from('#about .sec-eyebrow', { y: 20, opacity: 0, duration: .3 })
      .from(aboutWords, { yPercent: 80, opacity: 0, stagger: .06, duration: .4, ease: 'power3.out' }, .1)
      .to(fillWords, { color: function (i, el) { return el.closest('em') ? '#3C5631' : '#2C2B32'; }, stagger: .03, duration: .3, ease: 'none' }, .5)
      .from('.about-frame', { scale: .82, opacity: 0, rotation: 2, duration: 1, ease: 'power2.out' }, .2)
      .from('.fact', { y: 40, opacity: 0, scale: .7, stagger: .18, duration: .5, ease: 'back.out(2.2)' }, .9)
      .from('.principle', { y: 60, opacity: 0, stagger: .2, duration: .6, ease: 'back.out(1.6)' }, 1.5);
  }
  // desktop: finished as the section reaches the top; phones (tall stack): finished near its bottom
  var aboutMM = gsap.matchMedia();
  aboutMM.add('(min-width: 901px)', function () { aboutTimeline('top 10%'); });
  aboutMM.add('(max-width: 900px)', function () { aboutTimeline('bottom 95%'); });

  /* Grant size: scrubbed with the scroll, like v1. Line draws, amounts fade in,
     each step pops up in turn (bouncy), then the description. Reverses on scroll up. */
  gsap.timeline({ scrollTrigger: { trigger: '#fund', start: 'top 70%', end: 'center 40%', scrub: 1 } })
    .from('#fund .how-head', { y: 30, opacity: 0, duration: .4 })
    .fromTo('.gs-track', { '--fill': 0 }, { '--fill': 1, duration: 1.6, ease: 'none' }, .2)
    .from('.gs-end', { y: 24, opacity: 0, stagger: 1.1, duration: .5 }, .2)
    .from('.gs-item', { y: 60, opacity: 0, scale: .4, stagger: .32, duration: .55, ease: 'back.out(2.4)' }, .45)
    .from('.gs-item small', { y: 10, opacity: 0, stagger: .32, duration: .4 }, .65)
    .from('.gs-text', { y: 30, opacity: 0, duration: .5 }, 1.6);

  /* How it works: pin the stepper; scrolling moves through the four steps */
  stepST = ScrollTrigger.create({
    trigger: '.stepper', start: 'center center', end: '+=' + (steps.length * 60) + '%', pin: true, anticipatePin: 1,
    onUpdate: function (self) { setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))); }
  });

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
