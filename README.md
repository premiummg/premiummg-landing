# Premium Group - premiummg.ca

The public site of Premium Management Global Solutions Inc., built on
`@premiummg/ui` (GitHub Packages) the same way `otoshi-landingpage` and
`pmg-intranet` consume it: Vite + React 19 + Tailwind v4, with the package's
own `tailwind-preset` and `styles.css` (the brand's colours, fonts and
`pmg-*` utilities are not duplicated here).

It started as the design proposal at
`timesheet-payroll-system/frontend/src/pages/design/LandingProposalPage.tsx`
and the review canvas that followed; this is the real, deployable site.

- Node 26 (LTS), see `.nvmrc` and `engines`.
- English at `/`, French under `/fr`, one prerendered HTML file per page and
  language, plus `sitemap.xml` and `404.html`.
- Light and dark theme, following the visitor's system setting until they
  choose one.

## Setup

```bash
npm install   # needs NPM_TOKEN: a GitHub token that can read @premiummg packages
npm run dev   # http://localhost:5173, forms work through a local stand-in for /api
npm test      # API validation, routes, SEO, and the copy rules (no em dashes)
npm run build # typecheck, client build, prerender every route into dist/
```

## Content management (Sanity)

Almost everything a visitor reads or sees is edited in a Sanity Studio
(`studio/`), not in code: every page's wording, the service pages, the team,
certifications, legal pages, pictures, blog articles, project photos and social
links. Publishing there triggers a Vercel deploy; the build pulls the published
content (`scripts/fetch-cms.mjs`) into `src/content/cms.generated.json`
(gitignored) in the shapes the pages already use, and the site is prerendered
as usual. The page layout, the menus and the section order stay in code.

The code keeps every string and every list as the default and the CMS only lays
over it (`mergeCopy`, `applyServiceOverride`), so an empty field or an
unreachable CMS never loses a word. The Studio's forms for the wording are
built from `src/copy.ts` (`studio/schemaTypes/copy-shape.json`).

**Adding or removing a string in `src/copy.ts`:** run `npm run copy:shape`,
commit the updated `copy-shape.json`, and `cd studio && npm run deploy`
(`tests/cms.test.ts` fails while the file is stale). A new string shows empty in
the Studio and uses the code's text until someone fills it.

**First load of the content into a new Studio:** `npm run cms:seed-copy` (needs
`npx sanity login`). It skips any group the Studio already holds, so it never
overwrites an editor's work; `--force` replaces.

- No `SANITY_PROJECT_ID`: the site keeps its built-in sample articles and
  photos, so a fresh clone builds.
- A project id but a failed pull, or a document missing a field (a French
  title, a photo description): the build fails rather than publishing stale or
  half-empty content.
- A type with nothing published yet falls back to the samples for that type.
- Categories and services are lists in code. Adding one means changing
  `src/` and `studio/schemaTypes/options.ts`; `tests/cms.test.ts` fails if
  they drift.
- The editor-facing guide is `docs/editor-guide.md`.

```bash
cd studio && npm install
cp .env.example .env.local   # SANITY_STUDIO_PROJECT_ID=...
npm run dev                  # Studio at http://localhost:3333
npm run deploy               # hosted at premiummg.sanity.studio
```

Set `SANITY_PROJECT_ID` and `SANITY_DATASET` in the site's `.env.local` and on
Vercel. `npm run cms:pull` refreshes the local copy.

## Pages

| URL | Source |
|---|---|
| `/` | `src/pages/HomePage.tsx` (sections in `src/components/home/`) |
| `/about` | `src/pages/AboutPage.tsx`, team in `src/content/team.ts` |
| `/services/:key` | `src/pages/ServicePage.tsx`, one template for the five services in `src/content/services.ts` |
| `/projects` | `src/pages/ProjectsPage.tsx`, photos in `src/content/projects.ts` |
| `/blog`, `/blog/:slug` | `src/pages/BlogPage.tsx`, `src/pages/ArticlePage.tsx`, posts in `src/content/posts.ts` |
| `/contact` | `src/pages/ContactPage.tsx` |
| `/terms`, `/privacy` | `src/pages/LegalPage.tsx`, headings in `src/content/legal.ts` |

Every string a visitor reads is in `src/copy.ts` (UI) or `src/content/*`
(services, posts, team), always in both languages. The French object is
typed against the English one, so a missing translation fails the build.

The old WordPress URLs (`/about-us`, `/caulking`, `/drywalling`,
`/contact-us`, `/premiumprojects`, `/terms-conditions`, `/privacy-policy` and
their `/fr/` versions) redirect permanently to the new ones (`vercel.json`).

## Forms (Vercel functions)

| Endpoint | What it does |
|---|---|
| `POST /api/contact` | The estimate request. Emails Premium (Resend) with the visitor as Reply-To. |
| `POST /api/subscribe` | The footer newsletter. Adds the address to a Resend audience, or emails it to Premium when there is none. |
| `GET /api/site-config` | The public Turnstile site key, when the captcha is on. |

Both POSTs validate with the same limits as the form (`src/formLimits.ts`),
escape everything that goes into the email, reject line breaks in one-line
fields (header injection), ignore a repeated submission id (double click),
check the Origin on production, rate-limit per IP, and require Cloudflare
Turnstile on the estimate form when both keys are set. The in-memory limiter
only sees one warm instance: also set a rate limit on `POST /api/*` in the
Vercel dashboard (Firewall).

Environment variables: see `.env.example`. Without `RESEND_API_KEY`,
`npm run dev` prints the email to the terminal; a Vercel deployment answers
with an error instead of dropping the request.

## Deploying

Vercel, framework preset "Vite", output `dist`. Add `NPM_TOKEN` (read access
to `@premiummg` packages) and the variables in `.env.example`. The
`Content-Security-Policy` ships as Report-Only: switch it to enforcing once a
week of reports is clean. Its script hash matches the inline theme script in
`index.html`; recompute it if that script changes.

## Before launch

Everything below is visible on the site as an amber "To confirm" tag or a
placeholder:

- The three figures in the hero band (years in business, projects completed,
  clients served).
- Project names and places; more project photos (the live gallery has 30).
- A drywall photo, a team photo and team portraits.
- Partner logo files (UL Solutions, Arrow, Carboline, NUCO, Tremco, STI, COR).
- The legal text of `/terms` and `/privacy`, carried over unchanged.
- The blog: every post in `src/content/posts.ts` is sample content
  (`sample: true`, kept out of the sitemap and marked `noindex`). Replace it
  with real posts or connect a headless CMS: posts are typed blocks, not HTML,
  so a CMS adapter only has to return `Post[]`.
- A review of the French by a native speaker.
- "ULC" vs "UL": the live firestopping page says ULC-Certified, the badge is UL.
