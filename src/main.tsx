import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root')!;
const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Every real route ships as prerendered HTML (scripts/prerender.mjs), so the
// normal path is hydration: adopt the markup already on screen instead of
// painting the page twice. createRoot is the fallback for an empty document,
// which is what `vite dev` serves.
if (container.firstElementChild) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
