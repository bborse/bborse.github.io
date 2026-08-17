/* ==========================================================================
   BHUSHAN GAMES · MARKUP TEMPLATES
   --------------------------------------------------------------------------
   Pure functions that turn data into HTML strings. Nothing here touches the
   DOM, so the exact same code runs in two places:

     · the browser  — js/site.js injects the output into placeholders
     · Node         — tools/build.js writes the output into static .html files

   That is why the header, footer and every game card can never drift out of
   sync between the live site and the pre-rendered SEO pages.
   ========================================================================== */

(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { root.Templates = api; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ====================================================================
     HELPERS
     ==================================================================== */

  /** Escape a value for use in HTML text or a quoted attribute. */
  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Join array parts, dropping empties. */
  function join(parts) {
    return parts.filter(Boolean).join('');
  }

  /** Detail-page URL. `pretty` is used by the static build (/games/<slug>/). */
  function gameUrl(game, pretty) {
    return pretty ? '/games/' + game.slug + '/' : '/game.html?slug=' + game.slug;
  }

  function formatDate(iso) {
    if (!iso) { return ''; }
    var parts = String(iso).split('-');
    if (parts.length !== 3) { return iso; }
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
    var m = months[parseInt(parts[1], 10) - 1];
    return parseInt(parts[2], 10) + ' ' + (m || parts[1]) + ' ' + parts[0];
  }

  function formatCount(n) {
    if (typeof n !== 'number') { return String(n || ''); }
    return n.toLocaleString('en-US');
  }

  var STATUS = {
    'live':        { label: 'Live on Google Play', short: 'Live',        cta: 'Download',  tone: 'live' },
    'beta':        { label: 'In beta',             short: 'Beta',        cta: 'Join Beta', tone: 'beta' },
    'coming-soon': { label: 'Coming soon',         short: 'Coming Soon', cta: 'Notify me', tone: 'soon' }
  };

  function status(game) { return STATUS[game && game.status] || STATUS['coming-soon']; }


  /* ====================================================================
     ICONS
     One 24×24 viewBox each, inheriting currentColor. Referenced by name
     from games-data.js (features) and site-config.js (values, skills).
     ==================================================================== */

  var ICONS = {
    grid:    '<rect x="3" y="3" width="7.4" height="7.4" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="13.6" y="3" width="7.4" height="7.4" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><rect x="3" y="13.6" width="7.4" height="7.4" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M17.3 13.6v7.4M13.6 17.3h7.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
    offline: '<path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v9A2.5 2.5 0 0 1 18.5 17h-13A2.5 2.5 0 0 1 3 14.5Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 21h8M12 17v4M6.5 20.5 4 18M17.5 20.5 20 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    brain:   '<path d="M12 3a4.5 4.5 0 0 1 4.5 4.5c1.4.5 2.5 1.9 2.5 3.6 0 1.2-.5 2.2-1.3 2.9.2.5.3 1 .3 1.5A3.5 3.5 0 0 1 12 19a3.5 3.5 0 0 1-6-2.5c0-.5.1-1 .3-1.5A3.7 3.7 0 0 1 5 11.1c0-1.7 1.1-3.1 2.5-3.6A4.5 4.5 0 0 1 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 3v16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    check:   '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M7.5 12.5 11 16l5.5-7.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    star:    '<path d="M12 2.8 15 9l6.8 1-4.9 4.8 1.2 6.8L12 18.4 5.9 21.6 7.1 14.8 2.2 10 9 9Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    trophy:  '<path d="M7 4h10v5a5 5 0 0 1-10 0Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M7 6H4.5v1A3.5 3.5 0 0 0 7.6 10.5M17 6h2.5v1a3.5 3.5 0 0 1-3.1 3.5M9.5 20h5M12 14v6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" fill="currentColor"/>',
    zap:     '<path d="M13 2 4 14h6l-1 8 9-12h-6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    shield:  '<path d="M12 3l7.5 3v5.4c0 4.3-3.1 8.2-7.5 9.6-4.4-1.4-7.5-5.3-7.5-9.6V6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.8 12.2 11 14.4l4.2-4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    code:    '<path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.6 4.5l-3.2 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    rocket:  '<path d="M13.5 3.5c3.5 0 7 3.5 7 7 0 3-2.4 5.6-4.6 7.2l-4.6-4.6C12.9 10.9 15.5 8.5 18.5 8.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.4 6.2 5.5 7.4l2.2 2.2M17.8 13.6l-1.2 4.9-2.2-2.2M7.5 16.5 4 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    download:'<path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    play:    '<path d="M8 5v14l11-7Z" fill="currentColor"/>',
    mail:    '<rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    arrow:   '<path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    clock:   '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5.3l3.4 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    users:   '<circle cx="9" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M16 5.2a3.4 3.4 0 0 1 0 6.6M17.5 14.4a5.5 5.5 0 0 1 3 5.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    android: '<path d="M6 10.5h12v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 17Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M6 10.5a6 6 0 0 1 12 0M9 6.2 7.9 4.4M15 6.2l1.1-1.8M3.6 12v4M20.4 12v4M9.5 18.5v2M14.5 18.5v2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    box:     '<path d="M12 3 4 7v10l8 4 8-4V7Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m4 7 8 4 8-4M12 11v10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    tag:     '<path d="M4 11.5V4h7.5l8.5 8.5-7.5 7.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/>',

    instagram: '<rect x="3" y="3" width="18" height="18" rx="5.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/>',
    facebook:  '<path d="M14.5 21v-7.5h2.6l.5-3h-3.1V8.6c0-.9.3-1.5 1.6-1.5H17.7V4.4A21 21 0 0 0 15.3 4.3c-2.4 0-4 1.5-4 4.1v2.1H8.6v3h2.7V21Z" fill="currentColor"/>',
    reddit:    '<circle cx="12" cy="13.5" r="7" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="9.4" cy="13.2" r="1.15" fill="currentColor"/><circle cx="14.6" cy="13.2" r="1.15" fill="currentColor"/><path d="M9.3 16.3c1.6 1.1 3.8 1.1 5.4 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13 6.5 14 3l3.2.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18.2" cy="4.2" r="1.5" fill="currentColor"/><circle cx="3.6" cy="11.8" r="1.9" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="20.4" cy="11.8" r="1.9" fill="none" stroke="currentColor" stroke-width="1.7"/>',
    youtube:   '<rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10.4 9.3v5.4l4.6-2.7Z" fill="currentColor"/>',
    github:    '<path d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.8c-2.7.6-3.3-1.3-3.3-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.3.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z" fill="currentColor"/>'
  };

  function icon(name, size) {
    var inner = ICONS[name] || ICONS.sparkle;
    var s = size || 24;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  /** The Google Play glyph (four coloured facets), used on store buttons. */
  function playGlyph(size) {
    var s = size || 26;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' +
      '<path d="M3.6 2.3 13.9 12 3.6 21.7A1.9 1.9 0 0 1 3 20.3V3.7c0-.55.23-1.05.6-1.4Z" fill="#3B82F6"/>' +
      '<path d="m16.5 9.2 3.6 2.05c.86.5.86 1.75 0 2.24l-3.7 2.11L13.3 12Z" fill="#2563EB"/>' +
      '<path d="M3.6 2.3A1.9 1.9 0 0 1 5.4 2.2l11.1 6.35-2.6 2.6Z" fill="#60A5FA"/>' +
      '<path d="M3.6 21.7 13.9 12l2.5 2.6-11 6.3a1.9 1.9 0 0 1-1.8-.1Z" fill="#1D4ED8"/></svg>';
  }

  /** The studio logo mark. */
  function logoMark(size) {
    var s = size || 22;
    return '<svg viewBox="0 0 32 32" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' +
      '<path d="M10 8h6.5a4 4 0 0 1 0 8H10Zm0 8h7.5a4 4 0 0 1 0 8H10Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<circle cx="23.5" cy="9" r="2" fill="currentColor"/></svg>';
  }


  /* ====================================================================
     SHARED CHROME — header and footer
     ==================================================================== */

  function brand(cfg, cls) {
    return '<a class="brand ' + (cls || '') + '" href="/" aria-label="' + esc(cfg.name) + ', home">' +
      '<span class="brand__icon" aria-hidden="true">' + logoMark(22) + '</span>' +
      '<span class="brand__text">' + esc(cfg.name) + '</span></a>';
  }

  /**
   * @param {object} cfg     SITE config
   * @param {string} current pathname of the page being rendered, e.g. '/games.html'
   */
  function header(cfg, current) {
    var links = cfg.nav.map(function (item) {
      var active = current && (current === item.href ||
        (item.href !== '/' && current.indexOf(item.href.replace('.html', '')) === 0));
      return '<li><a class="nav-link' + (active ? ' is-active' : '') + '" href="' + esc(item.href) + '"' +
        (active ? ' aria-current="page"' : '') + '>' + esc(item.label) + '</a></li>';
    }).join('');

    return '' +
      '<nav class="navbar__inner container" aria-label="Primary">' +
        brand(cfg) +
        '<ul class="nav-links" id="navLinks">' + links + '</ul>' +
        '<div class="navbar__actions">' +
          '<button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to dark mode" aria-pressed="false">' +
            '<svg class="theme-toggle__sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
              '<circle cx="12" cy="12" r="4.2" fill="currentColor"/>' +
              '<g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></g></svg>' +
            '<svg class="theme-toggle__moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
              '<path d="M20 13.6A8.4 8.4 0 1 1 10.4 4a6.6 6.6 0 0 0 9.6 9.6Z" fill="currentColor"/></svg>' +
          '</button>' +
          '<a class="btn btn--primary btn--sm nav-cta" href="/games.html" data-ripple>' + icon('download', 16) + ' Our games</a>' +
          '<button class="hamburger" id="hamburger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">' +
            '<span></span><span></span><span></span></button>' +
        '</div>' +
      '</nav>';
  }

  function footer(cfg) {
    var columns = cfg.footerColumns.map(function (col) {
      var items = col.links.map(function (l) {
        var ext = l.external ? ' target="_blank" rel="noopener"' : '';
        return '<li><a href="' + esc(l.href) + '"' + ext + '>' + esc(l.label) + '</a></li>';
      }).join('');
      return '<nav class="footer__col" aria-label="' + esc(col.heading) + '">' +
        '<h2 class="footer__heading">' + esc(col.heading) + '</h2><ul>' + items + '</ul></nav>';
    }).join('');

    var socials = cfg.socials.map(function (s) {
      return '<li><a href="' + esc(s.href) + '" target="_blank" rel="noopener" aria-label="' +
        esc(cfg.name + ' on ' + s.label) + '">' + icon(s.icon, 18) + '</a></li>';
    }).join('');

    var year = new Date().getFullYear();

    return '' +
      '<div class="container footer__grid">' +
        '<div class="footer__brand">' +
          brand(cfg, 'brand--footer') +
          '<p class="footer__desc">' + esc(cfg.description) + '</p>' +
          '<ul class="socials" aria-label="' + esc(cfg.name) + ' on social media">' + socials + '</ul>' +
        '</div>' + columns +
      '</div>' +
      '<div class="container footer__bottom">' +
        '<p>© <span id="year">' + year + '</span> ' + esc(cfg.legalName || cfg.name) + '. All rights reserved.</p>' +
        '<p class="footer__made">Made in ' + esc(cfg.location) + ' · ' +
          '<a href="mailto:' + esc(cfg.email) + '">' + esc(cfg.email) + '</a></p>' +
      '</div>';
  }


  /* ====================================================================
     GAME CARD
     ==================================================================== */

  function statusBadge(game) {
    var st = status(game);
    return '<span class="badge badge--' + st.tone + '">' +
      '<span class="badge__dot" aria-hidden="true"></span>' + esc(st.short) + '</span>';
  }

  /** Primary action: a store button when there is somewhere to send people. */
  function primaryAction(game, opts) {
    var small = opts && opts.small;
    var cls = 'btn btn--store' + (small ? ' btn--sm' : '');

    if (game.status === 'live' || game.status === 'beta') {
      if (!game.playUrl) {
        return '<span class="btn btn--soon' + (small ? ' btn--sm' : '') + '" aria-disabled="true">Link pending</span>';
      }
      var label = game.status === 'beta' ? 'Join the beta' : 'Google Play';
      return '<a class="' + cls + '" href="' + esc(game.playUrl) + '" target="_blank" rel="noopener" data-ripple ' +
        'aria-label="' + esc((game.status === 'beta' ? 'Join the beta for ' : 'Download ') + game.title + ' on Google Play') + '">' +
        playGlyph(small ? 22 : 26) +
        '<span class="btn__store-copy"><small>' + (game.status === 'beta' ? 'TESTING ON' : 'GET IT ON') + '</small>' +
        '<strong>' + esc(label) + '</strong></span></a>';
    }

    /* Coming soon → a badge, not a dead button. */
    return '<span class="btn btn--soon' + (small ? ' btn--sm' : '') + '" aria-disabled="true">' +
      icon('clock', 16) + ' Coming Soon</span>';
  }

  function cardMeta(game) {
    var bits = [];
    if (game.rating) {
      bits.push('<li><span class="stars" aria-hidden="true">★</span> ' + esc(game.rating) +
        (game.ratingCount ? ' <span class="muted">(' + formatCount(game.ratingCount) + ')</span>' : '') + '</li>');
    }
    if (game.downloads) { bits.push('<li>' + esc(game.downloads) + ' installs</li>'); }
    if (!game.rating && game.expected) { bits.push('<li>' + esc(game.expected) + '</li>'); }
    if (game.size) { bits.push('<li>' + esc(game.size) + '</li>'); }
    return bits.length ? '<ul class="game-card__meta">' + bits.join('') + '</ul>' : '';
  }

  /**
   * @param {object} game
   * @param {object} [opts] { pretty: boolean, delay: number }
   */
  function gameCard(game, opts) {
    opts = opts || {};
    var url = gameUrl(game, opts.pretty);
    var delay = opts.delay ? ' data-animate-delay="' + opts.delay + '"' : '';

    return '' +
      '<article class="game-card" data-status="' + esc(game.status) + '"' +
        (game.accent ? ' data-accent="' + esc(game.accent) + '"' : '') +
        ' data-animate="fade-up"' + delay + '>' +

        '<div class="game-card__top">' +
          '<img class="game-card__icon" src="' + esc(game.icon) + '" width="88" height="88" ' +
            'alt="' + esc(game.title) + ' app icon" loading="lazy" decoding="async">' +
          '<div class="game-card__labels">' +
            statusBadge(game) +
            (game.category ? '<span class="chip">' + esc(game.category) + '</span>' : '') +
          '</div>' +
        '</div>' +

        '<h3 class="game-card__title"><a href="' + esc(url) + '">' + esc(game.title) + '</a></h3>' +
        (game.tagline ? '<p class="game-card__tagline">' + esc(game.tagline) + '</p>' : '') +
        '<p class="game-card__text">' + esc(game.shortDescription) + '</p>' +
        cardMeta(game) +

        '<div class="game-card__actions">' +
          primaryAction(game, { small: true }) +
          '<a class="btn btn--ghost btn--sm" href="' + esc(url) + '" data-ripple>Learn more</a>' +
        '</div>' +
      '</article>';
  }

  function gameGrid(list, opts) {
    opts = opts || {};
    if (!list.length) {
      return '<p class="games-empty">No games match that filter yet — check back soon.</p>';
    }
    return list.map(function (game, i) {
      return gameCard(game, { pretty: opts.pretty, delay: (i % 3) * 70 });
    }).join('');
  }


  /* ====================================================================
     GAME DETAIL PAGE
     ==================================================================== */

  function specRow(iconName, label, value) {
    if (!value) { return ''; }
    return '<div class="spec"><span class="spec__icon" aria-hidden="true">' + icon(iconName, 18) + '</span>' +
      '<span class="spec__body"><small>' + esc(label) + '</small><strong>' + esc(value) + '</strong></span></div>';
  }

  function gameDetail(game, cfg, opts) {
    opts = opts || {};
    var st = status(game);

    /* ---- hero ---- */
    var hero = '' +
      '<section class="game-hero"' + (game.accent ? ' data-accent="' + esc(game.accent) + '"' : '') + '>' +
        '<div class="game-hero__bg" aria-hidden="true">' +
          (game.cover ? '<img src="' + esc(game.cover) + '" alt="" width="1280" height="720" decoding="async">' : '') +
        '</div>' +
        '<div class="container game-hero__inner">' +
          '<a class="legal-back" href="/games.html">' +
            '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">' +
            '<path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            'All games</a>' +

          '<div class="game-hero__head">' +
            '<img class="game-hero__icon" src="' + esc(game.icon) + '" width="120" height="120" ' +
              'alt="' + esc(game.title) + ' app icon" fetchpriority="high" decoding="async">' +
            '<div>' +
              '<div class="game-hero__labels">' + statusBadge(game) +
                (game.category ? '<span class="chip">' + esc(game.category) + '</span>' : '') + '</div>' +
              '<h1 class="game-hero__title">' + esc(game.title) + '</h1>' +
              (game.tagline ? '<p class="game-hero__tagline">' + esc(game.tagline) + '</p>' : '') +
              '<div class="game-hero__actions">' + primaryAction(game) +
                '<a class="btn btn--ghost" href="#screens" data-scroll-to="#screens" data-ripple>See screenshots</a>' +
              '</div>' +
              (game.status !== 'live'
                ? '<p class="game-hero__note">' + icon('clock', 15) + ' ' +
                  esc(game.expected || st.label) + ' — <a href="/contact.html">ask for a testing invite</a>.</p>'
                : '') +
            '</div>' +
          '</div>' +

          (game.highlights && game.highlights.length
            ? '<ul class="game-hero__chips">' + game.highlights.map(function (h) {
                return '<li class="glass-chip">' + esc(h) + '</li>';
              }).join('') + '</ul>'
            : '') +
        '</div>' +
      '</section>';

    /* ---- about + specs ---- */
    var about = '' +
      '<section class="section" id="about-game">' +
        '<div class="container game-split">' +
          '<div class="game-split__main">' +
            '<h2 class="section__title section__title--sm">About the game</h2>' +
            (game.description || [game.shortDescription]).map(function (p) {
              return '<p class="game-prose">' + esc(p) + '</p>';
            }).join('') +
          '</div>' +
          '<aside class="game-split__aside" aria-label="Game details">' +
            '<div class="spec-card">' +
              specRow('tag', 'Category', game.category) +
              specRow('android', 'Requires', game.androidMin ? 'Android ' + game.androidMin + '+' : '') +
              specRow('box', 'Size', game.size) +
              specRow('clock', 'Released', game.releaseDate ? formatDate(game.releaseDate) : game.expected) +
              specRow('code', 'Package', game.packageId) +
              specRow('users', 'Installs', game.downloads) +
              specRow('shield', 'Privacy', 'No account required') +
            '</div>' +
          '</aside>' +
        '</div>' +
      '</section>';

    /* ---- features ---- */
    var features = !(game.features && game.features.length) ? '' : '' +
      '<section class="section section--alt" id="game-features">' +
        '<div class="container">' +
          '<header class="section__head">' +
            '<p class="eyebrow" data-animate="fade-up">What makes it good</p>' +
            '<h2 class="section__title" data-animate="fade-up" data-animate-delay="60">Built around one idea</h2>' +
          '</header>' +
          '<ul class="features-grid">' +
            game.features.map(function (f, i) {
              return '<li class="feature-card" data-animate="fade-up" data-animate-delay="' + (i * 60) + '">' +
                '<span class="feature-card__icon" aria-hidden="true">' + icon(f.icon, 24) + '</span>' +
                '<h3 class="feature-card__title">' + esc(f.title) + '</h3>' +
                '<p class="feature-card__text">' + esc(f.text) + '</p></li>';
            }).join('') +
          '</ul>' +
        '</div>' +
      '</section>';

    /* ---- screenshots (reuses the site-wide slider component) ---- */
    var shots = !(game.screenshots && game.screenshots.length) ? '' : '' +
      '<section class="section" id="screens">' +
        '<div class="container">' +
          '<header class="section__head">' +
            '<p class="eyebrow" data-animate="fade-up">Screenshots</p>' +
            '<h2 class="section__title" data-animate="fade-up" data-animate-delay="60">See it running</h2>' +
          '</header>' +
        '</div>' +
        '<div class="slider" id="slider" data-animate="fade-up" role="group" aria-roledescription="carousel" aria-label="' + esc(game.title) + ' screenshots">' +
          '<div class="slider__viewport" id="sliderViewport" tabindex="0" aria-live="polite">' +
            '<ul class="slider__track" id="sliderTrack">' +
              game.screenshots.map(function (s, i) {
                return '<li class="slide" role="group" aria-roledescription="slide" aria-label="' +
                    (i + 1) + ' of ' + game.screenshots.length + '">' +
                  '<figure class="phone phone--slide">' +
                    '<div class="phone__notch" aria-hidden="true"></div>' +
                    '<img class="phone__screen" src="' + esc(s.src) + '" width="300" height="620" loading="lazy" decoding="async" alt="' + esc(s.alt) + '">' +
                    (s.caption ? '<figcaption class="slide__caption">' + esc(s.caption) + '</figcaption>' : '') +
                  '</figure>' +
                  '<button class="slide__zoom" type="button" data-lightbox="' + esc(s.src) + '" aria-label="Open screenshot ' + (i + 1) + ' in full screen">' +
                    '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">' +
                    '<path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                  '</button></li>';
              }).join('') +
            '</ul>' +
          '</div>' +
          '<button class="slider__nav slider__nav--prev" id="sliderPrev" type="button" aria-label="Previous screenshot">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<button class="slider__nav slider__nav--next" id="sliderNext" type="button" aria-label="Next screenshot">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<div class="slider__dots" id="sliderDots" role="tablist" aria-label="Choose screenshot"></div>' +
        '</div>' +
      '</section>';

    /* ---- trailer (only when a video id is set) ---- */
    var video = !game.video ? '' : '' +
      '<section class="section section--alt" id="trailer">' +
        '<div class="container container--narrow">' +
          '<header class="section__head">' +
            '<p class="eyebrow" data-animate="fade-up">Trailer</p>' +
            '<h2 class="section__title" data-animate="fade-up" data-animate-delay="60">Watch it play</h2>' +
          '</header>' +
          '<div class="video-frame" data-animate="zoom-in">' +
            '<div class="video-embed" id="videoEmbed" data-video-id="' + esc(game.video) + '" ' +
              'data-video-title="' + esc(game.title + ' official trailer') + '">' +
              (game.cover ? '<img class="video-embed__poster" src="' + esc(game.cover) + '" width="1280" height="720" loading="lazy" decoding="async" alt="' + esc(game.title) + ' trailer thumbnail">' : '') +
              '<button class="video-embed__play" id="videoPlay" type="button" data-ripple aria-label="Play the ' + esc(game.title) + ' trailer">' +
                '<span class="video-embed__pulse" aria-hidden="true"></span>' + icon('play', 30) +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';

    /* ---- closing CTA ---- */
    var cta = '' +
      '<section class="cta" id="get">' +
        '<div class="cta__bg" aria-hidden="true"><span class="blob blob--cta-1"></span><span class="blob blob--cta-2"></span></div>' +
        '<div class="container cta__inner">' +
          '<h2 class="cta__title" data-animate="fade-up">' +
            esc(game.status === 'live' ? 'Ready to play?' : 'Want it first?') + '</h2>' +
          '<p class="cta__text" data-animate="fade-up" data-animate-delay="80">' +
            esc(game.status === 'live'
              ? 'Free on Google Play. ' + (game.size ? game.size + '. ' : '') + 'No account required.'
              : 'Testing invites go out in batches. Send us a line and we will add you to the next one.') + '</p>' +
          '<div class="cta__actions" data-animate="zoom-in" data-animate-delay="140">' +
            primaryAction(game) +
            (game.status !== 'live' ? '<a class="btn btn--outline" href="/contact.html" data-ripple>Request an invite</a>' : '') +
          '</div>' +
        '</div>' +
      '</section>';

    return hero + about + features + shots + video + cta;
  }

  /** JSON-LD for a single game — used by both the runtime and the build. */
  function gameSchema(game, cfg, opts) {
    var data = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: game.title,
      applicationCategory: 'GameApplication',
      applicationSubCategory: game.category || 'Puzzle',
      operatingSystem: 'Android' + (game.androidMin ? ' ' + game.androidMin + '+' : ''),
      description: game.shortDescription,
      url: cfg.origin + gameUrl(game, opts && opts.pretty),
      image: cfg.origin + (game.cover || game.icon),
      author: { '@type': 'Organization', name: cfg.name, url: cfg.origin + '/' }
    };
    if (game.playUrl) { data.downloadUrl = game.playUrl; data.installUrl = game.playUrl; }
    if (game.releaseDate) { data.datePublished = game.releaseDate; }
    if (game.size) { data.fileSize = game.size; }
    if (game.status === 'live') {
      data.offers = { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' };
    }
    if (game.rating && game.ratingCount) {
      data.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(game.rating),
        ratingCount: String(game.ratingCount),
        bestRating: '5', worstRating: '1'
      };
    }
    return data;
  }


  /* ====================================================================
     EXPORTS
     ==================================================================== */

  return {
    esc: esc,
    join: join,
    icon: icon,
    ICONS: ICONS,
    playGlyph: playGlyph,
    logoMark: logoMark,
    gameUrl: gameUrl,
    formatDate: formatDate,
    formatCount: formatCount,
    status: status,
    statusBadge: statusBadge,
    primaryAction: primaryAction,
    header: header,
    footer: footer,
    gameCard: gameCard,
    gameGrid: gameGrid,
    gameDetail: gameDetail,
    gameSchema: gameSchema
  };
}));
