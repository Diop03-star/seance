// Copies the shared tombstone scene from the app into the static site (site/), so both stay in sync.
// Usage: node scripts/build-site.js   (also run by the GitHub Pages workflow)
import { copyFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
for (const file of ['tombstone.js', 'tombstone.css']) {
  await copyFile(new URL(`public/${file}`, root), new URL(`site/${file}`, root));
}
console.log('site/ ready');
