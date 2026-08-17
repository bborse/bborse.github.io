/* ==========================================================================
   BHUSHAN GAMES · SITE RUNTIME
   --------------------------------------------------------------------------
   Load order (see the bottom of every page):
       games-data.js  →  site-config.js  →  templates.js  →  site.js

   What this file does, in order:
     01. Helpers
     02. Chrome        — inject the shared header and footer
     03. Routing       — render whatever the current page asks for
     04. Games         — featured row, catalogue grid, filters, detail page
     05. UI behaviours — theme, nav, reveal, counters, slider, lightbox,
                         accordion, video, ripple, cursor, parallax, floating UI

   Adding a game never touches this file. Edit js/games-data.js.
   ========================================================================== */

(function () {
  'use strict';

  var T = window.Templates;
  var CFG = window.SITE;
  var DATA = window.GameData;

  if (!T || !CFG || !DATA) {
    /* One of the data files failed to load — say so loudly in the console
       rather than leaving a silently half-built page. */
    if (window.console) {
      console.error('[Bhushan Games] Missing dependency. Expected load order: ' +
        'games-data.js → site-config.js → templates.js → site.js');
    }
    return;
  }

  /* ========================================================================
     01. HELPERS
     ======================================================================== */

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function throttleRaf(fn) {
    var queued = false;
    return function () {
      if (queued) { return; }
      queued = true;
      window.requestAnimationFrame(function () { queued = false; fn(); });
    };
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      window.clearTimeout(t);
      t = window.setTimeout(function () { fn.apply(self, args); }, wait);
    };
  }

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  function param(name) {
    var match = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : '';
  }

  /** Per-game accent colours arrive as data-accent and become a CSS variable. */
  function applyAccents(scope) {
    $$('[data-accent]', scope || document).forEach(function (el) {
      el.style.setProperty('--accent', el.getAttribute('data-accent'));
    });
  }


  /* ========================================================================
     02. SHARED CHROME
     ======================================================================== */

  function renderChrome() {
    var head = $('#siteHeader');
    var foot = $('#siteFooter');
    var path = window.location.pathname.replace(/index\.html$/, '') || '/';

    /* Pages produced by tools/build.js already contain the chrome — leave it. */
    if (head && !head.innerHTML.trim()) { head.innerHTML = T.header(CFG, path === '/' ? '/' : path); }
    if (foot && !foot.innerHTML.trim()) { foot.innerHTML = T.footer(CFG); }
  }


  /* ========================================================================
     03. ROUTING
     Each page declares what it wants with a data attribute on <body>:
         data-page="home" | "games" | "game" | "static"
     ======================================================================== */

  function renderPage() {
    var page = document.body.getAttribute('data-page') || 'static';

    /* #featuredGames may appear on any page (home, portfolio, …) */
    renderFeatured();

    if (page === 'home')  { renderHomeStats(); }
    if (page === 'games') { renderCatalogue(); }
    if (page === 'game')  { renderGameDetail(); }

    renderConfigBlocks();
    applyAccents();
  }

  /**
   * Blocks whose content lives in site-config.js — values, skills, milestones.
   * Mark a container with data-render="<key>" and it fills itself, so editing
   * the config is enough to change what the About and Portfolio pages say.
   */
  function renderConfigBlocks() {
    $$('[data-render]').forEach(function (mount) {
      var key = mount.getAttribute('data-render');
      var list = CFG[key];
      if (!Array.isArray(list)) { return; }

      if (key === 'milestones') {
        mount.innerHTML = list.map(function (m, i) {
          return '<li class="timeline__item" data-animate="' + (i % 2 ? 'fade-left' : 'fade-right') + '">' +
            '<span class="timeline__marker" aria-hidden="true">' + T.icon('rocket', 20) + '</span>' +
            '<div class="timeline__card">' +
              '<p class="timeline__step">' + T.esc(m.year) + '</p>' +
              '<h3 class="timeline__title">' + T.esc(m.title) + '</h3>' +
              '<p class="timeline__text">' + T.esc(m.text) + '</p>' +
            '</div></li>';
        }).join('');
        return;
      }

      /* values + skills share the feature-card look */
      mount.innerHTML = list.map(function (item, i) {
        return '<li class="feature-card" data-animate="fade-up" data-animate-delay="' + (i % 4) * 60 + '">' +
          '<span class="feature-card__icon" aria-hidden="true">' + T.icon(item.icon, 24) + '</span>' +
          '<h3 class="feature-card__title">' + T.esc(item.title) + '</h3>' +
          '<p class="feature-card__text">' + T.esc(item.text) + '</p></li>';
      }).join('');
    });
  }


  /* ========================================================================
     04. GAMES
     ======================================================================== */

  /* ---- Homepage: featured row ---- */
  function renderFeatured() {
    var mount = $('#featuredGames');
    if (!mount) { return; }
    mount.innerHTML = T.gameGrid(DATA.featured());
  }

  /* ---- Homepage: catalogue counters ---- */
  function renderHomeStats() {
    var s = DATA.stats();
    var map = { totalGames: s.total, liveGames: s.live, upcomingGames: s.upcoming };

    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.setAttribute('data-counter', map[id]); }
    });
  }

  /* ---- Games page: grid + filters ---- */
  function renderCatalogue() {
    var mount = $('#gamesGrid');
    var filterBar = $('#gameFilters');
    if (!mount) { return; }

    var counts = {
      all: DATA.GAMES.length,
      live: DATA.byStatus('live').length,
      beta: DATA.byStatus('beta').length,
      'coming-soon': DATA.byStatus('coming-soon').length
    };

    /* Build the filter buttons from the data, so a new status appears by itself. */
    if (filterBar) {
      var defs = [
        { key: 'all',         label: 'All games' },
        { key: 'live',        label: 'Live' },
        { key: 'beta',        label: 'Beta' },
        { key: 'coming-soon', label: 'Coming soon' }
      ].filter(function (d) { return d.key === 'all' || counts[d.key] > 0; });

      filterBar.innerHTML = defs.map(function (d) {
        return '<button class="filter" type="button" role="tab" data-filter="' + d.key + '" ' +
          'aria-selected="false">' + T.esc(d.label) +
          '<span class="filter__count">' + counts[d.key] + '</span></button>';
      }).join('');
    }

    function paint(key, pushState) {
      mount.innerHTML = T.gameGrid(DATA.byStatus(key));
      applyAccents(mount);
      revealIn(mount);

      $$('.filter', filterBar).forEach(function (b) {
        var on = b.getAttribute('data-filter') === key;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      var heading = $('#gamesCount');
      if (heading) {
        var n = DATA.byStatus(key).length;
        heading.textContent = n + (n === 1 ? ' game' : ' games');
      }

      if (pushState && window.history && window.history.replaceState) {
        window.history.replaceState({}, '', key === 'all' ? '/games.html' : '/games.html?filter=' + key);
      }
    }

    if (filterBar) {
      filterBar.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter');
        if (btn) { paint(btn.getAttribute('data-filter'), true); }
      });
    }

    var initial = param('filter');
    paint(counts[initial] !== undefined && initial !== 'all' ? initial : 'all', false);
  }

  /* ---- Detail page ---- */
  function renderGameDetail() {
    var mount = $('#gameDetail');
    if (!mount) { return; }

    /* ?slug=… on game.html, or data-slug="…" on a statically built page. */
    var game = DATA.bySlug(param('slug') || document.body.getAttribute('data-slug') || '');

    if (!game) {
      mount.innerHTML = '' +
        '<section class="section legal-hero">' +
          '<div class="container container--narrow" style="text-align:center">' +
            '<p class="eyebrow">404</p>' +
            '<h1 class="section__title">That game is not in the catalogue</h1>' +
            '<p class="section__sub">The link may be outdated, or the title has not been announced yet.</p>' +
            '<p class="contact__actions"><a class="btn btn--primary" href="/games.html" data-ripple>Browse all games</a></p>' +
          '</div>' +
        '</section>';
      document.title = 'Game not found | ' + CFG.name;
      return;
    }

    /* Statically built pages ship the markup already rendered. */
    if (!mount.innerHTML.trim()) {
      mount.innerHTML = T.gameDetail(game, CFG);
      updateGameMeta(game);
    }
    document.body.setAttribute('data-game', game.slug);
    renderStickyBar(game);
  }

  /**
   * The detail page is one HTML file serving every game, so its SEO tags are
   * rewritten at runtime. Crawlers that execute JS read these correctly; for
   * fully static per-game pages run `node tools/build.js` (see README).
   */
  function updateGameMeta(game) {
    var st = T.status(game);
    var title = game.title + ' — ' + st.short + ' | ' + CFG.name;
    var desc  = game.shortDescription;
    var url   = CFG.origin + T.gameUrl(game);
    var image = CFG.origin + (game.cover || game.icon);

    document.title = title;

    function meta(selector, value) {
      var el = document.head.querySelector(selector);
      if (el) { el.setAttribute('content', value); }
    }
    meta('meta[name="description"]', desc);
    meta('meta[property="og:title"]', title);
    meta('meta[property="og:description"]', desc);
    meta('meta[property="og:url"]', url);
    meta('meta[property="og:image"]', image);
    meta('meta[name="twitter:title"]', title);
    meta('meta[name="twitter:description"]', desc);
    meta('meta[name="twitter:image"]', image);

    var canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) { canonical.setAttribute('href', url); }

    var ld = document.getElementById('gameSchema');
    if (ld) { ld.textContent = JSON.stringify(T.gameSchema(game, CFG), null, 2); }
  }

  /** Sticky install bar on phones, built from the game currently shown. */
  function renderStickyBar(game) {
    var bar = $('#mobileBar');
    if (!bar || bar.innerHTML.trim()) { return; }

    var action = game.status === 'live' || game.status === 'beta'
      ? (game.playUrl
          ? '<a class="btn btn--primary btn--sm" href="' + T.esc(game.playUrl) + '" target="_blank" rel="noopener" data-ripple>' +
            (game.status === 'beta' ? 'Join beta' : 'Install') + '</a>'
          : '')
      : '<span class="btn btn--soon btn--sm" aria-disabled="true">Coming soon</span>';

    var facts = [];
    if (game.rating) { facts.push('★ ' + game.rating); }
    facts.push(game.status === 'live' ? 'Free' : T.status(game).short);
    if (game.size) { facts.push(game.size); }

    bar.innerHTML = '' +
      '<div class="mobile-bar__info">' +
        '<img src="' + T.esc(game.icon) + '" width="40" height="40" alt="" loading="lazy" decoding="async" aria-hidden="true">' +
        '<span><strong>' + T.esc(game.title) + '</strong><small>' + T.esc(facts.join(' · ')) + '</small></span>' +
      '</div>' + action;
  }


  /* ========================================================================
     05. UI BEHAVIOURS
     ======================================================================== */

  /* ---- Page loader ---- */
  function initLoader() {
    var loader = $('#loader');
    if (!loader) { return; }

    var MIN_VISIBLE = 480;
    var started = Date.now();
    var done = false;

    document.body.classList.add('is-locked');

    function dismiss() {
      if (done) { return; }
      done = true;
      window.setTimeout(function () {
        loader.classList.add('is-done');
        document.body.classList.remove('is-locked');
      }, Math.max(0, MIN_VISIBLE - (Date.now() - started)));
    }

    if (document.readyState === 'complete') { dismiss(); }
    else { window.addEventListener('load', dismiss, { once: true }); }
    window.setTimeout(dismiss, 5000);
  }

  /* ---- Theme ---- */
  function initTheme() {
    var toggle = $('#themeToggle');
    var root = document.documentElement;
    var KEY = 'bg-theme';
    var stored = null;

    try { stored = window.localStorage.getItem(KEY); } catch (e) { /* private mode */ }

    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    function isDark() {
      var attr = root.getAttribute('data-theme');
      return attr ? attr === 'dark' : systemDark.matches;
    }

    function sync() {
      if (!toggle) { return; }
      toggle.setAttribute('aria-pressed', isDark() ? 'true' : 'false');
      toggle.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    }

    if (stored === 'dark' || stored === 'light') { root.setAttribute('data-theme', stored); }
    sync();

    if (toggle) {
      toggle.addEventListener('click', function () {
        var next = isDark() ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { window.localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
        sync();
      });
    }

    var onChange = function () { if (!root.getAttribute('data-theme')) { sync(); } };
    if (systemDark.addEventListener) { systemDark.addEventListener('change', onChange); }
    else if (systemDark.addListener) { systemDark.addListener(onChange); }
  }

  /* ---- Navbar ---- */
  function initNavbar() {
    var navbar = $('#navbar');
    var links = $('#navLinks');
    var burger = $('#hamburger');
    var backdrop = $('#navBackdrop');
    if (!navbar) { return; }

    var lastY = window.scrollY;

    var onScroll = throttleRaf(function () {
      var y = window.scrollY;
      navbar.classList.toggle('is-scrolled', y > 24);
      if (!(links && links.classList.contains('is-open'))) {
        navbar.classList.toggle('is-hidden', y > 460 && y > lastY);
      }
      lastY = y;
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function setDrawer(open) {
      if (!links || !burger) { return; }
      links.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('is-locked', open);

      if (backdrop) {
        if (open) {
          backdrop.hidden = false;
          window.requestAnimationFrame(function () { backdrop.classList.add('is-visible'); });
        } else {
          backdrop.classList.remove('is-visible');
          window.setTimeout(function () { backdrop.hidden = true; }, 320);
        }
      }
    }

    if (burger) {
      burger.addEventListener('click', function () { setDrawer(!links.classList.contains('is-open')); });
    }
    if (backdrop) { backdrop.addEventListener('click', function () { setDrawer(false); }); }
    if (links) {
      $$('.nav-link', links).forEach(function (l) {
        l.addEventListener('click', function () { setDrawer(false); });
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links && links.classList.contains('is-open')) {
        setDrawer(false);
        burger.focus();
      }
    });

    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth > 900) { setDrawer(false); }
    }, 150));

    /* Scroll-spy for same-page anchors only (the homepage). */
    var anchors = $$('a[href^="#"]', navbar);
    var sections = anchors.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) { return; }

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        anchors.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Smooth scroll for data-scroll-to buttons ---- */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('[data-scroll-to]');
      if (!el) { return; }
      var target = $(el.getAttribute('data-scroll-to'));
      if (!target) { return; }
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ---- Scroll reveal ---- */
  var revealObserver = null;

  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      $$('[data-animate]').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    document.body.classList.add('animate-ready');

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealIn(document);
  }

  /** Observe (or immediately show) any [data-animate] inside a subtree. */
  function revealIn(scope) {
    var items = $$('[data-animate]', scope);
    if (!revealObserver) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    items.forEach(function (el) {
      var delay = el.getAttribute('data-animate-delay');
      if (delay) { el.style.setProperty('--animate-delay', delay + 'ms'); }
      revealObserver.observe(el);
    });
  }

  /* ---- Counters ---- */
  function initCounters() {
    var counters = $$('[data-counter]');
    if (!counters.length) { return; }

    function render(el, value, decimals, suffix) {
      el.textContent = (decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US')) + suffix;
    }

    function run(el) {
      var target   = parseFloat(el.getAttribute('data-counter')) || 0;
      var decimals = parseInt(el.getAttribute('data-counter-decimals'), 10) || 0;
      var suffix   = el.getAttribute('data-counter-suffix') || '';

      if (reduceMotion) { render(el, target, decimals, suffix); return; }

      var start = null;
      function step(ts) {
        if (start === null) { start = ts; }
        var p = clamp((ts - start) / 1700, 0, 1);
        render(el, target * easeOutExpo(p), decimals, suffix);
        if (p < 1) { window.requestAnimationFrame(step); }
      }
      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { counters.forEach(run); return; }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        run(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { obs.observe(el); });
  }

  /* ---- Screenshot slider ---- */
  function initSlider() {
    var root = $('#slider');
    var viewport = $('#sliderViewport');
    var track = $('#sliderTrack');
    var dotsWrap = $('#sliderDots');
    var prevBtn = $('#sliderPrev');
    var nextBtn = $('#sliderNext');
    if (!root || !viewport || !track) { return; }

    var slides = $$('.slide', track);
    if (!slides.length) { return; }

    var AUTOPLAY_MS = 4600;
    var index = 0, slideWidth = 0, timer = null, paused = false;

    function perView() {
      var w = window.innerWidth;
      if (w >= 1100) { return 3; }
      if (w >= 720)  { return 2; }
      return 1;
    }

    function measure() {
      slideWidth = viewport.clientWidth / perView();
      slides.forEach(function (s) { s.style.width = slideWidth + 'px'; });
      apply(false);
    }

    function apply(animate) {
      var offset = (viewport.clientWidth - slideWidth) / 2;
      if (!animate) { track.classList.add('is-dragging'); }
      track.style.transform = 'translate3d(' + (offset - index * slideWidth) + 'px, 0, 0)';

      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === index);
        var zoom = $('.slide__zoom', s);
        if (zoom) { zoom.tabIndex = i === index ? 0 : -1; }
      });

      if (dotsWrap) {
        $$('.slider__dot', dotsWrap).forEach(function (d, i) {
          d.classList.toggle('is-active', i === index);
          d.setAttribute('aria-selected', i === index ? 'true' : 'false');
          d.tabIndex = i === index ? 0 : -1;
        });
      }

      viewport.setAttribute('aria-label', 'Screenshot ' + (index + 1) + ' of ' + slides.length);

      if (!animate) { void track.offsetWidth; track.classList.remove('is-dragging'); }
    }

    function goTo(i, fromUser) {
      index = (i + slides.length) % slides.length;
      apply(true);
      if (fromUser) { restart(); }
    }

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach(function (s, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Go to screenshot ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i, true); });
        dotsWrap.appendChild(dot);
      });
    }

    if (prevBtn) { prevBtn.addEventListener('click', function () { goTo(index - 1, true); }); }
    if (nextBtn) { nextBtn.addEventListener('click', function () { goTo(index + 1, true); }); }

    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(index - 1, true); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1, true); }
    });

    function start() {
      if (reduceMotion || paused || timer || slides.length < 2) { return; }
      timer = window.setInterval(function () { goTo(index + 1, false); }, AUTOPLAY_MS);
    }
    function stop() { window.clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    root.addEventListener('mouseenter', function () { paused = true; stop(); });
    root.addEventListener('mouseleave', function () { paused = false; start(); });
    root.addEventListener('focusin',    function () { paused = true; stop(); });
    root.addEventListener('focusout',   function () { paused = false; start(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    var dragging = false, startX = 0, delta = 0;

    viewport.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) { return; }
      dragging = true; delta = 0; startX = e.clientX;
      track.classList.add('is-dragging');
      stop();
    });

    window.addEventListener('pointermove', function (e) {
      if (!dragging) { return; }
      delta = e.clientX - startX;
      var offset = (viewport.clientWidth - slideWidth) / 2;
      track.style.transform = 'translate3d(' + (offset - index * slideWidth + delta) + 'px, 0, 0)';
    }, { passive: true });

    function endDrag() {
      if (!dragging) { return; }
      dragging = false;
      track.classList.remove('is-dragging');
      var threshold = Math.min(90, slideWidth * 0.22);
      if (delta > threshold)       { goTo(index - 1, true); }
      else if (delta < -threshold) { goTo(index + 1, true); }
      else                         { apply(true); start(); }
    }

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    viewport.addEventListener('click', function (e) {
      if (Math.abs(delta) > 8) { e.preventDefault(); e.stopPropagation(); delta = 0; }
    }, true);

    window.addEventListener('resize', debounce(measure, 120));
    measure();
    start();
  }

  /* ---- Lightbox ---- */
  function initLightbox() {
    var box = $('#lightbox');
    var img = $('#lightboxImg');
    var caption = $('#lightboxCaption');
    var closeBtn = $('#lightboxClose');
    var prevBtn = $('#lightboxPrev');
    var nextBtn = $('#lightboxNext');
    var triggers = $$('[data-lightbox]');
    if (!box || !img || !closeBtn || !triggers.length) { return; }

    var gallery = triggers.map(function (btn) {
      var slide = btn.closest('.slide');
      var src = slide ? $('.phone__screen', slide) : null;
      var cap = slide ? $('.slide__caption', slide) : null;
      return {
        src: btn.getAttribute('data-lightbox'),
        alt: src ? src.getAttribute('alt') : '',
        caption: cap ? cap.textContent.trim() : ''
      };
    });

    var current = 0, lastFocused = null;

    function show(i) {
      current = (i + gallery.length) % gallery.length;
      img.src = gallery[current].src;
      img.alt = gallery[current].alt;
      if (caption) {
        caption.textContent = gallery[current].caption + ' — ' + (current + 1) + ' of ' + gallery.length;
      }
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      box.hidden = false;
      document.body.classList.add('is-locked');
      window.requestAnimationFrame(function () { box.classList.add('is-open'); });
      closeBtn.focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      window.setTimeout(function () { box.hidden = true; }, 320);
      if (lastFocused && lastFocused.focus) { lastFocused.focus(); }
    }

    triggers.forEach(function (btn, i) {
      btn.addEventListener('click', function (e) { e.preventDefault(); open(i); });
    });

    closeBtn.addEventListener('click', close);
    if (prevBtn) { prevBtn.addEventListener('click', function () { show(current - 1); }); }
    if (nextBtn) { nextBtn.addEventListener('click', function () { show(current + 1); }); }
    box.addEventListener('click', function (e) { if (e.target === box) { close(); } });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) { return; }
      if (e.key === 'Escape')     { close(); }
      if (e.key === 'ArrowLeft')  { show(current - 1); }
      if (e.key === 'ArrowRight') { show(current + 1); }
      if (e.key === 'Tab') {
        var f = [prevBtn, nextBtn, closeBtn].filter(Boolean);
        var pos = f.indexOf(document.activeElement);
        e.preventDefault();
        f[((e.shiftKey ? pos - 1 : pos + 1) + f.length) % f.length].focus();
      }
    });
  }

  /* ---- YouTube facade ---- */
  function initVideo() {
    var embed = $('#videoEmbed');
    var button = $('#videoPlay');
    if (!embed || !button) { return; }

    var loaded = false;
    function load() {
      if (loaded) { return; }
      var id = embed.getAttribute('data-video-id');
      if (!id) { return; }
      loaded = true;

      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      iframe.title = embed.getAttribute('data-video-title') || 'Gameplay video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.setAttribute('allowfullscreen', '');
      embed.innerHTML = '';
      embed.appendChild(iframe);
      embed.style.cursor = 'default';
    }

    button.addEventListener('click', load);
    embed.addEventListener('click', load);
  }

  /* ---- FAQ / accordion ---- */
  function initAccordion() {
    var root = $('#accordion');
    if (!root) { return; }

    var items = $$('.accordion__item', root);

    function collapse(item) {
      var trigger = $('.accordion__trigger', item);
      var panel = $('.accordion__panel', item);
      if (!trigger || !panel || !item.classList.contains('is-open')) { return; }
      item.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      panel.style.maxHeight = '0px';
      window.setTimeout(function () {
        if (!item.classList.contains('is-open')) { panel.hidden = true; }
      }, 420);
    }

    function expand(item) {
      var trigger = $('.accordion__trigger', item);
      var panel = $('.accordion__panel', item);
      if (!trigger || !panel) { return; }
      panel.hidden = false;
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      window.requestAnimationFrame(function () { panel.style.maxHeight = panel.scrollHeight + 'px'; });
    }

    items.forEach(function (item) {
      var trigger = $('.accordion__trigger', item);
      if (!trigger) { return; }
      trigger.addEventListener('click', function () {
        var open = item.classList.contains('is-open');
        items.forEach(function (o) { if (o !== item) { collapse(o); } });
        if (open) { collapse(item); } else { expand(item); }
      });
    });

    window.addEventListener('resize', debounce(function () {
      items.forEach(function (item) {
        if (!item.classList.contains('is-open')) { return; }
        var panel = $('.accordion__panel', item);
        if (panel) { panel.style.maxHeight = panel.scrollHeight + 'px'; }
      });
    }, 150));
  }

  /* ---- Ripple (delegated, so dynamic content works too) ---- */
  function initRipple() {
    if (reduceMotion) { return; }

    document.addEventListener('pointerdown', function (e) {
      var el = e.target.closest && e.target.closest('[data-ripple]');
      if (!el) { return; }

      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top  = (e.clientY - rect.top - size / 2) + 'px';
      el.appendChild(ripple);
      window.setTimeout(function () {
        if (ripple.parentNode) { ripple.parentNode.removeChild(ripple); }
      }, 620);
    });
  }

  /* ---- Custom cursor ---- */
  function initCursor() {
    var dot = $('#cursorDot');
    var ring = $('#cursorRing');
    if (!dot || !ring || !finePointer || reduceMotion) { return; }

    var mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      document.body.classList.add('has-cursor');
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      window.requestAnimationFrame(loop);
    }());

    var HOVERABLE = 'a, button, [data-ripple], .slider__dot, .accordion__trigger, .game-card, .feature-card, input, textarea, summary';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(HOVERABLE)) { document.body.classList.add('cursor-hover'); }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(HOVERABLE)) { document.body.classList.remove('cursor-hover'); }
    });
    document.addEventListener('mouseleave', function () { document.body.classList.remove('has-cursor'); });
  }

  /* ---- Parallax + card glow ---- */
  function initParallax() {
    if (!finePointer || reduceMotion) { return; }

    var layers = $$('[data-parallax]');
    if (layers.length) {
      var tx = 0, ty = 0, cx = 0, cy = 0;

      window.addEventListener('mousemove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      (function loop() {
        cx += (tx - cx) * 0.06;
        cy += (ty - cy) * 0.06;
        layers.forEach(function (layer) {
          var depth = parseFloat(layer.getAttribute('data-parallax')) || 0;
          layer.style.translate = (cx * depth * 100).toFixed(2) + 'px ' + (cy * depth * 100).toFixed(2) + 'px';
        });
        window.requestAnimationFrame(loop);
      }());
    }

    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.feature-card, .game-card');
      if (!card) { return; }
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    });
  }

  /* ---- Floating UI ---- */
  function initFloatingUi() {
    var progress = $('#scrollProgress');
    var toTop = $('#toTop');
    var mobileBar = $('#mobileBar');

    var onScroll = throttleRaf(function () {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (progress) { progress.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0) + '%'; }
      if (toTop) { toTop.classList.toggle('is-visible', y > 620); }
      if (mobileBar && mobileBar.innerHTML.trim()) { mobileBar.classList.toggle('is-visible', y > 320); }
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', debounce(onScroll, 120));
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ---- Contact form (no backend — opens the visitor's mail client) ---- */
  function initContactForm() {
    var form = $('#contactForm');
    if (!form) { return; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var topic = form.elements.topic.value;
      var message = form.elements.message.value.trim();
      var status = $('#formStatus');

      if (!name || !email || !message) {
        if (status) { status.textContent = 'Please fill in your name, email and message.'; }
        return;
      }

      var body = 'Name: ' + name + '\nEmail: ' + email + '\nTopic: ' + topic + '\n\n' + message;
      var to = topic === 'Press' ? CFG.pressEmail : (topic === 'Support' ? CFG.supportEmail : CFG.email);

      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent('[' + topic + '] ' + name) +
        '&body=' + encodeURIComponent(body);

      if (status) {
        status.textContent = 'Opening your email app… if nothing happens, write to ' + to + ' directly.';
      }
    });
  }

  /* ---- Footer year (for statically built pages) ---- */
  function initMisc() {
    var year = $('#year');
    if (year) { year.textContent = String(new Date().getFullYear()); }
  }


  /* ========================================================================
     BOOTSTRAP
     Content first, behaviours second — so everything the observers and the
     slider need already exists in the DOM by the time they run.
     ======================================================================== */

  function boot() {
    renderChrome();
    renderPage();

    initLoader();
    initTheme();
    initNavbar();
    initSmoothScroll();
    initReveal();
    initCounters();
    initSlider();
    initLightbox();
    initVideo();
    initAccordion();
    initRipple();
    initCursor();
    initParallax();
    initFloatingUi();
    initContactForm();
    initMisc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}());
