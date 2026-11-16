/**
 * Nithinlabs static site smoke tests.
 * Run: node --test tests/site.test.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

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
  it('header logo is a flask on every page and favicon uses the flask path', () => {
    for (const file of walkHtml(ROOT)) {
      const html = fs.readFileSync(file, 'utf8');
      assert.match(
        html,
        /<a[^>]+class=["'][^"']*logo[^"']*["'][^>]*>[\s\S]*?data-logo=["']flask["']/i,
        `flask logo missing in ${path.relative(ROOT, file)}`
      );
    }
    const favicon = read('favicon.svg');
    assert.match(favicon, /flask|M\s*\d+[\s\d.,\-]*L|path/i, 'favicon should contain flask geometry');
    assert.match(favicon, /<path[\s>]/i, 'favicon needs a path element');
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

describe('SEO files', () => {
  it('sitemap.xml lists every public HTML page', () => {
    const sitemap = read('sitemap.xml');
    const publicPages = walkHtml(ROOT)
      .map((f) => path.relative(ROOT, f).replace(/\\/g, '/'))
      .filter((p) => p !== '404.html');
    const missing = [];
    for (const page of publicPages) {
      const loc = page === 'index.html' ? '<loc>https://nithinlabs.com/</loc>' : `/${page}</loc>`;
      if (!sitemap.includes(loc)) missing.push(page);
    }
    assert.deepEqual(missing, [], `sitemap missing:\n${missing.join('\n')}`);
  });

  it('robots.txt references sitemap', () => {
    const robots = read('robots.txt');
    assert.match(robots, /Sitemap:/i);
  });
});
