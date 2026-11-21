/**
 * Nithinlabs static site smoke tests.
 * Run: node --test tests/site.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const REQUIRED_SERVICES = [
  'customer-retention',
  'brand-websites',
  'billing',
  'inventory',
  'payment-gateways',
  'ecommerce',
  'pos',
  'whatsapp-automation',
  'erp',
  'mobile-apps',
  'digital-marketing',
  'ai-chatbots',
  'booking',
  'accounting',
  'hr-payroll',
  'analytics',
  'cloud-hosting',
  'maintenance',
  'cybersecurity',
];

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'tests') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, files);
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function extractAttr(tag, attr) {
  const re = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i');
  const m = tag.match(re);
  return m ? m[1] : null;
}

function getInternalLinks(html, fromFile) {
  const links = [];
  const re = /(?:href|src)\s*=\s*["']([^"'#]+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith('http') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('data:') || raw.startsWith('//')) {
      continue;
    }
    links.push({ raw, fromFile });
  }
  return links;
}

function resolveLink(fromFile, href) {
  const fromDir = path.dirname(fromFile);
  const cleaned = href.split('?')[0].split('#')[0];
  if (!cleaned) return null;
  return path.normalize(path.join(fromDir, cleaned));
}

function navLinks(html, selectorHint) {
  const blockMatch = html.match(new RegExp(`<${selectorHint}[\\s\\S]*?</${selectorHint}>`, 'i'));
  if (!blockMatch) return null;
  const hrefs = [];
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(blockMatch[0]))) {
    const h = m[1];
    if (h.startsWith('http') || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('#')) continue;
    // Normalize to root-relative style for comparison
    const base = path.basename(h);
    const parent = path.basename(path.dirname(h));
    hrefs.push(parent === 'services' || h.includes('services/') ? `services/${base}` : base);
  }
  return hrefs;
}

describe('Nithinlabs site structure', () => {
  it('has required root pages', () => {
    for (const page of [
      'index.html',
      'services.html',
      'industries.html',
      'case-studies.html',
      'about.html',
      'contact.html',
      'privacy.html',
      'terms.html',
      '404.html',
    ]) {
      assert.ok(exists(page), `missing ${page}`);
    }
  });

  it('has design system assets', () => {
    assert.ok(exists('assets/css/styles.css'), 'missing styles.css');
    assert.ok(exists('assets/js/main.js'), 'missing main.js');
    assert.ok(exists('assets/img/logo-mark.png'), 'missing circuit flask logo-mark');
    assert.ok(exists('favicon.png'), 'missing favicon.png');
    assert.ok(exists('favicon.ico'), 'missing favicon.ico');
    assert.ok(exists('favicon.svg'), 'missing favicon.svg');
    assert.ok(exists('robots.txt'), 'missing robots.txt');
    assert.ok(exists('sitemap.xml'), 'missing sitemap.xml');
  });

  it('has a detail page for every required service', () => {
    for (const slug of REQUIRED_SERVICES) {
      assert.ok(exists(`services/${slug}.html`), `missing services/${slug}.html`);
    }
  });
});

describe('HTML document quality', () => {
  const htmlFiles = walkHtml(ROOT);

  it('finds HTML files', () => {
    assert.ok(htmlFiles.length >= 15, `expected many HTML files, found ${htmlFiles.length}`);
  });

  for (const file of htmlFiles) {
    const rel = path.relative(ROOT, file);

    it(`${rel}: lang, viewport, title, meta description, single h1`, () => {
      const html = fs.readFileSync(file, 'utf8');
      assert.match(html, /<html[^>]*\blang\s*=\s*["']en["']/i, 'missing lang=en');
      assert.match(html, /<meta[^>]+name\s*=\s*["']viewport["']/i, 'missing viewport');
      assert.match(html, /<title>[^<]+<\/title>/i, 'missing title');
      assert.match(
        html,
        /<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=\s*["'][^"']+["']/i,
        'missing meta description'
      );
      const h1s = html.match(/<h1[\s>]/gi) || [];
      assert.equal(h1s.length, 1, `expected exactly 1 h1, found ${h1s.length}`);
    });
  }
});

describe('Images and forms', () => {
  const htmlFiles = walkHtml(ROOT);

  it('every img has alt', () => {
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf8');
      const imgs = html.match(/<img\b[^>]*>/gi) || [];
      for (const img of imgs) {
        assert.match(img, /\balt\s*=\s*["'][^"']*["']/i, `img missing alt in ${path.relative(ROOT, file)}: ${img}`);
      }
    }
  });

  it('every form control has an associated label', () => {
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf8');
      const controls = html.match(/<(input|textarea|select)\b[^>]*>/gi) || [];
      for (const tag of controls) {
        if (/\btype\s*=\s*["']hidden["']/i.test(tag)) continue;
        if (/\btype\s*=\s*["']submit["']/i.test(tag)) continue;
        const id = extractAttr(tag, 'id');
        assert.ok(id, `control without id in ${path.relative(ROOT, file)}: ${tag}`);
        assert.ok(
          html.includes(`for="${id}"`) || html.includes(`for='${id}'`),
          `no label for="${id}" in ${path.relative(ROOT, file)}`
        );
      }
    }
  });
});

describe('Internal links resolve', () => {
  it('all href/src point to existing files', () => {
    const htmlFiles = walkHtml(ROOT);
    const missing = [];
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf8');
      for (const { raw } of getInternalLinks(html, file)) {
        const resolved = resolveLink(file, raw);
        if (!resolved) continue;
        if (!fs.existsSync(resolved)) {
          missing.push(`${path.relative(ROOT, file)} -> ${raw}`);
        }
      }
    }
    assert.deepEqual(missing, [], `broken links:\n${missing.join('\n')}`);
  });
});

describe('Navigation consistency', () => {
  it('header primary nav matches across top-level pages', () => {
    const pages = [
      'index.html',
      'services.html',
      'industries.html',
      'case-studies.html',
      'about.html',
      'contact.html',
    ];
    const baseline = navLinks(read(pages[0]), 'header');
    assert.ok(baseline && baseline.length >= 4, 'header nav too short on index');
    for (const page of pages.slice(1)) {
      const links = navLinks(read(page), 'header');
      assert.deepEqual(links, baseline, `header nav mismatch on ${page}`);
    }
  });

  it('footer nav presence is consistent on top-level pages', () => {
    for (const page of [
      'index.html',
      'services.html',
      'industries.html',
      'case-studies.html',
      'about.html',
      'contact.html',
      'privacy.html',
      'terms.html',
    ]) {
      const html = read(page);
      assert.match(html, /<footer[\s>]/i, `missing footer on ${page}`);
      assert.match(html, /href=["'][^"']*privacy\.html["']/i, `missing privacy link on ${page}`);
      assert.match(html, /href=["'][^"']*terms\.html["']/i, `missing terms link on ${page}`);
    }
  });
});

describe('Services catalogue linkage', () => {
  it('every service listed on services.html has a detail page', () => {
    const html = read('services.html');
    const re = /href\s*=\s*["']([^"']*services\/[^"']+\.html)["']/gi;
    const listed = new Set();
    let m;
    while ((m = re.exec(html))) {
      const href = m[1].replace(/^\.\//, '');
      listed.add(path.basename(href, '.html'));
    }
    assert.ok(listed.size >= REQUIRED_SERVICES.length, `expected >= ${REQUIRED_SERVICES.length} service links, found ${listed.size}`);
    for (const slug of REQUIRED_SERVICES) {
      assert.ok(listed.has(slug), `services.html does not link to ${slug}`);
      assert.ok(exists(`services/${slug}.html`), `detail page missing for ${slug}`);
    }
  });
});

describe('Interactive components', () => {
  it('home has a live sale demo with a run button and a live region', () => {
    const html = read('index.html');
    const demo = html.match(/<div[^>]+data-demo[\s>][\s\S]*?<!-- \/demo -->/i);
    assert.ok(demo, 'missing [data-demo] block (terminated by <!-- /demo -->)');
    assert.match(demo[0], /<button[^>]+data-demo-run/i, 'demo needs a run button');
    assert.match(demo[0], /aria-live\s*=\s*["']polite["']/i, 'demo needs an aria-live region');
    const steps = demo[0].match(/data-step[\s>]/gi) || [];
    assert.ok(steps.length >= 5, `demo needs >= 5 steps, found ${steps.length}`);
  });

  it('home service tabs are accessible and wired to existing panels', () => {
    const html = read('index.html');
    assert.match(html, /role\s*=\s*["']tablist["']/i, 'missing tablist');
    const tabs = html.match(/<button[^>]+role\s*=\s*["']tab["'][^>]*>/gi) || [];
    assert.ok(tabs.length >= 5, `expected >= 5 tabs, found ${tabs.length}`);
    for (const tab of tabs) {
      const controls = extractAttr(tab, 'aria-controls');
      assert.ok(controls, `tab without aria-controls: ${tab}`);
      assert.match(html, new RegExp(`id=["']${controls}["'][^>]*role=["']tabpanel["']|role=["']tabpanel["'][^>]*id=["']${controls}["']`), `no tabpanel #${controls}`);
    }
    const selected = tabs.filter((t) => /aria-selected\s*=\s*["']true["']/i.test(t));
    assert.equal(selected.length, 1, 'exactly one tab must be selected initially');
  });

  it('services page has a labelled live filter', () => {
    const html = read('services.html');
    assert.match(html, /<input[^>]+id=["']service-filter["']/i, 'missing #service-filter');
    assert.match(html, /for=["']service-filter["']/i, 'filter needs a label');
    assert.match(html, /data-filter-empty[^>]*aria-live|aria-live[^>]*data-filter-empty/i, 'filter needs an aria-live empty state');
  });

  it('contact page has a module picker with an estimate output', () => {
    const html = read('contact.html');
    const picker = html.match(/<fieldset[^>]+data-stack[\s\S]*?<\/fieldset>/i);
    assert.ok(picker, 'missing fieldset[data-stack]');
    const boxes = picker[0].match(/<input[^>]+type=["']checkbox["']/gi) || [];
    assert.ok(boxes.length >= 6, `expected >= 6 module checkboxes, found ${boxes.length}`);
    assert.match(html, /data-stack-estimate/i, 'missing estimate output');
  });

  it('uses real SVG icons instead of unicode glyph icons', () => {
    for (const file of walkHtml(ROOT)) {
      const html = fs.readFileSync(file, 'utf8');
      assert.doesNotMatch(html, /[◎◈▣⬡]/, `glyph icon found in ${path.relative(ROOT, file)}`);
    }
    for (const slug of REQUIRED_SERVICES) {
      assert.match(read(`services/${slug}.html`), /<svg[\s>]/i, `services/${slug}.html has no svg icon`);
    }
  });
});

describe('Brand, motion and tighter home', () => {
  it('header logo is the circuit flask mark on every page and favicon uses the brand PNG', () => {
    assert.ok(exists('assets/img/logo-mark.png'), 'missing assets/img/logo-mark.png');
    assert.ok(exists('favicon.png'), 'missing favicon.png');
    for (const file of walkHtml(ROOT)) {
      const html = fs.readFileSync(file, 'utf8');
      assert.match(
        html,
        /<a[^>]+class=["'][^"']*logo[^"']*["'][^>]*>[\s\S]*?data-logo=["']flask["']/i,
        `flask logo missing in ${path.relative(ROOT, file)}`
      );
      assert.match(
        html,
        /data-logo=["']flask["'][\s\S]*?<img[^>]+src=["'][^"']*logo-mark\.png(?:\?[^"']*)?["']/i,
        `circuit flask img missing in ${path.relative(ROOT, file)}`
      );
      assert.match(
        html,
        /rel=["']icon["'][^>]+href=["'][^"']*favicon\.(?:png|ico|svg)(?:\?[^"']*)?["']/i,
        `favicon link missing in ${path.relative(ROOT, file)}`
      );
    }
  });

  it('home has an accessible system hub with at least 5 nodes', () => {
    const html = read('index.html');
    assert.match(html, /data-hub[\s>]/i, 'missing [data-hub]');
    const hub = html.match(/<(?:svg|div)[^>]+data-hub[\s\S]*?<\/(?:svg|div)>/i);
    assert.ok(hub, 'could not extract hub markup');
    const nodes = hub[0].match(/data-node(?:[\s>=])/gi) || [];
    assert.ok(nodes.length >= 5, `expected >= 5 [data-node], found ${nodes.length}`);
    const named = hub[0].match(/data-node(?:=["'][^"']+["'])?[^>]*(?:aria-label|title)=["'][^"']+["']/gi) || [];
    assert.ok(named.length >= 5, 'each hub node needs an accessible name');
  });

  it('hero h1 has an aria-label matching the full headline', () => {
    const html = read('index.html');
    const h1 = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i);
    assert.ok(h1, 'missing h1');
    const label = extractAttr(h1[0], 'aria-label');
    assert.ok(label && label.trim().length > 0, 'hero h1 needs aria-label');
    const words = label.trim().split(/\s+/);
    assert.ok(words.length <= 6, `headline should be <= 6 words, got ${words.length}: "${label}"`);
  });

  it('home is lean: <= 8 sections, <= 4 FAQs, short hero sub-line', () => {
    const html = read('index.html');
    const main = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i);
    assert.ok(main, 'missing main');
    const sections = main[1].match(/<section\b/gi) || [];
    assert.ok(sections.length <= 8, `expected <= 8 sections in main, found ${sections.length}`);
    const faqs = main[1].match(/<details\b/gi) || [];
    assert.ok(faqs.length <= 4, `expected <= 4 FAQ details, found ${faqs.length}`);
    const sub = main[1].match(/class=["'][^"']*hero-sub[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
    assert.ok(sub, 'missing .hero-sub');
    const text = sub[1].replace(/<[^>]+>/g, '').trim();
    assert.ok(text.length <= 140, `hero sub-line too long (${text.length} chars)`);
  });

  it('every service page has a [data-visual] illustration', () => {
    for (const slug of REQUIRED_SERVICES) {
      assert.match(
        read(`services/${slug}.html`),
        /data-visual(?:[\s>=])/i,
        `services/${slug}.html missing [data-visual]`
      );
    }
  });

  it('has scroll progress and reduced-motion animation kill-switch', () => {
    assert.match(read('index.html'), /class=["'][^"']*scroll-progress[^"']*["']/i, 'missing .scroll-progress');
    const css = read('assets/css/styles.css');
    assert.match(css, /prefers-reduced-motion/i, 'styles.css needs prefers-reduced-motion');
    assert.match(
      css,
      /prefers-reduced-motion[\s\S]{0,400}animation[^;]*none|animation-duration:\s*0\.00?1ms/i,
      'reduced-motion should disable animations'
    );
  });
});

describe('nithinlabs.com visual adoption', () => {
  it('hero uses a mono kicker chip with pulse and no announce link', () => {
    const html = read('index.html');
    const hero = html.match(/<section[^>]+class=["'][^"']*hero[^"']*["'][\s\S]*?<\/section>/i);
    assert.ok(hero, 'missing hero section');
    assert.match(hero[0], /class=["'][^"']*hero-kicker[^"']*["']/i, 'missing .hero-kicker');
    assert.match(hero[0], /class=["'][^"']*pulse[^"']*["']/i, 'missing .pulse inside hero');
    assert.match(hero[0], /·/, 'kicker text should use · separators');
    assert.doesNotMatch(hero[0], /class=["'][^"']*announce[^"']*["']/i, '.announce should be removed from hero');
  });

  it('orbit hub keeps interactive data-hub wiring with orbit SVG geometry', () => {
    const html = read('index.html');
    assert.match(html, /data-hub[\s>]/i, 'missing [data-hub]');
    const hub = html.match(/<(?:div|svg)[^>]+data-hub[\s\S]*?<\/(?:div|svg)>/i);
    assert.ok(hub, 'could not extract hub markup');
    assert.match(hub[0], /<svg[^>]+class=["'][^"']*orbit-svg[^"']*["']/i, 'missing svg.orbit-svg');
    assert.match(hub[0], /role\s*=\s*["']img["']/i, 'orbit svg needs role=img');
    assert.match(hub[0], /aria-label\s*=\s*["'][^"']+["']/i, 'orbit svg needs aria-label');
    const orbits = hub[0].match(/class=["'][^"']*\borbit\b[^"']*["']/gi) || [];
    assert.ok(orbits.length >= 2, `expected >= 2 .orbit circles, found ${orbits.length}`);
    assert.match(hub[0], /class=["'][^"']*orbit-dash[^"']*["']/i, 'missing .orbit-dash');
    assert.match(hub[0], /class=["'][^"']*connector[^"']*["']/i, 'missing .connector');
    for (const id of ['billing', 'stock', 'payments', 'crm', 'website']) {
      assert.match(hub[0], new RegExp(`data-link=["']${id}["']`, 'i'), `missing data-link=${id}`);
      assert.match(hub[0], new RegExp(`data-node=["']${id}["']`, 'i'), `missing data-node=${id}`);
    }
    const named = hub[0].match(/data-node(?:=["'][^"']+["'])?[^>]*(?:aria-label|title)=["'][^"']+["']/gi) || [];
    assert.ok(named.length >= 5, 'each hub node needs an accessible name');
    // orbit-center + art-corners sit beside the svg inside [data-hub]; lazy hub extract ends at </svg>
    assert.match(html, /class=["'][^"']*orbit-center[^"']*["']/i, 'missing .orbit-center');
    assert.match(html, /FIG\.\s*02/i, 'missing FIG. 02 art-corner caption');
    assert.match(html, /SALE\s*→\s*STOCK|→/, 'missing flow caption with →');
  });

  it('industries list uses expertise rows with tags', () => {
    const html = read('index.html');
    const list = html.match(/<ul[^>]+class=["'][^"']*ind-list[^"']*["'][\s\S]*?<\/ul>/i);
    assert.ok(list, 'missing .ind-list');
    const rows = list[0].match(/class=["'][^"']*expertise-row[^"']*["']/gi) || [];
    assert.equal(rows.length, 8, `expected 8 .expertise-row links, found ${rows.length}`);
    const items = list[0].match(/<a[^>]+class=["'][^"']*expertise-row[^"']*["'][\s\S]*?<\/a>/gi) || [];
    assert.equal(items.length, 8, 'could not extract expertise-row anchors');
    for (const item of items) {
      assert.match(item, /class=["'][^"']*expertise-num[^"']*["']/i, 'row needs .expertise-num');
      const tags = item.match(/class=["'][^"']*\btag\b[^"']*["']/gi) || [];
      assert.ok(tags.length >= 2, `row needs >= 2 .tag chips, found ${tags.length}`);
      assert.match(item, /<svg[\s>]/i, 'row needs an arrow icon');
    }
  });

  it('proof stats use door cards with count-up values', () => {
    const html = read('index.html');
    const stats = html.match(/<div[^>]+class=["'][^"']*\bstats\b[^"']*["'][\s\S]*?(?=<p class=["']placeholder-note|<section|<\/div>\s*<\/section>)/i);
    assert.ok(stats, 'missing .stats block');
    const doors = stats[0].match(/class=["'][^"']*\bdoor\b[^"']*["']/gi) || [];
    assert.ok(doors.length >= 4, `expected >= 4 .door cards, found ${doors.length}`);
    const cards = stats[0].match(/<(?:div|a)[^>]+class=["'][^"']*\bdoor\b[^"']*["'][\s\S]*?<\/(?:div|a)>/gi) || [];
    assert.ok(cards.length >= 4, 'could not extract door cards');
    for (const card of cards.slice(0, 4)) {
      assert.match(card, /class=["'][^"']*door-label[^"']*["']/i, 'door needs .door-label');
      assert.match(card, /class=["'][^"']*door-value[^"']*["'][^>]*data-count=/i, 'door needs .door-value[data-count]');
    }
    assert.match(html, /class=["'][^"']*placeholder-note[^"']*["']/i, 'placeholder note must remain');
  });

  it('styles define blueprint tokens, grid, frames, and responsive/reduced-motion rules', () => {
    const css = read('assets/css/styles.css');
    assert.match(css, /--grid-line\s*:/i, 'missing --grid-line token');
    assert.match(css, /--violet\s*:/i, 'missing --violet token');
    assert.match(css, /\.blueprint\s*\{[^}]*linear-gradient/i, '.blueprint needs linear-gradient grid');
    assert.match(css, /\.frame::before|\.frame:before/i, 'missing .frame::before corner bracket');
    assert.match(css, /\.frame::after|\.frame:after/i, 'missing .frame::after corner bracket');
    assert.match(
      css,
      /prefers-reduced-motion[\s\S]{0,800}\.orbit-dash[\s\S]{0,200}animation[^;]*none|prefers-reduced-motion[\s\S]{0,800}\.pulse[\s\S]{0,200}animation[^;]*none/i,
      'reduced-motion should disable .orbit-dash or .pulse animations'
    );
    assert.match(
      css,
      /@media\s*\([^)]*max-width:\s*720px[^)]*\)[\s\S]{0,600}\.art-label/i,
      'need <=720px media query that targets .art-label'
    );
  });
});

describe('scroll interactions and mobile polish', () => {
  it('scroll.js exports progressFor and stepFor with clamped ranges', () => {
    const scrollPath = path.join(ROOT, 'assets/js/scroll.js');
    assert.ok(fs.existsSync(scrollPath), 'assets/js/scroll.js must exist');
    const { progressFor, stepFor } = require(scrollPath);
    assert.equal(typeof progressFor, 'function', 'progressFor export');
    assert.equal(typeof stepFor, 'function', 'stepFor export');

    // rect below viewport (top > viewportH) -> 0
    assert.equal(progressFor({ top: 900, height: 200 }, 800), 0);
    // rect above viewport (bottom < 0) -> 1
    assert.equal(progressFor({ top: -400, height: 200 }, 800), 1);
    // centered: mid of element at mid of viewport
    const centered = progressFor({ top: 300, height: 200 }, 800);
    assert.ok(centered > 0.4 && centered < 0.6, `expected ~0.5 when centered, got ${centered}`);
    assert.equal(progressFor({ top: -1000, height: 50 }, 800), 1);
    assert.equal(progressFor({ top: 2000, height: 50 }, 800), 0);

    assert.equal(stepFor(0, 5), 0);
    assert.equal(stepFor(0.99, 5), 4);
    assert.equal(stepFor(1, 5), 4);
    assert.equal(stepFor(0.5, 0), 0);
    assert.ok(!Number.isNaN(stepFor(0.5, 0)), 'stepFor must not return NaN when count is 0');
  });

  it('home has a scroll story with 5 steps matching hub nodes', () => {
    const html = read('index.html');
    assert.match(html, /data-story[\s>]/i, 'missing [data-story]');
    const steps = html.match(/data-story-step=["']([^"']+)["']/gi) || [];
    assert.equal(steps.length, 5, `expected exactly 5 [data-story-step], found ${steps.length}`);
    for (const id of ['billing', 'stock', 'payments', 'crm', 'website']) {
      assert.match(html, new RegExp(`data-story-step=["']${id}["']`, 'i'), `missing data-story-step=${id}`);
      assert.match(html, new RegExp(`data-node=["']${id}["']`, 'i'), `hub must keep data-node=${id}`);
    }
  });

  it('hero has data-scroll hooks and scroll.js loads before main.js', () => {
    const html = read('index.html');
    const hero = html.match(/<section[^>]+data-hero[\s\S]*?<\/section>/i);
    assert.ok(hero, 'missing [data-hero]');
    assert.match(hero[0], /data-scroll/i, 'hero needs [data-scroll] elements');
    const scrollIdx = html.indexOf('assets/js/scroll.js');
    const mainIdx = html.indexOf('assets/js/main.js');
    assert.ok(scrollIdx !== -1, 'scroll.js must be loaded');
    assert.ok(mainIdx !== -1, 'main.js must be loaded');
    assert.ok(scrollIdx < mainIdx, 'scroll.js must load before main.js');
    for (const page of ['services.html', 'contact.html', 'about.html']) {
      const pageHtml = read(page);
      const s = pageHtml.indexOf('assets/js/scroll.js');
      const m = pageHtml.indexOf('assets/js/main.js');
      assert.ok(s !== -1 && s < m, `${page}: scroll.js before main.js`);
    }
  });

  it('home has an accessible mobile CTA and contact page does not', () => {
    const home = read('index.html');
    assert.match(home, /class=["'][^"']*mobile-cta[^"']*["']/i, 'home needs .mobile-cta');
    assert.match(
      home,
      /class=["'][^"']*mobile-cta[^"']*["'][^>]*(?:aria-label|aria-labelledby)=["'][^"']+["']|(?:aria-label|aria-labelledby)=["'][^"']+["'][^>]*class=["'][^"']*mobile-cta/i,
      '.mobile-cta needs an accessible name'
    );
    assert.doesNotMatch(read('contact.html'), /class=["'][^"']*mobile-cta[^"']*["']/i, 'contact.html must not show mobile CTA');
  });

  it('flow card row is keyboard-scrollable with aria-label', () => {
    const html = read('index.html');
    assert.match(
      html,
      /(?:class=["'][^"']*flow-list[^"']*["'][^>]*tabindex=["']0["']|tabindex=["']0["'][^>]*class=["'][^"']*flow-list)/i,
      '.flow-list needs tabindex=0'
    );
    assert.match(
      html,
      /(?:class=["'][^"']*flow-list[^"']*["'][^>]*aria-label=["'][^"']+["']|aria-label=["'][^"']+["'][^>]*class=["'][^"']*flow-list)/i,
      '.flow-list needs aria-label'
    );
  });

  it('styles cover sticky story, snap rows, safe-area, header hide and reduced-motion scroll resets', () => {
    const css = read('assets/css/styles.css');
    assert.match(
      css,
      /@media\s*\([^)]*min-width:\s*960px[^)]*\)[\s\S]{0,1200}position:\s*sticky/i,
      'sticky story needs position:sticky inside >=960px media query'
    );
    assert.match(css, /scroll-snap-type/i, 'missing scroll-snap-type for mobile rows');
    assert.match(css, /env\(\s*safe-area-inset-bottom/i, 'mobile CTA needs safe-area-inset-bottom');
    assert.match(css, /\.site-header\.is-hidden|\.site-header\.is-hidden/i, 'missing .site-header.is-hidden');
    assert.match(
      css,
      /prefers-reduced-motion[\s\S]{0,1200}\[data-scroll\]|prefers-reduced-motion[\s\S]{0,1200}data-scroll/i,
      'reduced-motion should reset [data-scroll] transforms'
    );
    assert.match(
      css,
      /prefers-reduced-motion[\s\S]{0,1500}sticky|prefers-reduced-motion[\s\S]{0,1500}story/i,
      'reduced-motion should un-pin the story section'
    );
  });

  it('scroll.js and main.js use passive scroll listeners and honour reduced motion', () => {
    const scrollJs = read('assets/js/scroll.js');
    const mainJs = read('assets/js/main.js');
    assert.match(scrollJs, /prefers-reduced-motion/i, 'scroll.js must check prefers-reduced-motion');
    assert.match(scrollJs, /passive:\s*true/i, 'scroll.js scroll listeners must be passive');
    assert.match(mainJs, /passive:\s*true/i, 'main.js scroll listeners must be passive');
  });
});

describe('production polish', () => {
  const cssRule = (css, selector) => {
    const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = css.match(new RegExp(`(?:^|\\n)\\s*${esc}\\s*\\{([^}]*)\\}`));
    return m ? m[1] : null;
  };

  it('pinned story grid keeps container gutters (no width:100% override)', () => {
    const css = read('assets/css/styles.css');
    const rule = cssRule(css, '.story-pin .connected-grid');
    if (rule !== null) {
      assert.doesNotMatch(rule, /width:\s*100%/i, '.story-pin .connected-grid must not override .container width');
    }
    assert.match(
      read('index.html'),
      /class=["'][^"']*story-pin[^"']*["'][^>]*>\s*<div class=["'][^"']*\bcontainer\b[^"']*connected-grid/i,
      'story-pin must wrap a .container.connected-grid'
    );
  });

  it('only one story step is highlighted at a time', () => {
    const mainJs = read('assets/js/main.js');
    const css = read('assets/css/styles.css');
    const pulse = mainJs.match(/function pulseHub\([^)]*\)\s*\{[\s\S]*?\n  \}/);
    assert.ok(pulse, 'pulseHub not found');
    assert.doesNotMatch(pulse[0], /data-flow/, 'pulseHub must not touch flow items (they are driven by setStoryActive)');
    assert.doesNotMatch(mainJs, /addEventListener\(\s*['"]demo:step['"]/, 'hero demo must not drive the story diagram');
    assert.doesNotMatch(css, /\.flow-item\.is-hot/, 'flow items should only style is-active, not is-hot');
  });

  it('service tab list stays sticky (not overridden to position:relative with a top offset)', () => {
    const css = read('assets/css/styles.css');
    const topLevel = css.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*\s*\}/g, '');
    const rule = cssRule(topLevel, '.tab-list');
    assert.ok(rule, 'missing .tab-list base rule');
    assert.doesNotMatch(topLevel, /(?:^|\n)\.tab-list\s*\{[^}]*position:\s*relative/i, '.tab-list position:relative overrides the sticky rail');
  });

  it('industry rows use short, readable tag labels', () => {
    const html = read('index.html');
    const tags = [...html.matchAll(/<span class="tag">([^<]+)<\/span>/g)].map((m) => m[1]);
    assert.ok(tags.length >= 16, `expected tags on index, found ${tags.length}`);
    const long = tags.filter((t) => t.length > 12);
    assert.deepEqual(long, [], `tags longer than 12 chars:\n${long.join('\n')}`);
  });

  it('every kicker renders the same bar accent', () => {
    const css = read('assets/css/styles.css');
    const base = cssRule(css, '.kicker::before');
    assert.ok(base, 'missing base .kicker::before');
    const w = base.match(/width:\s*(\d+)px/);
    const h = base.match(/height:\s*(\d+)px/);
    assert.ok(w && +w[1] >= 16, 'base kicker accent should be a bar (width >= 16px)');
    assert.ok(h && +h[1] <= 3, 'base kicker accent should be a thin bar (height <= 3px)');
    assert.doesNotMatch(css, /\.kicker::before\s*\{[^}]*width:\s*6px/, 'no kicker should fall back to a 6px square');
  });

  it('stylesheet has no empty rules or dead selectors', () => {
    const css = read('assets/css/styles.css');
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const empty = noComments.match(/[^{}]+\{\s*\}/g) || [];
    assert.deepEqual(empty.map((s) => s.trim()), [], 'empty CSS rules found');
    assert.doesNotMatch(css, /:has\(\s*\+\s*\*\s*\)/, 'stray :has(+ *) selector');
    for (const dead of ['.announce', '.ind-row', '.ind-desc', '.ind-name', '.ind-num', '.ind-preview', '.stat-value', '.stat-label']) {
      assert.ok(!css.includes(dead), `dead selector ${dead} still in stylesheet`);
    }
    const stats = noComments.match(/(?:^|\n)\.stats\s*\{/g) || [];
    assert.equal(stats.length, 1, `.stats defined ${stats.length} times at top level`);
  });
});

describe('SEO files', () => {
  it('sitemap.xml lists every public HTML page', () => {
    const sitemap = read('sitemap.xml');
    const publicPages = walkHtml(ROOT)
      .map((f) => path.relative(ROOT, f).replace(/\\/g, '/'))
      .filter((p) => p !== '404.html');
    const missing = [];
    for (const page of publicPages) {
      const loc = page === 'index.html' ? '<loc>https://nithinlabs.tech/</loc>' : `/${page}</loc>`;
      if (!sitemap.includes(loc)) missing.push(page);
    }
    assert.deepEqual(missing, [], `sitemap missing:\n${missing.join('\n')}`);
  });

  it('robots.txt references sitemap', () => {
    const robots = read('robots.txt');
    assert.match(robots, /Sitemap:\s*https:\/\/nithinlabs\.tech\/sitemap\.xml/i);
  });
});

/**
 * Read JPEG SOF0/SOF2 dimensions from a buffer.
 * Returns { width, height } or null if not a valid JPEG with SOF.
 */
function jpegDimensions(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      i += 2;
      continue;
    }
    const len = (buf[i + 2] << 8) | buf[i + 3];
    // SOF0 (baseline) or SOF2 (progressive)
    if (marker === 0xc0 || marker === 0xc2) {
      const height = (buf[i + 5] << 8) | buf[i + 6];
      const width = (buf[i + 7] << 8) | buf[i + 8];
      return { width, height };
    }
    i += 2 + len;
  }
  return null;
}

function metaContent(html, propOrName) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)\\s*=\\s*["']${propOrName}["'][^>]+content\\s*=\\s*["']([^"']+)["']|<meta[^>]+content\\s*=\\s*["']([^"']+)["'][^>]+(?:property|name)\\s*=\\s*["']${propOrName}["']`,
    'i'
  );
  const m = html.match(re);
  return m ? m[1] || m[2] : null;
}

describe('Social link previews', () => {
  const SITE = 'https://nithinlabs.tech';
  const htmlFiles = walkHtml(ROOT);
  const MAX_OG_BYTES = 300 * 1024;

  it('every HTML page has complete Open Graph and Twitter image tags', () => {
    for (const file of htmlFiles) {
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      const html = fs.readFileSync(file, 'utf8');

      const ogImage = metaContent(html, 'og:image');
      const twImage = metaContent(html, 'twitter:image');
      const ogWidth = metaContent(html, 'og:image:width');
      const ogHeight = metaContent(html, 'og:image:height');
      const ogType = metaContent(html, 'og:image:type');
      const ogAlt = metaContent(html, 'og:image:alt');
      const ogLocale = metaContent(html, 'og:locale');

      assert.ok(ogImage, `${rel}: missing og:image`);
      assert.ok(ogImage.startsWith(`${SITE}/assets/og/`), `${rel}: og:image must be absolute under ${SITE}/assets/og/ — got ${ogImage}`);
      assert.ok(ogImage.endsWith('.jpg'), `${rel}: og:image must be .jpg — got ${ogImage}`);

      const localPath = ogImage.slice(`${SITE}/`.length);
      assert.ok(exists(localPath), `${rel}: og:image file missing on disk: ${localPath}`);

      assert.equal(twImage, ogImage, `${rel}: twitter:image must match og:image`);
      assert.equal(ogWidth, '1200', `${rel}: og:image:width must be 1200`);
      assert.equal(ogHeight, '630', `${rel}: og:image:height must be 630`);
      assert.equal(ogType, 'image/jpeg', `${rel}: og:image:type must be image/jpeg`);
      assert.ok(ogAlt && ogAlt.length > 0, `${rel}: missing og:image:alt`);
      assert.equal(ogLocale, 'en_IN', `${rel}: og:locale must be en_IN`);
    }
  });

  it('homepage uses home.jpg and title/description cover key services', () => {
    const html = read('index.html');
    const ogImage = metaContent(html, 'og:image');
    const ogTitle = metaContent(html, 'og:title');
    const ogDesc = metaContent(html, 'og:description');

    assert.equal(ogImage, `${SITE}/assets/og/home.jpg`);
    assert.match(ogTitle, /Billing/i);
    assert.match(ogTitle, /Brand Websites/i);
    assert.match(ogTitle, /Payments|Payment/i);
    assert.match(ogTitle, /Inventory/i);
    assert.match(ogDesc, /Billing/i);
    assert.match(ogDesc, /Brand Websites|website/i);
    assert.match(ogDesc, /Payments|payment/i);
    assert.match(ogDesc, /Inventory|stock/i);
  });

  it('each service page uses assets/og/<slug>.jpg', () => {
    for (const slug of REQUIRED_SERVICES) {
      const html = read(`services/${slug}.html`);
      const ogImage = metaContent(html, 'og:image');
      assert.equal(
        ogImage,
        `${SITE}/assets/og/${slug}.jpg`,
        `services/${slug}.html: expected og:image for ${slug}`
      );
    }
  });

  it('every OG JPEG is valid, 1200x630, and under 300 KB', () => {
    const ogDir = path.join(ROOT, 'assets', 'og');
    assert.ok(fs.existsSync(ogDir), 'assets/og directory missing');

    const expected = ['home.jpg', ...REQUIRED_SERVICES.map((s) => `${s}.jpg`)];
    for (const name of expected) {
      const full = path.join(ogDir, name);
      assert.ok(fs.existsSync(full), `missing ${name}`);
      const buf = fs.readFileSync(full);
      assert.ok(buf[0] === 0xff && buf[1] === 0xd8, `${name}: not a JPEG (bad magic bytes)`);
      assert.ok(buf.length < MAX_OG_BYTES, `${name}: ${(buf.length / 1024).toFixed(1)} KB exceeds 300 KB`);
      const dims = jpegDimensions(buf);
      assert.ok(dims, `${name}: could not read JPEG dimensions`);
      assert.equal(dims.width, 1200, `${name}: width ${dims.width} !== 1200`);
      assert.equal(dims.height, 630, `${name}: height ${dims.height} !== 630`);
    }
  });

  it('canonical, og:url, sitemap, robots and JSON-LD use nithinlabs.tech; no leftover .com URLs or emails', () => {
    for (const file of htmlFiles) {
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      const html = fs.readFileSync(file, 'utf8');
      const canonical = extractAttr(html.match(/<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i)?.[0] || '', 'href');
      const ogUrl = metaContent(html, 'og:url');
      assert.ok(canonical && canonical.startsWith(SITE), `${rel}: canonical must start with ${SITE}`);
      assert.ok(ogUrl && ogUrl.startsWith(SITE), `${rel}: og:url must start with ${SITE}`);
      assert.doesNotMatch(html, /nithinlabs\.com/i, `${rel}: still references nithinlabs.com`);
      assert.doesNotMatch(html, /@nithinlabs\.com/i, `${rel}: still uses @nithinlabs.com email`);
    }

    assert.match(read('sitemap.xml'), /https:\/\/nithinlabs\.tech\//);
    assert.doesNotMatch(read('sitemap.xml'), /nithinlabs\.com/);
    assert.match(read('robots.txt'), /https:\/\/nithinlabs\.tech\/sitemap\.xml/);

    const home = read('index.html');
    assert.match(home, /"url"\s*:\s*"https:\/\/nithinlabs\.tech"/);
    assert.match(home, /"email"\s*:\s*"hello@nithinlabs\.tech"/);

    // Source files that must not keep the old domain (exclude design-reference comments)
    const sources = [
      'scripts/generate-site.mjs',
      'assets/js/main.js',
      'robots.txt',
      'sitemap.xml',
    ];
    for (const src of sources) {
      const text = read(src);
      const withoutComments = text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
      assert.doesNotMatch(
        withoutComments,
        /https?:\/\/nithinlabs\.com|@nithinlabs\.com|['"]https:\/\/nithinlabs\.com['"]/,
        `${src}: still references nithinlabs.com outside comments`
      );
    }
  });
});

describe('Referral programme', () => {
  const REFERRAL_WA = /https:\/\/wa\.me\/918125611565/;

  it('has no dedicated refer page', () => {
    assert.equal(exists('refer.html'), false, 'refer.html should not exist');
  });

  it('home band, footer and contact open WhatsApp for referrals', () => {
    const home = read('index.html');
    assert.match(home, /data-referral-band/i, 'home needs [data-referral-band]');
    assert.match(
      home,
      /data-referral-band[\s\S]{0,1200}https:\/\/wa\.me\/918125611565/i,
      'referral band must open WhatsApp 8125611565'
    );
    const main = home.match(/<main\b[^>]*>([\s\S]*)<\/main>/i);
    assert.ok(main, 'missing main');
    const sections = main[1].match(/<section\b/gi) || [];
    assert.ok(sections.length <= 8, `home must stay <= 8 sections after referral band, found ${sections.length}`);

    for (const page of [
      'index.html',
      'services.html',
      'industries.html',
      'case-studies.html',
      'about.html',
      'contact.html',
      'privacy.html',
      'terms.html',
    ]) {
      const html = read(page);
      const footer = html.match(/<footer[\s\S]*?<\/footer>/i);
      assert.ok(footer, `missing footer on ${page}`);
      assert.match(footer[0], REFERRAL_WA, `footer referral must open WhatsApp on ${page}`);
      assert.match(footer[0], /Refer|&amp; earn|₹500/i, `footer needs refer & earn label on ${page}`);
    }

    const contact = read('contact.html');
    assert.match(contact, /class=["'][^"']*contact-refer[^"']*["'][^>]*href=["']https:\/\/wa\.me\/918125611565/i);
    assert.match(read('terms.html'), /[Rr]eferral/i, 'terms.html must mention the referral programme');
    assert.match(read('terms.html'), REFERRAL_WA, 'terms should point referrals to WhatsApp');

    const nav = navLinks(read('index.html'), 'header');
    assert.ok(nav && !nav.some((h) => h.includes('refer')), 'top nav must stay unchanged (no refer link)');
  });
});
