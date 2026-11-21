/**
 * Static HTML generator for the Nithinlabs site.
 * Run: node scripts/generate-site.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE,
  BRAND,
  EMAIL,
  PHONE,
  PHONE_TEL,
  CITY,
  REFERRAL,
  ICON_PATHS,
  PILLARS,
  SERVICES,
} from './site-data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_VERSION = Date.now().toString(36);

function referralWhatsAppUrl() {
  const text = encodeURIComponent(
    `Hi Nithinlabs — I'd like to refer a client and claim ${REFERRAL.display}.`
  );
  return `https://wa.me/${REFERRAL.phoneTel}?text=${text}`;
}

function icon(name, cls = 'icon') {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

/** Circuit-flask brand mark (PNG, transparent) */
function flaskMark(sizeClass = '', depth = 0) {
  const src = `${rel(depth, 'assets/img/logo-mark.png')}?v=${ASSET_VERSION}`;
  return `<span class="logo-mark${sizeClass ? ' ' + sizeClass : ''}" data-logo="flask" aria-hidden="true">
    <img class="logo-img" src="${src}" width="44" height="44" alt="" decoding="async">
  </span>`;
}

function tippedFlask() {
  return `<svg class="tipped-flask" viewBox="0 0 120 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <g transform="rotate(-28 60 55)">
      <path d="M48 18h20M52 18v12L38 58a10 10 0 0 0 9 14h22a10 10 0 0 0 9-14L64 30V18"/>
      <path d="M42 55h32" opacity=".8"/>
      <circle cx="52" cy="48" r="1.8" fill="currentColor"/>
      <circle cx="62" cy="45" r="1.4" fill="currentColor" opacity=".8"/>
    </g>
    <path d="M78 72c6 4 14 6 22 4" opacity=".4"/>
    <circle cx="92" cy="78" r="2" fill="currentColor" opacity=".35"/>
    <circle cx="100" cy="82" r="1.4" fill="currentColor" opacity=".25"/>
  </svg>`;
}

const bySlug = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));

const TAG_LABELS = {
  'customer-retention': 'Retention',
  'whatsapp-automation': 'WhatsApp',
  'digital-marketing': 'Marketing',
  'ai-chatbots': 'AI support',
  'brand-websites': 'Website',
  ecommerce: 'E-commerce',
  pos: 'POS',
  booking: 'Booking',
  billing: 'Billing',
  'payment-gateways': 'Payments',
  accounting: 'Accounting',
  inventory: 'Inventory',
  erp: 'Custom ERP',
  'hr-payroll': 'Payroll',
  analytics: 'Analytics',
  'mobile-apps': 'Mobile app',
  'cloud-hosting': 'Hosting',
  maintenance: 'AMC',
  cybersecurity: 'Security',
};

const INDUSTRIES = [
  { id: 'retail', name: 'Retail & Kirana', short: 'POS · barcode · UPI', text: 'Counter billing, barcode stock, UPI and loyalty.', stack: ['pos', 'inventory', 'customer-retention'] },
  { id: 'restaurants', name: 'Restaurants & Cafés', short: 'Billing · menu · ordering', text: 'Fast billing, ingredient stock and WhatsApp updates.', stack: ['pos', 'ecommerce', 'whatsapp-automation'] },
  { id: 'pharma', name: 'Pharma & Medical', short: 'Batch · expiry · billing', text: 'Batch/expiry tracking and schedule-aware billing.', stack: ['inventory', 'billing', 'analytics'] },
  { id: 'clinics', name: 'Clinics & Diagnostics', short: 'Booking · reminders', text: 'Appointments, deposits and no-show reminders.', stack: ['booking', 'payment-gateways', 'whatsapp-automation'] },
  { id: 'salons', name: 'Salons & Wellness', short: 'Booking · packages', text: 'Staff calendars, packages and digital payments.', stack: ['booking', 'customer-retention', 'payment-gateways'] },
  { id: 'distributors', name: 'Distributors & Wholesale', short: 'Multi-godown · B2B', text: 'Multi-warehouse stock, B2B prices and dispatch docs.', stack: ['inventory', 'billing', 'accounting'] },
  { id: 'manufacturing', name: 'Manufacturing', short: 'Materials · dispatch', text: 'Materials, job visibility and invoice-ready dispatch.', stack: ['erp', 'inventory', 'billing'] },
  { id: 'education', name: 'Education & Coaching', short: 'Fees · admissions', text: 'Fee collection, admissions and parent updates.', stack: ['payment-gateways', 'customer-retention', 'brand-websites'] },
];

const rel = (depth, file) => (depth === 0 ? file : '../' + file);

function splitHeadline(text) {
  return text
    .split(/\s+/)
    .map((w) => `<span class="word" aria-hidden="true"><span>${w}</span></span>`)
    .join(' ');
}

function pillarVisual(key) {
  const visuals = {
    grow: `<div class="viz viz-grow" data-visual="grow" aria-hidden="true">
      <div class="viz-bubble"><span>+6 pts</span></div>
      <div class="viz-chat">Payment received. Thanks!</div>
    </div>`,
    sell: `<div class="viz viz-sell" data-visual="sell" aria-hidden="true">
      <div class="viz-drop d1"></div><div class="viz-drop d2"></div><div class="viz-drop d3"></div>
      <div class="viz-cart">${icon('cart')}</div>
    </div>`,
    money: `<div class="viz viz-money" data-visual="money" aria-hidden="true">
      <div class="viz-invoice"><i></i><i></i><i></i><i></i></div>
      <div class="viz-tick">${icon('check')}</div>
    </div>`,
    operate: `<div class="viz viz-operate" data-visual="operate" aria-hidden="true">
      <span style="--h:22px"></span><span style="--h:38px"></span><span style="--h:28px"></span><span style="--h:44px"></span><span style="--h:24px"></span>
    </div>`,
    build: `<div class="viz viz-build" data-visual="build" aria-hidden="true">
      <div class="viz-phone"></div>
      <div class="viz-server"><i></i><i></i><i></i></div>
      <svg class="viz-pulse" viewBox="0 0 80 24" preserveAspectRatio="none"><path d="M0 12h18l4-8 6 16 5-10 4 2h43" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    </div>`,
  };
  return visuals[key] || '';
}

function systemHub() {
  // Orbit geometry matches live nithinlabs.com (viewBox 550×570, centre 275,285)
  const cx = 275;
  const cy = 285;
  const nodes = [
    { id: 'billing', label: 'Billing', tip: 'Invoice on every sale', nx: 275, ny: 88, lx: 230, ly: 28, violet: false },
    { id: 'stock', label: 'Stock', tip: 'Inventory adjusts live', nx: 472, ny: 285, lx: 460, ly: 268, violet: true },
    { id: 'payments', label: 'Payments', tip: 'UPI settles and reconciles', nx: 275, ny: 482, lx: 220, ly: 500, violet: false },
    { id: 'crm', label: 'CRM', tip: 'Loyalty and follow-ups fire', nx: 78, ny: 285, lx: 8, ly: 268, violet: true },
    { id: 'website', label: 'Website', tip: 'Orders land in the same stack', nx: 413, ny: 146, lx: 390, ly: 98, violet: true },
  ];
  return `<div class="hub orbit-hub frame" data-hub>
    <span class="art-corner top">FIG. 02 / CONNECTED STACK</span>
    <div class="orbit-stage">
    <svg class="orbit-svg hub-svg" viewBox="0 0 550 570" role="img" aria-label="Connected system: billing, stock, payments, CRM and website around Nithinlabs">
      <circle cx="${cx}" cy="${cy}" r="196" class="orbit"/>
      <circle cx="${cx}" cy="${cy}" r="142" class="orbit-dash"/>
      <circle cx="${cx}" cy="${cy}" r="98" class="orbit"/>
      <path d="M275 88V187 M472 285H373 M275 482V383 M78 285H177" class="connector"/>
      <path d="M136 146L207 217 M413 146L343 217 M413 424L343 353 M136 424L207 353" class="connector"/>
      <circle cx="275" cy="88" r="7" class="node" data-orbit-node="billing"/>
      <circle cx="472" cy="285" r="7" class="node-violet" data-orbit-node="stock"/>
      <circle cx="275" cy="482" r="7" class="node" data-orbit-node="payments"/>
      <circle cx="78" cy="285" r="7" class="node-violet" data-orbit-node="crm"/>
      <circle cx="136" cy="146" r="4" class="node"/>
      <circle cx="413" cy="146" r="4" class="node-violet" data-orbit-node="website"/>
      <circle cx="413" cy="424" r="4" class="node"/>
      <circle cx="136" cy="424" r="4" class="node-violet"/>
      <path d="M260 48h30 M275 33v30 M491 271v28 M58 271v28 M260 522h30" class="connector"/>
      ${nodes
        .map(
          (n) =>
            `<line class="hub-link connector" data-link="${n.id}" x1="${cx}" y1="${cy}" x2="${n.nx}" y2="${n.ny}" />`
        )
        .join('\n      ')}
      ${nodes
        .map(
          (n) => `<g class="hub-node" data-node="${n.id}" tabindex="0" aria-label="${n.label}: ${n.tip}" transform="translate(${n.lx}, ${n.ly})">
        <title>${n.label}: ${n.tip}</title>
        <rect width="90" height="34" rx="6" />
        <text x="45" y="22" text-anchor="middle">${n.label}</text>
      </g>`
        )
        .join('\n      ')}
    </svg>
    <div class="orbit-center">
      ${flaskMark()}
      <span class="caption">nithinlabs / core</span>
    </div>
    </div>
    <div class="orbit-foot">
      <span class="art-corner bottom">SALE → STOCK → INVOICE → PAYMENT</span>
      <p class="hub-tip" data-hub-tip>Hover a node — or ring up a sale above.</p>
    </div>
  </div>`;
}

function head({ title, description, depth = 0, pagePath, ogImage = 'home', ogAlt }) {
  const canonical = `${SITE}/${pagePath === 'index.html' ? '' : pagePath}`;
  const imageUrl = `${SITE}/assets/og/${ogImage}.jpg`;
  const imageAlt =
    ogAlt ||
    (ogImage === 'home'
      ? `${BRAND} services: Billing, Brand Websites, Payments, Inventory, Retention`
      : title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#fafaf8">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:locale" content="en_IN">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${imageAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="icon" href="${rel(depth, 'favicon.ico')}?v=${ASSET_VERSION}" sizes="any">
  <link rel="icon" href="${rel(depth, 'favicon.png')}?v=${ASSET_VERSION}" type="image/png" sizes="32x32">
  <link rel="icon" href="${rel(depth, 'favicon.svg')}?v=${ASSET_VERSION}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${rel(depth, 'assets/img/apple-touch-icon.png')}?v=${ASSET_VERSION}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${rel(depth, 'assets/css/styles.css')}?v=${ASSET_VERSION}">
  <script>document.documentElement.classList.add('js')</script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="scroll-progress" aria-hidden="true"></div>`;
}

function header(depth, current) {
  const l = (f) => rel(depth, f);
  const cur = (k) => (current === k ? ' aria-current="page"' : '');
  return `
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="${l('index.html')}" aria-label="${BRAND} home">
        ${flaskMark('', depth)}
        <span class="logo-word">${BRAND}</span>
      </a>
      <nav class="nav" aria-label="Primary">
        <a href="${l('services.html')}"${cur('services')}>Services</a>
        <a href="${l('industries.html')}"${cur('industries')}>Industries</a>
        <a href="${l('case-studies.html')}"${cur('case-studies')}>Work</a>
        <a href="${l('about.html')}"${cur('about')}>About</a>
        <a href="${l('contact.html')}"${cur('contact')}>Contact</a>
      </nav>
      <a class="btn btn-primary header-cta" data-magnetic href="${l('contact.html')}">Book a call ${icon('arrow')}</a>
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;
}

function footer(depth, { extraScripts = [] } = {}) {
  const l = (f) => rel(depth, f);
  const scripts = [
    `<script src="${rel(depth, 'assets/js/scroll.js')}?v=${ASSET_VERSION}" defer></script>`,
    ...extraScripts.map(
      (src) => `<script src="${rel(depth, src)}?v=${ASSET_VERSION}" defer></script>`
    ),
    `<script src="${rel(depth, 'assets/js/main.js')}?v=${ASSET_VERSION}" defer></script>`,
  ].join('\n  ');
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="logo" href="${l('index.html')}">
            ${flaskMark('', depth)}
            <span class="logo-word">${BRAND}</span>
          </a>
          <p>Billing, stock, payments and websites — wired together for Indian SMBs.</p>
        </div>
        <div class="footer-col">
          <h4>Services</h4>
          <a href="${l('services/billing.html')}">Billing</a>
          <a href="${l('services/inventory.html')}">Inventory</a>
          <a href="${l('services/payment-gateways.html')}">Payment Gateways</a>
          <a href="${l('services/brand-websites.html')}">Brand Websites</a>
          <a href="${l('services/customer-retention.html')}">Customer Retention</a>
          <a href="${l('services.html')}">All 19 services</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="${l('about.html')}">About</a>
          <a href="${l('industries.html')}">Industries</a>
          <a href="${l('case-studies.html')}">Work</a>
          <a href="${l('contact.html')}">Contact</a>
          <a href="${referralWhatsAppUrl()}" target="_blank" rel="noopener noreferrer">Refer &amp; earn ${REFERRAL.display}</a>
        </div>
        <div class="footer-col">
          <h4>Get in touch</h4>
          <a href="mailto:${EMAIL}">${EMAIL}</a>
          <a href="tel:${PHONE_TEL}">${PHONE}</a>
          <a href="https://wa.me/${PHONE_TEL.slice(1)}">WhatsApp us</a>
          <a href="${l('contact.html')}">${CITY}</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${BRAND}. Made in India.</span>
        <nav aria-label="Legal">
          <a href="${l('privacy.html')}">Privacy</a>
          <a href="${l('terms.html')}">Terms</a>
        </nav>
      </div>
    </div>
    <p class="wordmark" aria-hidden="true">nithinlabs</p>
  </footer>
  ${scripts}
</body>
</html>
`;
}

function referralBand() {
  return `
    <section class="band-ink referral-band" data-section data-referral-band>
      <div class="container referral-band-inner" data-reveal>
        <div class="referral-band-copy">
          <span class="kicker">Refer &amp; earn</span>
          <h2>Know a business that needs this?</h2>
          <p>Introduce them to Nithinlabs. When they become a paying client, you earn ${REFERRAL.display} — paid via ${REFERRAL.payoutShort}. Message us on WhatsApp to claim it.</p>
        </div>
        <div class="referral-band-aside">
          <div class="reward-card reward-card-ink frame" aria-hidden="true">
            <span class="door-label">REWARD</span>
            <div class="door-value" data-count="${REFERRAL.amount}" data-prefix="₹">${REFERRAL.display}</div>
            <span class="door-caption">Per paying client</span>
          </div>
          <a class="btn btn-light" data-magnetic href="${referralWhatsAppUrl()}" target="_blank" rel="noopener noreferrer">Refer on WhatsApp ${icon('message')}</a>
        </div>
      </div>
    </section>`;
}

function mobileCta(depth) {
  const l = (f) => rel(depth, f);
  return `
  <aside class="mobile-cta" aria-label="Quick contact" data-mobile-cta hidden>
    <a class="mobile-cta-call" href="${l('contact.html')}">Book a free call</a>
    <a class="mobile-cta-wa" href="https://wa.me/${PHONE_TEL.slice(1)}" aria-label="WhatsApp us" target="_blank" rel="noopener noreferrer">${icon('message')}</a>
  </aside>`;
}

function pageHero({ depth, crumbs, kicker, title, lead, extra = '' }) {
  const l = (f) => rel(depth, f);
  const trail = [`<a href="${l('index.html')}">Home</a>`]
    .concat(crumbs.map((c) => (c.href ? `<a href="${l(c.href)}">${c.label}</a>` : `<span>${c.label}</span>`)))
    .join(' <span aria-hidden="true">/</span> ');
  return `
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">${trail}</nav>
        ${kicker ? `<span class="kicker">${kicker}</span>` : ''}
        <h1${kicker ? ' style="margin-top:1rem"' : ''}>${title}</h1>
        ${lead ? `<p class="lead">${lead}</p>` : ''}
        ${extra}
      </div>
    </section>`;
}

function ctaBlock(depth) {
  const l = (f) => rel(depth, f);
  return `
    <section class="section">
      <div class="container">
        <div class="cta" data-reveal>
          <div>
            <h2>Ready to wire it up?</h2>
            <p>30 minutes. We map billing, stock and payments — then a fixed quote.</p>
            <ol class="cta-steps" aria-label="How we work">
              <li><span>1</span>Discover</li>
              <li><span>2</span>Scope</li>
              <li><span>3</span>Build</li>
              <li><span>4</span>Launch</li>
              <li><span>5</span>Run</li>
            </ol>
          </div>
          <div class="btn-row">
            <a class="btn btn-light" data-magnetic href="${l('contact.html')}">Book a free call ${icon('arrow')}</a>
            <a class="btn btn-ghost-light" href="https://wa.me/${PHONE_TEL.slice(1)}">WhatsApp</a>
          </div>
        </div>
      </div>
    </section>`;
}

function svcRow(s, depth, extraAttrs = '') {
  const href = depth === 0 ? `services/${s.slug}.html` : `${s.slug}.html`;
  return `<a class="svc-row" href="${href}"${extraAttrs}>
            <span class="icon-box">${icon(s.icon)}</span>
            <div><h3>${s.name}</h3><p>${s.short}</p></div>
            ${icon('arrowUpRight', 'icon svc-arrow')}
          </a>`;
}

const orgJsonLd = `
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    name: BRAND,
    url: SITE,
    email: EMAIL,
    telephone: PHONE,
    address: { '@type': 'PostalAddress', addressLocality: 'Hyderabad', addressRegion: 'Telangana', addressCountry: 'IN' },
    areaServed: 'IN',
    description: 'IT solutions for Indian SMBs: billing, inventory, payment gateways, brand websites and customer retention.',
  })}</script>`;

const pages = [];
function write(file, html) {
  const full = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  if (file !== '404.html') pages.push(file);
}

const PARTNERS = ['Razorpay', 'Cashfree', 'PhonePe', 'PayU', 'Tally', 'WhatsApp', 'Google', 'Shopify', 'AWS', 'Zoho'];
const marqueeGroup = (hidden) =>
  `<div class="marquee-group"${hidden ? ' aria-hidden="true"' : ''}>${PARTNERS.map((p) => `<span class="marquee-item">${p}</span>`).join('')}</div>`;

const demoSteps = [
  ['Sale recorded', 'Waiting', 'billing'],
  ['Stock updated', '', 'stock'],
  ['Invoice generated', '', 'billing'],
  ['Payment received', '', 'payments'],
  ['Customer notified', '', 'crm'],
];

const HEADLINE = 'Your business, wired together.';

/* ---------- Home ---------- */
write(
  'index.html',
  head({
    title: BRAND + ' | Billing, Brand Websites, Payments and Inventory for SMBs',
    description: `${BRAND} builds Billing, Brand Websites, Payments, Inventory and Retention systems for Indian SMBs — one connected stack.`,
    pagePath: 'index.html',
    ogImage: 'home',
  }) +
    header(0, 'home') +
    `
  <main id="main">
    <section class="hero blueprint" data-hero data-scroll data-scroll-parallax="0.15">
      <div class="container hero-grid">
        <div data-scroll data-scroll-lift>
          <div class="hero-kicker"><span class="pulse" aria-hidden="true"></span> BILLING · PAYMENTS · RETENTION</div>
          <h1 aria-label="${HEADLINE}">${splitHeadline(HEADLINE)}</h1>
          <p class="hero-sub">Billing, stock, UPI payments and retention — built and run as one stack.</p>
          <div class="btn-row">
            <a class="btn btn-primary" data-magnetic href="contact.html">Book a free call ${icon('arrow')}</a>
            <a class="btn btn-outline" href="services.html">All services</a>
          </div>
          <ul class="hero-points">
            <li>${icon('check')} Invoices &amp; compliance</li>
            <li>${icon('check')} UPI gateways</li>
            <li>${icon('check')} Fixed-price scopes</li>
          </ul>
        </div>

        <div class="demo" data-demo data-reveal data-scroll data-scroll-lift>
          <div class="demo-top">
            ${flaskMark('logo-mark-sm')}
            <span>Nithinlabs Lab · Counter 01</span>
            <span class="demo-badge">Live</span>
          </div>
          <div class="demo-body">
            <div class="demo-metrics">
              <div><span class="m-label">Stock</span><span class="m-value" data-demo-stock>24</span></div>
              <div><span class="m-label">Sales</span><span class="m-value" data-demo-sales>₹18,420</span></div>
              <div><span class="m-label">Invoices</span><span class="m-value" data-demo-invoices>41</span></div>
            </div>
            <div class="demo-item">
              <div><strong>Basmati Rice · 5 kg</strong><span>SKU 1006 · Tax 5%</span></div>
              <span class="demo-price">₹649</span>
            </div>
            <ol class="demo-log">
              ${demoSteps
                .map(
                  ([label, value, node]) =>
                    `<li data-step data-hub-target="${node}"><span class="log-icon">${icon('check')}</span><span class="log-label">${label}</span><span class="log-value" data-v>${value}</span></li>`
                )
                .join('\n              ')}
            </ol>
            <button class="btn btn-primary demo-run" type="button" data-demo-run data-magnetic><span>Ring up a sale</span> ${icon('arrow')}</button>
            <p class="demo-note">One sale. Five systems. Sample data.</p>
            <p class="sr-only" aria-live="polite" data-demo-status></p>
          </div>
        </div><!-- /demo -->
      </div>
    </section>

    <div class="logos">
      <div class="container logos-inner">
        <span class="logos-label">Integrates with</span>
        <div class="marquee">
          <div class="marquee-track">${marqueeGroup(false)}${marqueeGroup(true)}</div>
        </div>
      </div>
    </div>

    <section class="section" id="services" data-section>
      <div class="container">
        <div class="sec-head" data-reveal>
          <span class="kicker">01 / Services</span>
          <h2>Nineteen services. Five jobs.</h2>
          <p>Start with what hurts most. Add the rest later — same data.</p>
        </div>
        <div class="tabs" data-tabs>
          <div class="tab-list" role="tablist" aria-label="Service groups">
            <span class="tab-indicator" aria-hidden="true"></span>
            ${PILLARS.map(
              (p, i) => `<button class="tab" type="button" role="tab" id="tab-${p.key}" aria-controls="panel-${p.key}" aria-selected="${i === 0}"${i === 0 ? '' : ' tabindex="-1"'}>
              <span class="tab-num">${p.num}</span><span class="tab-title">${p.title}</span><span class="tab-desc">${p.blurb}</span>
            </button>`
            ).join('\n            ')}
          </div>
          <div>
            ${PILLARS.map(
              (p, i) => `<div class="tab-panel" id="panel-${p.key}" role="tabpanel" aria-labelledby="tab-${p.key}"${i === 0 ? '' : ' hidden'}>
              <div class="tab-visual">${pillarVisual(p.key)}</div>
              <div class="svc-grid">
          ${SERVICES.filter((s) => s.pillar === p.key)
            .map((s) => svcRow(s, 0))
            .join('\n          ')}
              </div>
            </div>`
            ).join('\n            ')}
          </div>
        </div>
      </div>
    </section>

    <section class="section blueprint story-section" data-section data-story data-scroll data-scroll-steps="5">
      <div class="story-pin">
        <div class="container connected-grid">
          <div class="connected-visual" data-reveal>${systemHub()}</div>
          <div class="connected-copy" data-reveal>
            <span class="kicker">02 / Connected</span>
            <h2>One sale updates everything.</h2>
            <p class="connected-lead">No re-typing between tools. Every module reads and writes the same data, so a single sale moves through your whole business in seconds.</p>
            <ol class="flow-list" tabindex="0" aria-label="How one sale updates the connected stack">
              ${[
                ['billing', 'Billing', 'Invoice is generated the moment the sale closes.'],
                ['stock', 'Stock', 'Inventory drops live across every counter and branch.'],
                ['payments', 'Payments', 'UPI or card settles and reconciles automatically.'],
                ['crm', 'CRM', 'Loyalty points and follow-ups fire on their own.'],
                ['website', 'Website', 'Online orders land in the same stack, same stock.'],
              ]
                .map(
                  ([id, title, text], i) => `<li class="flow-item" data-flow="${id}" data-story-step="${id}">
                <span class="flow-num">${String(i + 1).padStart(2, '0')}</span>
                <div><strong>${title}</strong><p>${text}</p></div>
              </li>`
                )
                .join('\n              ')}
            </ol>
            <div class="flow-dots" aria-hidden="true" data-flow-dots>
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <div class="orbit-labels">
              <span class="art-label"><i></i>SECURE BY DESIGN</span>
              <span class="art-label violet"><i></i>ONE DATA LAYER</span>
              <span class="art-label violet"><i></i>FULL STACK</span>
              <span class="art-label"><i></i>BUILT TO BE USEFUL</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" data-section>
      <div class="container">
        <div class="sec-head" data-reveal>
          <span class="kicker">03 / Industries</span>
          <h2>Who we build for.</h2>
          <p>Same blocks. Configured for your trade.</p>
        </div>
        <ul class="ind-list" data-reveal>
          ${INDUSTRIES.map((ind, i) => {
            const tags = ind.stack.map((slug) => TAG_LABELS[slug] || bySlug[slug].name.split('&')[0].trim());
            return `<li>
            <a class="expertise-row" href="industries.html#${ind.id}">
              <span class="expertise-num">${String(i + 1).padStart(2, '0')}</span>
              <span class="expertise-title">${ind.name}</span>
              <span class="expertise-desc">${ind.short}</span>
              <span class="tag-list">${tags.map((t) => `<span class="tag">${t}</span>`).join('')}</span>
              ${icon('arrow')}
            </a>
          </li>`;
          }).join('\n          ')}
        </ul>
      </div>
    </section>

    <section class="band-ink" data-section>
      <div class="container">
        <div class="sec-head" data-reveal>
          <span class="kicker">04 / Proof</span>
          <h2>Numbers we'll stand behind.</h2>
          <p>Replace with verified figures before launch.</p>
        </div>
        <!-- PLACEHOLDER: replace stats with verified data before publishing -->
        <div class="stats" data-reveal>
          <div class="door frame">
            <span class="door-label">PROJECTS</span>
            <div class="door-value" data-count="50" data-suffix="+">50+</div>
            <span class="door-caption">Shipped for SMBs* ${icon('arrow')}</span>
            <svg class="spark" viewBox="0 0 80 24" aria-hidden="true"><path d="M0 18 12 14 24 16 36 8 48 12 60 4 80 10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </div>
          <div class="door frame">
            <span class="door-label">INDUSTRIES</span>
            <div class="door-value" data-count="15" data-suffix="+">15+</div>
            <span class="door-caption">Configured stacks* ${icon('arrow')}</span>
            <svg class="spark" viewBox="0 0 80 24" aria-hidden="true"><path d="M0 16 16 12 32 14 48 6 64 10 80 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </div>
          <div class="door frame">
            <span class="door-label">ON-TIME</span>
            <div class="door-value" data-count="98" data-suffix="%">98%</div>
            <span class="door-caption">Delivery record* ${icon('arrow')}</span>
            <svg class="spark" viewBox="0 0 80 24" aria-hidden="true"><path d="M0 20 20 18 40 10 60 8 80 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </div>
          <div class="door frame">
            <span class="door-label">AMC RESPONSE</span>
            <div class="door-value" data-count="4" data-suffix="h">4h</div>
            <span class="door-caption">Support SLA* ${icon('arrow')}</span>
            <svg class="spark" viewBox="0 0 80 24" aria-hidden="true"><path d="M0 12 16 10 32 14 48 6 64 8 80 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
          </div>
        </div>
        <p class="placeholder-note">* Placeholder metrics.</p>
      </div>
    </section>
` +
    referralBand() +
    `
    <section class="section" data-section>
      <div class="container faq-wrap">
        <div class="faq-aside" data-reveal>
          <span class="kicker">05 / FAQ</span>
          <h2 style="margin-top:1rem">Quick answers.</h2>
          <p>Something else? Ask us.</p>
          <a class="link-arrow" href="contact.html">Ask a question ${icon('arrow')}</a>
        </div>
        <div class="faq" data-reveal>
          ${[
            ['Product or services firm?', 'Services. We design, build, integrate and support the right stack for you — custom, configured tools, or both.'],
            ['Razorpay, Cashfree, PhonePe, PayU?', 'Yes. Checkout, links, QR, subscriptions and webhook reconciliation. Funds settle with your RBI-authorised gateway.'],
            ['Do you handle tax invoices?', 'Yes — tax breakup, credit notes, and e-invoice / e-way where your business needs them.'],
            ['How long?', 'Billing + payments: often 3–6 weeks. Larger work is phased so phase one ships value early.'],
          ]
            .map(([q, a]) => `<details><summary>${q}<span class="faq-plus" aria-hidden="true"></span></summary><div class="faq-body">${a}</div></details>`)
            .join('\n          ')}
        </div>
      </div>
    </section>
` +
    ctaBlock(0) +
    `
  </main>` +
    orgJsonLd +
    mobileCta(0) +
    footer(0)
);

/* ---------- Services ---------- */
write(
  'services.html',
  head({
    title: 'Services | ' + BRAND,
    description: 'Nithinlabs services: retention, websites, billing, inventory, payment gateways, ERP, apps and more.',
    pagePath: 'services.html',
  }) +
    header(0, 'services') +
    `
  <main id="main">` +
    pageHero({
      depth: 0,
      crumbs: [{ label: 'Services' }],
      kicker: `${SERVICES.length} services · 5 groups`,
      title: 'Everything your business runs on.',
      lead: 'Pick what you need now. Connect the rest later.',
      extra: `
        <div class="filter-bar">
          <div class="filter">
            <label class="sr-only" for="service-filter">Filter services</label>
            ${icon('search')}
            <input id="service-filter" type="search" placeholder="Try “billing”, “UPI”, “stock”…" autocomplete="off">
          </div>
          <span class="filter-count" data-filter-count aria-live="polite"></span>
        </div>`,
    }) +
    `
    <div class="container">
      ${PILLARS.map(
        (p) => `<section class="pillar" id="${p.key}" data-pillar>
        <div class="pillar-aside">
          <span class="kicker">${p.num} / ${p.title}</span>
          <h2>${p.title}</h2>
          <p>${p.blurb}</p>
          ${pillarVisual(p.key)}
        </div>
        <div class="svc-grid">
          ${SERVICES.filter((s) => s.pillar === p.key)
            .map((s) => svcRow(s, 0, ` data-search="${(s.name + ' ' + s.short + ' ' + s.tags).toLowerCase().replace(/"/g, '')}"`))
            .join('\n          ')}
        </div>
      </section>`
      ).join('\n      ')}
      <p class="filter-empty" data-filter-empty aria-live="polite"></p>
    </div>
` +
    ctaBlock(0) +
    `
  </main>` +
    footer(0)
);

/* ---------- Service detail pages ---------- */
for (const s of SERVICES) {
  const pillar = PILLARS.find((p) => p.key === s.pillar);
  const related = SERVICES.filter((x) => x.pillar === s.pillar && x.slug !== s.slug).slice(0, 4);
  write(
    `services/${s.slug}.html`,
    head({
      title: `${s.name} | ${BRAND}`,
      description: s.short,
      depth: 1,
      pagePath: `services/${s.slug}.html`,
      ogImage: s.slug,
      ogAlt: `${s.name} — ${s.short}`,
    }) +
      header(1, 'services') +
      `
  <main id="main">
    <section class="page-hero">
      <div class="container detail-grid">
        <div>
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Home</a> <span aria-hidden="true">/</span> <a href="../services.html">Services</a> <span aria-hidden="true">/</span> <span>${s.name}</span></nav>
          <span class="kicker">${pillar.num} / ${pillar.title}</span>
          <h1 style="margin-top:1rem">${s.name}</h1>
          <p class="lead">${s.short}</p>
          <div class="btn-row" style="margin-top:2rem">
            <a class="btn btn-primary" data-magnetic href="../contact.html">Get a fixed quote ${icon('arrow')}</a>
            <a class="btn btn-outline" href="../services.html">All services</a>
          </div>
        </div>
        <aside class="panel" aria-label="At a glance">
          <div class="panel-visual">${pillarVisual(s.pillar)}</div>
          <dl>
            <div><dt>Timeline</dt><dd>${s.timeline}</dd></div>
            <div><dt>Built on</dt><dd>${s.stack}</dd></div>
            <div><dt>Pricing</dt><dd>Fixed scope</dd></div>
            <div><dt>Support</dt><dd>Optional AMC</dd></div>
          </dl>
        </aside>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="sec-head" data-reveal>
          <span class="kicker">Included</span>
          <h2>What you get.</h2>
          <p>Scoped to you. Drop what you don't need.</p>
        </div>
        <div class="feature-grid" data-reveal>
          ${s.features.map((f, i) => `<div class="feature"><span class="mono">${String(i + 1).padStart(2, '0')}</span><p>${f}</p></div>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="sec-head" data-reveal>
          <span class="kicker">Outcomes</span>
          <h2>What changes.</h2>
        </div>
        <ul class="checks" data-reveal>
          ${s.outcomes.map((o) => `<li>${icon('check')}${o}</li>`).join('\n          ')}
        </ul>
        <div class="related-chips" data-reveal>
          <span class="kicker">Also pairs with</span>
          <div class="chips-static" style="margin-top:.75rem">
            ${related.map((r) => `<a class="chip-link" href="${r.slug}.html">${r.name} ${icon('arrowUpRight', 'icon icon-sm')}</a>`).join('\n            ')}
          </div>
        </div>
      </div>
    </section>
` +
      ctaBlock(1) +
      `
  </main>` +
      footer(1)
  );
}

/* ---------- Industries ---------- */
write(
  'industries.html',
  head({
    title: 'Industries | ' + BRAND,
    description: 'Billing, stock and payments for retail, restaurants, pharma, clinics, salons, distributors, manufacturing and education.',
    pagePath: 'industries.html',
  }) +
    header(0, 'industries') +
    `
  <main id="main">` +
    pageHero({
      depth: 0,
      crumbs: [{ label: 'Industries' }],
      kicker: `${INDUSTRIES.length} industries`,
      title: 'Configured for your trade.',
      lead: 'Same building blocks. Different day-to-day.',
    }) +
    `
    <section class="section">
      <div class="container">
        ${INDUSTRIES.map(
          (ind, i) => `<article class="ind-block" id="${ind.id}" data-reveal>
          <span class="ind-num">${String(i + 1).padStart(2, '0')}</span>
          <h2>${ind.name}</h2>
          <div>
            <p>${ind.text}</p>
            <div class="chips-static">
              ${ind.stack.map((slug) => `<a class="chip-link" href="services/${slug}.html">${bySlug[slug].name} ${icon('arrowUpRight', 'icon icon-sm')}</a>`).join('\n              ')}
            </div>
          </div>
        </article>`
        ).join('\n        ')}
      </div>
    </section>
` +
    ctaBlock(0) +
    `
  </main>` +
    footer(0)
);

/* ---------- Case studies ---------- */
const CASES = [
  { title: 'Multi-store retail, one stock count', problem: 'Three outlets. Stock never matched settlements.', approach: 'Shared POS + inventory with Razorpay webhooks.', stack: ['pos', 'inventory', 'payment-gateways'] },
  { title: 'Distributor collections on autopilot', problem: '60+ day receivables chased by phone.', approach: 'e-Invoice billing, ageing and WhatsApp payment links.', stack: ['billing', 'whatsapp-automation', 'analytics'] },
  { title: 'Clinic bookings without phone tag', problem: 'Front desk buried in calls. High no-shows.', approach: 'Online booking, deposits and reminders.', stack: ['booking', 'payment-gateways', 'whatsapp-automation'] },
];

write(
  'case-studies.html',
  head({
    title: 'Work | ' + BRAND,
    description: 'Sample Nithinlabs project stories. Replace with verified case studies before launch.',
    pagePath: 'case-studies.html',
  }) +
    header(0, 'case-studies') +
    `
  <main id="main">` +
    pageHero({
      depth: 0,
      crumbs: [{ label: 'Work' }],
      kicker: 'Selected work',
      title: 'Problems we like solving.',
      lead: 'Sample stories — replace with client-approved results before launch.',
    }) +
    `
    <section class="section">
      <div class="container">
        <div class="case-grid" data-reveal>
          ${CASES.map(
            (c) => `<article class="case">
            <span class="tag">Sample</span>
            <h2>${c.title}</h2>
            <dl>
              <div><dt>Problem</dt><dd>${c.problem}</dd></div>
              <div><dt>Approach</dt><dd>${c.approach}</dd></div>
            </dl>
            <div class="chips-static" style="margin-top:auto">
              ${c.stack.map((slug) => `<a class="chip-link" href="services/${slug}.html">${bySlug[slug].name}</a>`).join('\n              ')}
            </div>
          </article>`
          ).join('\n          ')}
        </div>
        <p class="placeholder-note">Placeholder case studies.</p>
      </div>
    </section>
` +
    ctaBlock(0) +
    `
  </main>` +
    footer(0)
);

/* ---------- About ---------- */
write(
  'about.html',
  head({
    title: 'About | ' + BRAND,
    description: `${BRAND} builds and runs billing, inventory, payment, website and retention systems for Indian SMBs.`,
    pagePath: 'about.html',
  }) +
    header(0, 'about') +
    `
  <main id="main">` +
    pageHero({
      depth: 0,
      crumbs: [{ label: 'About' }],
      kicker: `About ${BRAND}`,
      title: 'Serious software. No enterprise drama.',
    }) +
    `
    <section class="section">
      <div class="container">
        <p class="manifesto" data-reveal>Three apps, a spreadsheet and a WhatsApp group. <span>We replace that with one connected system — and stay to run it.</span></p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="sec-head" data-reveal>
          <span class="kicker">Principles</span>
          <h2>How we work.</h2>
        </div>
        <div class="bento" data-reveal>
          <div class="cell"><div class="cell-top"><span class="cell-label">01</span>${icon('layers')}</div><div class="cell-body"><h3>Start small</h3><p>Ship the painful workflow first. Plug the rest into the same data.</p></div></div>
          <div class="cell"><div class="cell-top"><span class="cell-label">02</span>${icon('receipt')}</div><div class="cell-body"><h3>Fixed prices</h3><p>Written scopes. Changes priced openly.</p></div></div>
          <div class="cell"><div class="cell-top"><span class="cell-label">03</span>${icon('shield')}</div><div class="cell-body"><h3>You own it</h3><p>Code, data and credentials are yours.</p></div></div>
          <div class="cell cell-lg cell-dark"><div class="cell-top"><span class="cell-label">04</span>${icon('wrench')}</div><p class="statement" style="color:#fff">Simple beats clever. <span style="color:#7d828c">Boring tech that still works in five years.</span></p></div>
          <div class="cell"><div class="cell-top"><span class="cell-label">Base</span>${icon('pin')}</div><div class="cell-body"><h3>${CITY}</h3><p>Clients across India. On-site when it helps.</p></div></div>
        </div>
      </div>
    </section>
` +
    ctaBlock(0) +
    `
  </main>` +
    orgJsonLd +
    footer(0)
);

/* ---------- Contact ---------- */
const MODULES = [
  ['billing', 'Billing'],
  ['inventory', 'Inventory'],
  ['payments', 'Payment Gateway'],
  ['pos', 'POS'],
  ['website', 'Website'],
  ['ecommerce', 'Online Store'],
  ['crm', 'CRM & Retention'],
  ['whatsapp', 'WhatsApp'],
  ['booking', 'Bookings'],
  ['erp', 'ERP'],
  ['payroll', 'HR & Payroll'],
  ['app', 'Mobile App'],
];

write(
  'contact.html',
  head({
    title: 'Contact | ' + BRAND,
    description: 'Book a free 30-minute call with Nithinlabs about billing, inventory, payments or websites.',
    pagePath: 'contact.html',
  }) +
    header(0, 'contact') +
    `
  <main id="main">` +
    pageHero({
      depth: 0,
      crumbs: [{ label: 'Contact' }],
      kicker: 'Free 30-minute call',
      title: 'Let’s map your business.',
      lead: 'We reply within one business day with call times.',
    }) +
    `
    <section class="section">
      <div class="container contact-grid">
        <form class="form" id="contact-form" action="#" method="post" novalidate data-reveal>
          <div id="form-message" class="form-message" role="status" aria-live="polite"></div>
          <fieldset data-stack>
            <legend>What do you need? <span class="muted" style="font-weight:400">Pick any</span></legend>
            <div class="chips">
              ${MODULES.map(([id, label]) => `<input type="checkbox" id="m-${id}" name="modules" value="${label}"><label for="m-${id}">${label}</label>`).join('\n              ')}
            </div>
            <p class="estimate">${icon('sparkle')}<span data-stack-estimate>Pick modules to see a suggested rollout</span></p>
          </fieldset>
          <div class="form-row">
            <div><label for="name">Your name</label><input id="name" name="name" type="text" autocomplete="name" required></div>
            <div><label for="company">Business name</label><input id="company" name="company" type="text" autocomplete="organization"></div>
          </div>
          <div class="form-row">
            <div><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
            <div><label for="phone">Phone / WhatsApp</label><input id="phone" name="phone" type="tel" autocomplete="tel" placeholder="+91"></div>
          </div>
          <div><label for="message">A little about your business</label><textarea id="message" name="message" rows="4" placeholder="e.g. Two stores, Tally billing, want UPI + stock…" required></textarea></div>
          <div class="form-foot">
            <small>Prefer email? <a href="mailto:${EMAIL}">${EMAIL}</a></small>
            <button class="btn btn-primary" type="submit" data-magnetic>Send enquiry ${icon('arrow')}</button>
          </div>
        </form>
        <aside data-reveal style="--d:.1s">
          <span class="kicker">What happens next</span>
          <ol class="next-steps">
            <li><span class="mono">01</span><div><strong>We reply within a day</strong><span>with a few slots.</span></div></li>
            <li><span class="mono">02</span><div><strong>30-minute call</strong><span>Billing, stock, payments.</span></div></li>
            <li><span class="mono">03</span><div><strong>Fixed-price proposal</strong><span>Scope, timeline, cost.</span></div></li>
          </ol>
          <div class="contact-list">
            <a href="mailto:${EMAIL}">${icon('mail')}${EMAIL}</a>
            <a href="tel:${PHONE_TEL}">${icon('call')}${PHONE}</a>
            <a href="https://wa.me/${PHONE_TEL.slice(1)}">${icon('message')}WhatsApp us</a>
            <div>${icon('pin')}${CITY}, India</div>
          </div>
          <a class="contact-refer" href="${referralWhatsAppUrl()}" target="_blank" rel="noopener noreferrer">
            <span class="contact-refer-icon">${icon('gift')}</span>
            <span>
              <strong>Not for you, but know someone?</strong>
              <span>Earn ${REFERRAL.display} — refer them on WhatsApp.</span>
            </span>
            ${icon('arrow')}
          </a>
        </aside>
      </div>
    </section>
  </main>` +
    orgJsonLd +
    footer(0)
);

function legal(file, title, description, heading, lead, body) {
  write(
    file,
    head({ title, description, pagePath: file }) +
      header(0, 'none') +
      `
  <main id="main">` +
      pageHero({ depth: 0, crumbs: [{ label: heading }], title: heading, lead }) +
      `
    <section class="section">
      <div class="container prose">
${body}
      </div>
    </section>
  </main>` +
      footer(0)
  );
}

legal(
  'privacy.html',
  'Privacy Policy | ' + BRAND,
  'How Nithinlabs handles website and enquiry data.',
  'Privacy Policy',
  'How we handle information from this site.',
  `        <h2>What we collect</h2>
        <p>Enquiries include name, email, phone, business name, selected modules and your message. Logs may include IP and browser data for security.</p>
        <h2>How we use it</h2>
        <p>To reply and, if you become a client, to deliver work. We do not sell personal information.</p>
        <h2>Sharing</h2>
        <p>Email or form providers may process messages. Client payments go through RBI-authorised gateways under their policies.</p>
        <h2>Retention</h2>
        <p>Kept as needed to respond and for business records, then deleted or anonymised.</p>
        <h2>Your rights</h2>
        <p>Email <a href="mailto:${EMAIL}">${EMAIL}</a> to access, correct or delete data under the DPDP Act, 2023.</p>
        <h2>Changes</h2>
        <p>Updates will appear on this page.</p>`
);

legal(
  'terms.html',
  'Terms of Service | ' + BRAND,
  'Terms for using the Nithinlabs website.',
  'Terms of Service',
  'Terms for using this website.',
  `        <h2>Using this site</h2>
        <p>Information only. Nothing is a binding offer until a written proposal is accepted.</p>
        <h2>Client projects</h2>
        <p>Scope, timelines, fees and SLAs live in the signed proposal.</p>
        <h2>Referral programme</h2>
        <p>Anyone may refer a business to Nithinlabs on WhatsApp at <a href="${referralWhatsAppUrl()}">+91 ${REFERRAL.phone}</a>. A reward of ${REFERRAL.display} is paid once the referred business becomes a paying client, via ${REFERRAL.payout}. The first valid referral of a given business wins. Self-referrals and businesses with an existing open conversation with us do not qualify. Nithinlabs confirms eligibility and payout.</p>
        <h2>Accuracy</h2>
        <p>We keep content current. Sample case studies and metrics are marked.</p>
        <h2>Liability</h2>
        <p>To the extent permitted by law, we are not liable for indirect losses from using this site.</p>
        <h2>Contact</h2>
        <p><a href="mailto:${EMAIL}">${EMAIL}</a></p>`
);

write(
  '404.html',
  head({ title: 'Page not found | ' + BRAND, description: 'Page not found on Nithinlabs.', pagePath: '404.html' }) +
    header(0, 'none') +
    `
  <main id="main" class="error-page">
    <div class="container">
      ${tippedFlask()}
      <p class="error-code">Error 404</p>
      <h1>This experiment didn't work.</h1>
      <p>That link is missing. Try home or services.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="index.html">Back to home ${icon('arrow')}</a>
        <a class="btn btn-outline" href="services.html">View services</a>
      </div>
    </div>
  </main>` +
    footer(0)
);

fs.writeFileSync(
  path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}/${p === 'index.html' ? '' : p}</loc><changefreq>monthly</changefreq></url>`).join('\n')}
</urlset>
`
);

fs.writeFileSync(
  path.join(ROOT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
);

console.log(`Generated ${pages.length + 1} pages, sitemap.xml and robots.txt`);
