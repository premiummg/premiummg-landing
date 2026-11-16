import { defineField, defineType } from 'sanity';

// The site's L = { en, fr } as editor fields. Both languages are required, so
// an article can never be published in one language and missing in the other.
// The brand does not write with em dashes (the site's tests enforce it); warn
// here so the editor hears it before the build does.
const LONG_DASH = String.fromCharCode(0x2014);
const noLongDash = (value?: string) =>
  value && value.includes(LONG_DASH) ? 'Avoid the long dash. Use a comma, a colon or a full stop.' : true;

const pair = (name: string, title: string, type: 'string' | 'text', rows?: number) =>
  defineType({
    name,
    title,
    type: 'object',
    options: { columns: 2 },
    fields: (['en', 'fr'] as const).map(lang =>
      defineField({
        name: lang,
        title: lang === 'en' ? 'English' : 'Français',
        type,
        rows,
        validation: rule => [rule.required(), rule.custom(noLongDash).warning()],
      }),
    ),
  });

export const localizedString = pair('localizedString', 'Text (EN / FR)', 'string');
export const localizedText = pair('localizedText', 'Long text (EN / FR)', 'text', 4);
