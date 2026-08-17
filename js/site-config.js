/* ==========================================================================
   BHUSHAN GAMES · STUDIO CONFIGURATION
   --------------------------------------------------------------------------
   Studio-wide settings: identity, navigation, contact details and socials.
   The header and footer on every page are built from this file, so changing
   a link here changes it site-wide.

   To add a GAME, edit js/games-data.js instead — not this file.
   ========================================================================== */

(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  else { root.SITE = api; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    /* ---------------------------------------------------------- identity -- */
    name: 'Bhushan Games',
    legalName: 'Bhushan Games',            // replace with the registered entity
    tagline: 'Mobile games worth your attention.',
    description:
      'Bhushan Games is an independent mobile game studio building calm, offline-first puzzle and casual games for Android. Small team, hand-designed levels, no dark patterns.',
    founded: '2024',
    location: 'India',

    /* Change this once, before you deploy — it feeds canonicals, Open Graph
       URLs, the sitemap and the structured data on every page. */
    origin: 'https://bborse.github.io',

    /* ----------------------------------------------------------- contact -- */
    email: 'bhushanborse220@gmail.com',
    supportEmail: 'bhushanborse220@gmail.com',
    pressEmail: 'bhushanborse220@gmail.com',
    privacyEmail: 'bhushanborse220@gmail.com',
    playDeveloperUrl: 'https://play.google.com/store/apps/dev?id=0000000000000000000',

    /* -------------------------------------------------------- navigation -- */
    nav: [
      { label: 'Games',     href: '/games.html' },
      { label: 'About',     href: '/about.html' },
      { label: 'Portfolio', href: '/portfolio.html' },
      { label: 'Contact',   href: '/contact.html' }
    ],

    footerColumns: [
      {
        heading: 'Studio',
        links: [
          { label: 'About us',   href: '/about.html' },
          { label: 'Portfolio',  href: '/portfolio.html' },
          { label: 'Contact',    href: '/contact.html' },
          { label: 'Google Play', href: 'https://play.google.com/store/apps/dev?id=0000000000000000000', external: true }
        ]
      },
      {
        heading: 'Games',
        links: [
          { label: 'All games',    href: '/games.html' },
          { label: 'Live now',     href: '/games.html?filter=live' },
          { label: 'Coming soon',  href: '/games.html?filter=coming-soon' }
        ]
      },
      {
        heading: 'Legal',
        links: [
          { label: 'Privacy Policy',   href: '/privacy-policy.html' },
          { label: 'Terms of Service', href: '/terms.html' },
          { label: "Children's privacy", href: '/privacy-policy.html#children' }
        ]
      }
    ],

    /* ----------------------------------------------------------- socials -- */
    socials: [
      { label: 'Instagram', href: 'https://instagram.com/#', icon: 'instagram' },
      { label: 'Facebook',  href: 'https://facebook.com/#',  icon: 'facebook' },
      { label: 'Reddit',    href: 'https://reddit.com/r/#',  icon: 'reddit' },
      { label: 'YouTube',   href: 'https://youtube.com/#',  icon: 'youtube' },
      { label: 'GitHub',    href: 'https://github.com/#',    icon: 'github' }
    ],

    /* --------------------------------------------------------- portfolio --
       Shown on portfolio.html. Purely presentational — edit freely.          */
    milestones: [
      {
        year: '2024',
        title: 'Studio founded',
        text: 'Bhushan Games starts as a one-person studio with a simple rule: ship games we would actually keep installed.'
      },
      {
        year: '2025',
        title: 'First title on Google Play',
        text: 'Merge 2248 Number Puzzle launches and crosses its first 50,000 installs without a single paid ad.'
      },
      {
        year: '2026',
        title: 'ARROWS enters testing',
        text: '500+ hand-designed levels go into closed testing ahead of a public launch later in the year.'
      },
      {
        year: 'Next',
        title: 'More titles, same rules',
        text: 'Offline-first, no forced ads mid-level, no energy timers. The catalogue grows; the standard does not move.'
      }
    ],

    skills: [
      { icon: 'code',    title: 'Game development', text: 'Unity and native Android, built for low-end devices first — 60 fps on 2017 hardware is the baseline, not the goal.' },
      { icon: 'sparkle', title: 'Design & UX',      text: 'Minimal interfaces, readable typography and level design done by hand rather than generated.' },
      { icon: 'rocket',  title: 'Publishing',       text: 'Store listings, ASO, closed testing tracks, staged rollouts and release management on Google Play.' },
      { icon: 'shield',  title: 'Live operations',  text: 'Crash triage, monthly content updates and player support answered by the person who wrote the code.' }
    ],

    values: [
      { icon: 'offline', title: 'Offline first',        text: 'Our games work in airplane mode. If a game needs a connection to be fun, we have designed it wrong.' },
      { icon: 'shield',  title: 'No dark patterns',     text: 'No energy timers, no forced video to continue, no notification begging you back. Ever.' },
      { icon: 'brain',   title: 'Hand-made levels',     text: 'Procedural content is cheap and it feels cheap. Every level ships solved and difficulty-rated by a human.' },
      { icon: 'zap',     title: 'Small and fast',       text: 'Under 25 MB, instant cold starts, smooth on the phone you already own.' }
    ]
  };
}));
