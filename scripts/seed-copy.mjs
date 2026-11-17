import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDocs } from '../studio/schemaTypes/copyShape.ts';
import { credentialsToDoc, legalToDoc, serviceToDoc, teamToDoc } from '../studio/schemaTypes/contentModel.ts';
import { loadCopy } from './_load-copy.mjs';

// ONE-TIME per group: loads what is in the code into the Studio, so the editor
// opens each page already filled with today's content in English and French
// instead of an empty form.
//
//   wording  - the text of every page (src/copy.ts)       -> siteCopy* documents
//   content  - service pages, team, certifications, legal -> siteService, siteTeam, ...
//
// A group is skipped when the Studio already holds it, because importing again
// would overwrite what an editor wrote. Pass --force to replace anyway.
// Needs `npx sanity login` once (it uses the Studio's own session).
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const f of ['.env.local', '.env']) { try { process.loadEnvFile(join(root, f)); } catch { /* optional */ } }
const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';
if (!projectId) throw new Error('Set SANITY_PROJECT_ID in .env.local first.');
const force = process.argv.includes('--force');

async function count(filter) {
  const q = encodeURIComponent(`count(*[${filter}])`);
  const res = await fetch(`https://${projectId}.api.sanity.io/v2025-01-01/data/query/${dataset}?perspective=published&query=${q}`);
  return (await res.json()).result;
}

const d = await loadCopy();
const groups = [
  {
    name: 'wording',
    filter: '_type match "siteCopy*"',
    docs: () => buildDocs(d.EN, d.FR),
  },
  {
    name: 'content',
    filter: '_type in ["siteService", "siteTeam", "siteCredentials", "siteLegal"]',
    docs: () => [
      ...d.DEFAULT_SERVICES.map(serviceToDoc),
      teamToDoc(d.DEFAULT_TEAM),
      credentialsToDoc(d.DEFAULT_CREDENTIALS, d.DEFAULT_AFFILIATIONS),
      ...Object.entries(d.DEFAULT_LEGAL).map(([k, v]) => legalToDoc(k, v)),
    ],
  },
];

const docs = [];
for (const g of groups) {
  const existing = await count(g.filter);
  if (existing > 0 && !force) { console.log(`[seed] ${g.name}: the Studio already holds ${existing} document(s); leaving them alone.`); continue; }
  docs.push(...g.docs());
  console.log(`[seed] ${g.name}: loading.`);
}
if (!docs.length) process.exit(0);

mkdirSync(join(root, '.seed'), { recursive: true });
const file = join(root, '.seed', 'seed.ndjson');
writeFileSync(file, docs.map(x => JSON.stringify(x)).join('\n') + '\n');
execSync(`npx sanity dataset import "${file}" --dataset ${dataset} --replace`, { cwd: join(root, 'studio'), stdio: 'inherit' });
console.log(`[seed] ${docs.length} document(s) loaded.`);
