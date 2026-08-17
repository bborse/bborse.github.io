/* ==========================================================================
   BHUSHAN GAMES · GAME CATALOGUE
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT TO ADD A GAME.

   Append one object to the GAMES array below and the whole site updates:
     · the featured row on the homepage          (index.html)
     · the full catalogue grid + filters         (games.html)
     · a complete detail page                    (game.html?slug=…)
     · the sitemap and static pages              (node tools/build.js)

   No HTML file needs to be touched, ever.

   ------------------------------------------------------------------ FIELDS
   REQUIRED
     slug              url-safe id, must be unique — becomes ?slug=… and /games/<slug>/
     title             full game name
     tagline           one short line, shown under the title
     shortDescription  1–2 sentences for the card (keep under ~140 chars)
     status            'live' | 'beta' | 'coming-soon'
     category          'Puzzle', 'Casual', 'Arcade', 'Hyper-casual', …
     icon              square app icon, 512×512 recommended

   OPTIONAL (safe to omit — the UI adapts)
     featured          true → appears on the homepage featured row
     order             lower numbers sort first (default 100)
     playUrl           Google Play listing; required for status 'live'/'beta'
     packageId         com.example.game — shown on the detail page
     releaseDate       'YYYY-MM-DD' for live games, or expected date
     expected          free text for unreleased games, e.g. 'Q4 2026'
     rating            number 0–5      ratingCount  number of ratings
     downloads         '50K+'          size         '19 MB'
     androidMin        '6.0'
     accent            hex colour used for that game's badges and cover glow
     cover             wide 16:9 art for the detail hero
     video             YouTube ID for the trailer (omit to hide the section)
     screenshots       [{ src, alt, caption }]
     description       array of paragraphs for the detail page
     features          [{ icon, title, text }] — icon names in ICONS (js/templates.js)
     highlights        short bullet strings shown as chips
     privacyUrl        per-game privacy policy, defaults to the studio one
   ========================================================================== */

(function (root, factory) {
  var api = factory();
  /* Works both in the browser (window.GAMES) and in Node (tools/build.js). */
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { root.GAMES = api.GAMES; root.GameData = api; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var GAMES = [

    /* ====================================================================
       1 · MERGE 2248 NUMBER PUZZLE
       ==================================================================== */
    {
      slug: 'merge-2248-number-puzzle',
      title: 'Merge 2248 Number Puzzle',
      tagline: 'Drop. Merge. Chain it higher.',
      shortDescription:
        'Drop numbered tiles, merge matching pairs and set off chain reactions that clear half the board in one move.',
      status: 'live',
      featured: true,
      order: 10,
      category: 'Puzzle',
      accent: '#7C3AED',

      playUrl: 'https://play.google.com/store/apps/details?id=com.bhushangames.merge2248numberpuzzle',
      packageId: 'com.bhushangames.merge2248numberpuzzle',
      releaseDate: '2025-11-18',

      rating: 4.6,
      ratingCount: 3120,
      downloads: '50K+',
      size: '19 MB',
      androidMin: '6.0',

      icon: '/images/games/merge-2248/icon.svg',
      cover: '/images/games/merge-2248/cover.svg',
      video: '',

      highlights: ['Endless mode', 'Offline play', 'No level timers'],

      screenshots: [
        { src: '/images/games/merge-2248/shot-1.svg', alt: 'Merge 2248 board with numbered tiles stacked in seven columns', caption: 'Drop and merge' },
        { src: '/images/games/merge-2248/shot-2.svg', alt: 'A chain reaction merging four tiles into 2048', caption: 'Chain reactions' },
        { src: '/images/games/merge-2248/shot-3.svg', alt: 'High score screen showing a personal best of 184,200', caption: 'Beat your record' },
        { src: '/images/games/merge-2248/shot-4.svg', alt: 'Dark mode board with violet numbered tiles', caption: 'Dark mode' }
      ],

      description: [
        'Merge 2248 takes the number-merging idea everyone already understands and gives it gravity. Tiles drop into columns, matching neighbours fuse, and a single well-placed 8 can cascade through the whole board.',
        'There are no lives and no timers. You play until the board fills, then immediately want one more run — which is the entire point of a good arcade puzzle.',
        'The game runs fully offline, weighs under 20 MB and keeps a running history of every personal best so you can see the curve you are climbing.'
      ],

      features: [
        { icon: 'grid',    title: 'Chain merging',   text: 'Every merge can trigger the next. The best runs are the ones where you stop playing and just watch the board collapse.' },
        { icon: 'offline', title: 'Plays offline',   text: 'No connection needed at any point. Nothing loads mid-run, nothing interrupts a chain.' },
        { icon: 'trophy',  title: 'Endless scoring', text: 'One board, one score, no artificial end. Your best run is tracked and beaten, session after session.' },
        { icon: 'sparkle', title: 'Clean interface', text: 'Big readable numbers, honest colour coding and no menu you need to learn before your first drop.' }
      ]
    },

    /* ====================================================================
       2 · ARROWS – ESCAPE PUZZLE
       ==================================================================== */
    {
      slug: 'arrows-escape-puzzle',
      title: 'ARROWS – Escape Puzzle',
      tagline: 'Plan your move. Find your escape.',
      shortDescription:
        'A minimal escape puzzle with 500+ hand-designed levels. Tap an arrow, it slides until something stops it — clear the board without boxing yourself in.',
      status: 'coming-soon',
      featured: true,
      order: 20,
      category: 'Puzzle',
      accent: '#2563EB',

      playUrl: '',
      packageId: 'com.bhushangames.arrows',
      expected: 'Closed testing · public launch Q4 2026',

      size: '24 MB',
      androidMin: '6.0',

      icon: '/images/games/arrows/icon.svg',
      cover: '/images/games/arrows/cover.svg',
      video: '',

      highlights: ['500+ levels', 'Offline play', 'Brain training'],

      screenshots: [
        { src: '/images/games/arrows/shot-1.svg', alt: 'Chapter 1 level with blue arrow tiles on a five by five grid', caption: 'Chapter 1' },
        { src: '/images/games/arrows/shot-2.svg', alt: 'Mid-game board with a highlighted move preview', caption: 'Move preview' },
        { src: '/images/games/arrows/shot-3.svg', alt: 'Chapter select map showing twelve chapters', caption: 'Chapter map' },
        { src: '/images/games/arrows/shot-4.svg', alt: 'Level complete screen with three stars', caption: 'Perfect clear' }
      ],

      description: [
        'ARROWS takes one rule and pushes it as far as it will go. Tap an arrow and it slides in the direction it points until a wall or another tile stops it. That is the whole game — and by chapter nine it will hold you on a single board for twenty minutes.',
        'Every level is authored, solved and difficulty-rated by hand before it ships, so the ramp feels earned rather than generated. The board is deliberately quiet: generous whitespace, one accent colour, no currencies to decode.',
        'ARROWS is currently in closed testing. Join the list and we will send you a testing invite before the public launch.'
      ],

      features: [
        { icon: 'brain',   title: 'Brain training', text: 'Every board is a closed logic problem. You win by planning three moves ahead, not by tapping faster.' },
        { icon: 'offline', title: 'Offline play',   text: 'The complete level pack lives on your device. Flights, tunnels, dead zones — it never asks for a connection.' },
        { icon: 'check',   title: 'Easy to learn',  text: 'One rule, taught in eight seconds. No onboarding carousel, no menus, no tutorial video.' },
        { icon: 'star',    title: 'Hard to master', text: 'Difficulty ramps by design. The last chapters are built for players who want to earn the click.' }
      ]
    }

    /* ====================================================================
       ADD YOUR NEXT GAME HERE — copy an object above, change the values.
       Nothing else in the project needs to change.
       ==================================================================== */

  ];

  /* ---------------------------------------------------------------- utils --
     Small helpers shared by the browser runtime and the build script, so the
     two can never disagree about sorting, labels or lookups.
     ---------------------------------------------------------------------- */

  var STATUS = {
    'live':        { label: 'Live',        cta: 'Download',    tone: 'live' },
    'beta':        { label: 'Beta',        cta: 'Join Beta',   tone: 'beta' },
    'coming-soon': { label: 'Coming Soon', cta: 'Coming Soon', tone: 'soon' }
  };

  function statusInfo(game) {
    return STATUS[game && game.status] || STATUS['coming-soon'];
  }

  /** Catalogue order: featured first, then `order`, then title. */
  function sorted(list) {
    return (list || GAMES).slice().sort(function (a, b) {
      var fa = a.featured ? 0 : 1;
      var fb = b.featured ? 0 : 1;
      if (fa !== fb) { return fa - fb; }
      var oa = typeof a.order === 'number' ? a.order : 100;
      var ob = typeof b.order === 'number' ? b.order : 100;
      if (oa !== ob) { return oa - ob; }
      return a.title.localeCompare(b.title);
    });
  }

  function bySlug(slug) {
    for (var i = 0; i < GAMES.length; i++) {
      if (GAMES[i].slug === slug) { return GAMES[i]; }
    }
    return null;
  }

  function featured() {
    var list = sorted().filter(function (g) { return g.featured; });
    return list.length ? list : sorted().slice(0, 3);
  }

  function byStatus(status) {
    if (!status || status === 'all') { return sorted(); }
    return sorted().filter(function (g) { return g.status === status; });
  }

  /** Totals used by the animated counters on the homepage. */
  function stats() {
    var live = GAMES.filter(function (g) { return g.status === 'live'; });
    return {
      total: GAMES.length,
      live: live.length,
      upcoming: GAMES.length - live.length
    };
  }

  return {
    GAMES: GAMES,
    STATUS: STATUS,
    statusInfo: statusInfo,
    sorted: sorted,
    bySlug: bySlug,
    featured: featured,
    byStatus: byStatus,
    stats: stats
  };
}));
