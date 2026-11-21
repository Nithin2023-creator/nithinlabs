/**
 * Generate Open Graph preview images (1200×630 JPEG) for WhatsApp / social cards.
 * Run: node scripts/generate-og.mjs
 *
 * Requires Google Chrome (macOS) and sips (built-in).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { BRAND, SERVICES, HOME_OG_SERVICES, ICON_PATHS } from './site-data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'og');
const TMP_DIR = path.join(ROOT, '.og-tmp');
const LOGO = path.join(ROOT, 'assets', 'img', 'logo-mark.png');

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function iconSvg(name, size = 28) {
  const paths = ICON_PATHS[name] || ICON_PATHS.sparkle;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#2747f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function baseStyles() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      font-family: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      background: #fafaf8;
      color: #0b0d12;
      -webkit-font-smoothing: antialiased;
    }
    body {
      background-image:
        linear-gradient(rgba(11,13,18,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(11,13,18,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      background-position: -1px -1px;
    }
    .frame {
      width: 1200px;
      height: 630px;
      padding: 48px 56px 40px;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .frame::before {
      content: "";
      position: absolute;
      inset: 24px;
      border: 1px solid #e7e5e0;
      border-radius: 16px;
      pointer-events: none;
    }
    .top {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 28px;
      position: relative;
      z-index: 1;
    }
    .logo {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: #fff;
      border: 1px solid #e7e5e0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .logo img { width: 44px; height: 44px; object-fit: contain; }
    .brand-name {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .brand-kicker {
      font-family: ui-monospace, "Geist Mono", SFMono-Regular, Menlo, monospace;
      font-size: 13px;
      color: #5b6069;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .headline {
      font-size: 42px;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.15;
      max-width: 980px;
      position: relative;
      z-index: 1;
    }
    .sub {
      margin-top: 14px;
      font-size: 22px;
      color: #5b6069;
      line-height: 1.35;
      max-width: 900px;
      position: relative;
      z-index: 1;
    }
    .tiles {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin-top: auto;
      position: relative;
      z-index: 1;
    }
    .tile {
      background: #fff;
      border: 1px solid #e7e5e0;
      border-radius: 12px;
      padding: 18px 16px;
      min-height: 128px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .tile-label {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }
    .features {
      list-style: none;
      margin-top: 22px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      z-index: 1;
    }
    .features li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      color: #262a33;
    }
    .features li::before {
      content: "";
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #2747f5;
      flex-shrink: 0;
    }
    .foot {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;
      padding-top: 20px;
    }
    .foot-domain {
      font-family: ui-monospace, "Geist Mono", SFMono-Regular, Menlo, monospace;
      font-size: 16px;
      color: #2747f5;
      font-weight: 500;
      letter-spacing: 0.02em;
    }
    .foot-tag {
      font-size: 14px;
      color: #8b9098;
      font-family: ui-monospace, "Geist Mono", SFMono-Regular, Menlo, monospace;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .accent-bar {
      position: absolute;
      left: 24px;
      right: 24px;
      bottom: 24px;
      height: 4px;
      background: linear-gradient(90deg, #2747f5, #6b5bd6);
      border-radius: 0 0 12px 12px;
    }
  `;
}

function wrapCard(bodyInner) {
  const logoUrl = `file://${LOGO}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>${baseStyles()}</style>
</head>
<body>
  <div class="frame">
    <div class="top">
      <div class="logo"><img src="${logoUrl}" alt="" width="44" height="44"></div>
      <div>
        <div class="brand-name">${BRAND}</div>
        <div class="brand-kicker">IT solutions for Indian SMBs</div>
      </div>
    </div>
    ${bodyInner}
    <div class="accent-bar"></div>
  </div>
</body>
</html>`;
}

function homeCardHtml() {
  const bySlug = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));
  const tiles = HOME_OG_SERVICES.map((item) => {
    const svc = bySlug[item.slug];
    return `<div class="tile">
      ${iconSvg(svc.icon, 28)}
      <div class="tile-label">${item.label}</div>
    </div>`;
  }).join('\n');

  return wrapCard(`
    <h1 class="headline">Billing, stock, payments and websites as one stack</h1>
    <p class="sub">One connected system for Indian SMBs — from invoice to retention.</p>
    <div class="tiles">${tiles}</div>
    <div class="foot">
      <span class="foot-domain">nithinlabs.tech</span>
      <span class="foot-tag">Billing · Brand · Payments · Stock · CRM</span>
    </div>
  `);
}

function serviceCardHtml(service) {
  const features = service.features
    .slice(0, 3)
    .map((f) => `<li>${f}</li>`)
    .join('\n');

  return wrapCard(`
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:8px;position:relative;z-index:1">
      <div style="width:48px;height:48px;border-radius:12px;background:#eef1fe;display:flex;align-items:center;justify-content:center;border:1px solid #d6d3cc">
        ${iconSvg(service.icon, 26)}
      </div>
      <div class="brand-kicker" style="margin:0">Service</div>
    </div>
    <h1 class="headline">${service.name}</h1>
    <p class="sub">${service.short}</p>
    <ul class="features">${features}</ul>
    <div class="foot">
      <span class="foot-domain">nithinlabs.tech</span>
      <span class="foot-tag">${service.timeline} · ${service.stack}</span>
    </div>
  `);
}

function screenshot(chrome, htmlPath, pngPath) {
  const fileUrl = `file://${htmlPath}`;
  const result = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=1200,630`,
      `--screenshot=${pngPath}`,
      '--virtual-time-budget=8000',
      '--default-background-color=00000000',
      fileUrl,
    ],
    { encoding: 'utf8', timeout: 60000 }
  );
  if (result.status !== 0 && !fs.existsSync(pngPath)) {
    throw new Error(
      `Chrome screenshot failed for ${htmlPath}:\n${result.stderr || result.stdout || result.error}`
    );
  }
}

function pngToJpeg(pngPath, jpgPath) {
  const result = spawnSync(
    'sips',
    ['-s', 'format', 'jpeg', '-s', 'formatOptions', '80', pngPath, '--out', jpgPath],
    { encoding: 'utf8' }
  );
  if (result.status !== 0 || !fs.existsSync(jpgPath)) {
    throw new Error(`sips convert failed: ${result.stderr || result.stdout}`);
  }
  // Ensure exact 1200x630 (Chrome sometimes adds chrome chrome / retina)
  const resize = spawnSync(
    'sips',
    ['--resampleHeightWidth', '630', '1200', jpgPath],
    { encoding: 'utf8' }
  );
  if (resize.status !== 0) {
    throw new Error(`sips resize failed: ${resize.stderr || resize.stdout}`);
  }
}

function writeCard(name, html) {
  const htmlPath = path.join(TMP_DIR, `${name}.html`);
  const pngPath = path.join(TMP_DIR, `${name}.png`);
  const jpgPath = path.join(OUT_DIR, `${name}.jpg`);
  fs.writeFileSync(htmlPath, html);
  return { name, htmlPath, pngPath, jpgPath };
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error('Google Chrome not found. Install Chrome or update CHROME_CANDIDATES.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const jobs = [writeCard('home', homeCardHtml())];
  for (const s of SERVICES) {
    jobs.push(writeCard(s.slug, serviceCardHtml(s)));
  }

  console.log(`Generating ${jobs.length} OG images with ${path.basename(chrome)}…`);

  for (const job of jobs) {
    process.stdout.write(`  ${job.name}.jpg … `);
    screenshot(chrome, job.htmlPath, job.pngPath);
    pngToJpeg(job.pngPath, job.jpgPath);
    const sizeKb = (fs.statSync(job.jpgPath).size / 1024).toFixed(1);
    console.log(`${sizeKb} KB`);
  }

  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  console.log(`Wrote ${jobs.length} images to assets/og/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
