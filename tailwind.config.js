import pmgPreset from '@premiummg/ui/tailwind-preset';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [pmgPreset],
  darkMode: 'class',
  // @premiummg/ui builds its className strings inside its COMPILED dist
  // bundle, not under ./src - without scanning that bundle too, Tailwind never
  // sees those class names and silently drops them.
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@premiummg/ui/dist/**/*.{js,cjs}',
  ],
};
