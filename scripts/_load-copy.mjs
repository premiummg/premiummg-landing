import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

// Bundles scripts/seed-entry.ts and returns the code's defaults: the page
// wording (EN, FR) and the structured content (services, team, certifications,
// legal). The sources are TypeScript with extension-less imports, which Node
// cannot run as they are, so they go through Vite once (into .seed/, gitignored).
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function loadCopy() {
  await build({
    root,
    logLevel: 'error',
    build: { ssr: 'scripts/seed-entry.ts', outDir: '.seed', emptyOutDir: true, write: true, minify: false },
  });
  return import(pathToFileURL(join(root, '.seed', 'seed-entry.js')).href);
}
