import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COPY_PAGES, copyShape } from '../studio/schemaTypes/copyShape.ts';
import { loadCopy } from './_load-copy.mjs';

// Writes studio/schemaTypes/copy-shape.json: the structure of src/copy.ts that
// the Studio builds its page forms from (which field is a line or a text area,
// which `{slots}` it must keep, how long each list is). Run it after adding or
// removing a string in copy.ts; tests/cms.test.ts fails while it is stale.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { EN, FR } = await loadCopy();
const shape = copyShape(EN, FR);
const keys = new Set(COPY_PAGES.flatMap(p => p.keys));
const trimmed = { t: 'obj', f: Object.fromEntries(Object.entries(shape.f).filter(([k]) => keys.has(k))) };
writeFileSync(join(root, 'studio', 'schemaTypes', 'copy-shape.json'), JSON.stringify(trimmed, null, 1) + '\n');
console.log(`[copy-shape] ${keys.size} sections written.`);
