import { defineArrayMember, defineField, defineType } from 'sanity';
import { COPY_PAGES, placeholdersOf, type Shape } from './copyShape';
import shapeJson from './copy-shape.json';

// The editable pages: one single document per page (Home, About, Contact...),
// built from the structure of src/copy.ts so a new string in the code gets its
// field without anyone writing a form by hand. The documents are loaded once
// with today's wording (scripts/seed-copy.mjs) so each form opens filled in.
const shape = shapeJson as Shape;
if (shape.t !== 'obj') throw new Error('copy-shape.json is malformed');

const human = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

// A {slot} is replaced by the site with a value (a service name, a number):
// the text has to keep it, in both languages, or the sentence breaks.
function slotsCheck(slots: string[]) {
  return (value: unknown) => {
    if (!slots.length) return true;
    const v = value as { en?: string; fr?: string } | undefined;
    for (const lang of ['en', 'fr'] as const) {
      const text = v?.[lang];
      if (text && placeholdersOf(text).join() !== slots.join()) {
        return `Keep ${slots.join(' ')} exactly as it is, in English and in French. The site fills it in.`;
      }
    }
    return true;
  };
}

function firstTextKey(s: Shape): string | undefined {
  if (s.t !== 'obj') return undefined;
  return Object.entries(s.f).find(([, v]) => v.t === 'str')?.[0];
}

// The Sanity builders are generic over their field options; the shape is only
// known at runtime, so the dynamic fields are typed loosely here.
function field(name: string, s: Shape): ReturnType<typeof defineField> {
  const title = human(name);
  switch (s.t) {
    case 'str':
      return defineField({
        name,
        title,
        type: s.long ? 'localizedText' : 'localizedString',
        description: s.ph.length ? `Keep ${s.ph.join(' ')} as it is: the site fills it in.` : undefined,
        validation: rule => rule.custom(slotsCheck(s.ph)),
      });
    case 'bool':
      return defineField({
        name,
        title,
        type: 'boolean',
        description: name === 'placeholder' ? 'On: shows a "To confirm" tag on this item until the real figure is set.' : undefined,
      });
    case 'obj':
      return defineField({
        name,
        title,
        type: 'object',
        options: { collapsible: true, collapsed: true },
        fields: Object.entries(s.f).map(([k, v]) => field(k, v)),
      });
    case 'arr': {
      const titleKey = firstTextKey(s.item);
      const member =
        s.item.t === 'str'
          ? defineArrayMember({ type: s.item.long ? 'localizedText' : 'localizedString' })
          : defineArrayMember({
              type: 'object',
              name: 'item',
              fields: Object.entries((s.item as Extract<Shape, { t: 'obj' }>).f).map(([k, v]) => field(k, v)),
              preview: titleKey ? { select: { title: `${titleKey}.en` } } : undefined,
            });
      return defineField({
        name,
        title,
        type: 'array',
        of: [member],
        description: `Edit the ${s.n} items. The page is laid out for exactly ${s.n}, so do not add or remove any.`,
        options: { sortable: false },
        validation: rule => rule.length(s.n).error(`This list must have exactly ${s.n} items (the page is laid out for that many).`),
      });
    }
  }
}

export const siteCopyTypes = COPY_PAGES.map(page =>
  defineType({
    name: page.type,
    title: page.title,
    type: 'document',
    fields: page.keys.map(k => {
      const s = (shape as Extract<Shape, { t: 'obj' }>).f[k];
      if (!s) throw new Error(`copy-shape.json has no "${k}": run npm run copy:shape.`);
      return field(k, s);
    }),
    preview: { prepare: () => ({ title: page.title }) },
  }),
);
