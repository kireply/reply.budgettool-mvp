// Screenshot the chart pages for visual inspection (uses system Edge, headless).
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:5173';
const OUT = 'scripts/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 } })).newPage();

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

async function shot(name) {
  await page.waitForTimeout(900); // let recharts animations settle
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`saved ${name}`);
}

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await shot('dashboard');

await page.goto(`${BASE}/reportistica`, { waitUntil: 'networkidle' });
await shot('report-area');
await page.getByRole('button', { name: /Scostamenti|Variance/ }).click();
await shot('report-wbs');
await page.getByRole('button', { name: /Trend|Cumulat/ }).click();
await shot('report-trend');

await page.goto(`${BASE}/wbs/wbs-001`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Distribuzione Mensile|Monthly Distribution/ }).click();
await shot('wbs-distribution');

console.log('console errors:', errors.length ? errors : 'none');
await browser.close();
