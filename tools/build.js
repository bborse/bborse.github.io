#!/usr/bin/env node
/* ==========================================================================
   BHUSHAN GAMES · STATIC BUILD
   --------------------------------------------------------------------------
   Optional. The site works with zero build steps — /game.html?slug=<slug>
   renders any game at runtime. Run this when you want the SEO benefits of
   real per-game URLs:

       node tools/build.js

   It reads the SAME data and the SAME templates the browser uses, then writes:

       games/<slug>/index.html   fully rendered, correct <title>/OG/JSON-LD
       sitemap.xml               every page plus every game

   Re-run it after editing js/games-data.js. Nothing else changes.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const GameData  = require(path.join(ROOT, 'js/games-data.js'));
const SITE      = require(path.join(ROOT, 'js/site-config.js'));
const Templates = require(path.join(ROOT, 'js/templates.js'));

const OPTS = { pretty: true };
const today = new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------------- helpers */

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, contents) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents, 'utf8');
  console.log('  ✓', rel, `(${(Buffer.byteLength(contents) / 1024).toFixed(1)} KB)`);
}

/** Replace the content of a tag matched by a regex, keeping the tag itself. */
function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) {
    console.warn('  ! pattern not found:', regex);
    return html;
  }
  return html.replace(regex, replacement);
}

function setMeta(html, attr, name, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`, 'i');
  return html.replace(re, `$1${Templates.esc(value)}$2`);
}

/* ------------------------------------------------------------ game pages */

function buildGamePage(game, shell) {
  const st = Templates.status(game);
  const title = `${game.title} — ${st.short} | ${SITE.name}`;
  const desc = game.shortDescription;
  const url = SITE.origin + Templates.gameUrl(game, true);
  const image = SITE.origin + (game.cover || game.icon);

  let html = shell;

  /* --- head --- */
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${Templates.esc(title)}</title>`);
  html = setMeta(html, 'name', 'description', desc);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', desc);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', desc);
  html = setMeta(html, 'name', 'twitter:image', image);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/i, `$1${url}$2`);

  html = replaceTag(
    html,
    /<script type="application\/ld\+json" id="gameSchema">[\s\S]*?<\/script>/i,
    '<script type="application/ld+json" id="gameSchema">\n' +
      JSON.stringify(Templates.gameSchema(game, SITE, OPTS), null, 2) +
      '\n  </script>'
  );

  /* --- body --- */
  html = html.replace(
    /<body data-page="game">/i,
    `<body data-page="game" data-slug="${Templates.esc(game.slug)}" data-prerendered="true">`
  );

  html = replaceTag(
    html,
    /<div class="navbar__mount" id="siteHeader">[\s\S]*?<\/div>\s*<\/header>/i,
    `<div class="navbar__mount" id="siteHeader">${Templates.header(SITE, '/games.html')}</div>\n  </header>`
  );

  html = replaceTag(
    html,
    /<main id="main"><div id="gameDetail">[\s\S]*?<\/div><\/main>/i,
    `<main id="main"><div id="gameDetail">${Templates.gameDetail(game, SITE, OPTS)}</div></main>`
  );

  html = replaceTag(
    html,
    /<footer class="footer" id="siteFooter">[\s\S]*?<\/footer>/i,
    `<footer class="footer" id="siteFooter">${Templates.footer(SITE)}</footer>`
  );

  /* Relative asset paths stay root-absolute (/css/…, /js/…), so a page served
     from /games/<slug>/ still finds everything. Nothing to rewrite. */

  return html;
}

/* --------------------------------------------------------------- sitemap */

function buildSitemap() {
  const staticPages = [
    { loc: '/',                    priority: '1.0', freq: 'weekly' },
    { loc: '/games.html',          priority: '0.9', freq: 'weekly' },
    { loc: '/about.html',          priority: '0.7', freq: 'monthly' },
    { loc: '/portfolio.html',      priority: '0.7', freq: 'monthly' },
    { loc: '/contact.html',        priority: '0.6', freq: 'yearly' },
    { loc: '/privacy-policy.html', priority: '0.3', freq: 'yearly' },
    { loc: '/terms.html',          priority: '0.3', freq: 'yearly' }
  ];

  const urls = staticPages.map(p => `  <url>
    <loc>${SITE.origin}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);

  GameData.sorted().forEach(game => {
    urls.push(`  <url>
    <loc>${SITE.origin}${Templates.gameUrl(game, true)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${SITE.origin}${game.cover || game.icon}</image:loc>
      <image:title>${Templates.esc(game.title)}</image:title>
    </image:image>
  </url>`);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
}

/* ------------------------------------------------------------------- run */

function main() {
  const games = GameData.sorted();

  console.log(`\nBhushan Games — static build`);
  console.log(`  origin: ${SITE.origin}`);
  console.log(`  games:  ${games.length}\n`);

  const shell = read('game.html');

  games.forEach(game => {
    write(`games/${game.slug}/index.html`, buildGamePage(game, shell));
  });

  write('sitemap.xml', buildSitemap());

  console.log(`\nDone. ${games.length} game page(s) + sitemap.`);
  console.log('Deploy the whole folder; /games/<slug>/ now serves real HTML.\n');
}

main();
