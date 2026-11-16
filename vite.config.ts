import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev-only stand-in for Vercel's /api runtime: `npm run dev` is plain Vite,
// which doesn't serve the api/ folder, so without this the estimate form
// 404s locally. Runs the real api/*.ts handlers (loaded through Vite so the
// TypeScript just works) behind a minimal req/res shim, with the secrets from
// .env.local (gitignored). `apply: 'serve'`: it never exists in a build.
function localApi(mode: string): Plugin {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), '');
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v;

      server.middlewares.use('/api', async (req, res, next) => {
        // req.url is relative to the mount point: "/contact", "/site-config".
        const name = (req.url ?? '').split('?')[0].replace(/^\//, '');
        if (!/^[a-z-]+$/.test(name)) { next(); return; }
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const raw = Buffer.concat(chunks).toString('utf8');
        let parsedBody: unknown;
        try {
          parsedBody = raw ? JSON.parse(raw) : undefined;
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'invalid_body' }));
          return;
        }
        const vReq = Object.assign(req, { body: parsedBody });
        const vRes = Object.assign(res, {
          status(code: number) { res.statusCode = code; return vRes; },
          json(body: unknown) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); },
        });
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`);
          await mod.default(vReq, vRes);
        } catch (err) {
          console.error('[local-api]', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Local API crashed - see the dev server log.' }));
        }
      });
    },
  };
}

// @premiummg/ui's styles.css declares Montserrat/Poppins as .ttf (~2.2 MB),
// but src/index.css re-declares every family/weight pair with the Latin-subset
// WOFF2 files in public/fonts, and the later declaration wins, so the browser
// never requests the TTFs. Vite still emits them into dist/assets; drop them
// so they are not deployed. A weight added to the package but not to
// src/index.css would 404 - add its WOFF2 there instead.
function dropUnusedTtf(): Plugin {
  return {
    name: 'drop-unused-ttf',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const name of Object.keys(bundle)) {
        if (bundle[name].type === 'asset' && name.endsWith('.ttf')) delete bundle[name];
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), localApi(mode), dropUnusedTtf()],
  // A single copy of React even if @premiummg/ui is ever `npm link`ed for
  // local work (its own nested React would otherwise break every hook).
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // The prerender build (scripts/prerender.mjs) runs this same tree under
  // Node. @premiummg/ui is bundled into that build rather than left external,
  // so it resolves the same single React as the app and its CSS imports are
  // handled by Vite instead of Node.
  ssr: {
    noExternal: ['@premiummg/ui'],
  },
  build: {
    outDir: 'dist',
    rolldownOptions: {
      treeshake: {
        // @premiummg/ui calls `createDOMPurify()` at module level; bundlers
        // can't prove that side-effect-free, so DOMPurify would land in the
        // main chunk although no page here sanitizes HTML. If src/ ever uses
        // a UI component that sanitizes HTML, remove this option.
        manualPureFunctions: ['createDOMPurify', 'DOMPurify'],
      },
    },
  },
}));
