// Erzeugt assets/icons/*.png aus tools/icons.html (braucht Node + Playwright).
//   node tools/make-icons.mjs
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage();
await page.goto('file://' + root + 'tools/icons.html');
const icons = await page.$$eval('a[download]', as => as.map(a => [a.download, a.href]));
for (const [name, url] of icons) {
  writeFileSync(root + 'assets/icons/' + name, Buffer.from(url.split(',')[1], 'base64'));
  console.log('geschrieben: assets/icons/' + name);
}
await browser.close();
