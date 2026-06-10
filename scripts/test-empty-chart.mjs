// Diagnose the empty charts: long wait + count rendered bar rects.
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await (await browser.newContext({ viewport: { width: 1600, height: 1000 } })).newPage();

await page.goto(`${BASE}/reportistica`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Scostamenti/ }).click();
await page.waitForTimeout(4000); // far beyond any animation duration

const bars = await page.locator('.recharts-bar-rectangle path, .recharts-bar-rectangle rect').count();
const wrappers = await page.locator('.recharts-wrapper').count();
const surfaceBox = await page.locator('.recharts-surface').first().boundingBox();
console.log({ wrappers, bars, surfaceBox });

await page.screenshot({ path: 'scripts/shots/variance-4s.png', fullPage: false });
await browser.close();
