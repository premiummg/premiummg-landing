import { FiCheck, FiExternalLink } from 'react-icons/fi';
import { youtubeId } from '../../studio/schemaTypes/blocks';
import { useT } from '../lang';
import { pick } from '../content/l10n';
import type { Block } from '../content/posts';
import { YouTubeEmbed } from './YouTubeEmbed';
import { ACCENT_TEXT, BODY, INK } from './ui';

// The parts of an article or a legal page, in the order the editor wrote them.
// `title` names the page for the video player; `headingTag` is h3 where the
// page already has an h2 for the section (legal pages).
export function Blocks({ blocks, title, headingTag = 'h2' }: { blocks: Block[]; title: string; headingTag?: 'h2' | 'h3' }) {
  const { t, lang } = useT();
  const a = t.articlePage;
  const P = `text-lg leading-[1.75] ${INK}`;
  const Heading = headingTag;

  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'p':
            return <p key={i} className={P}>{pick(block.text, lang)}</p>;
          case 'h2':
            return <Heading key={i} id={block.id} className={`scroll-mt-32 mt-4 font-heading font-black ${headingTag === 'h2' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'} leading-tight ${INK}`}>{pick(block.text, lang)}</Heading>;
          case 'quote':
            return (
              <blockquote key={i} className={`pmg-bracket my-2 font-heading font-extrabold text-xl md:text-2xl leading-snug text-balance ${INK}`}>
                {pick(block.text, lang)}
              </blockquote>
            );
          case 'list':
            return (
              <ul key={i} className="flex flex-col gap-3">
                {block.items.map((it, k) => (
                  <li key={k} className={`flex items-start gap-3 text-[17px] leading-relaxed ${INK}`}>
                    <span className="w-6.5 h-6.5 mt-0.5 shrink-0 rounded-lg grid place-items-center bg-(--premium-red-light) dark:bg-(--premium-red)/20">
                      <FiCheck size={15} aria-hidden="true" className={ACCENT_TEXT} />
                    </span>
                    {pick(it, lang)}
                  </li>
                ))}
              </ul>
            );
          case 'video': {
            const id = youtubeId(pick(block.url, lang));
            return id ? <YouTubeEmbed key={i} id={id} title={title} playLabel={a.playVideo} /> : null;
          }
          case 'link':
            return (
              <p key={i}>
                <a
                  href={pick(block.url, lang)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 min-h-12 px-6 rounded-lg font-heading font-bold text-white bg-(--premium-red) hover:bg-(--premium-red-dark) motion-safe:transition-colors"
                >
                  {pick(block.label, lang)} <FiExternalLink size={16} aria-hidden="true" />
                  <span className="sr-only">({a.newTab})</span>
                </a>
              </p>
            );
          case 'takeaways':
            return (
              <aside key={i} aria-labelledby={`h-takeaways-${i}`} className="mt-4 p-8 flex flex-col gap-3 bg-(--premium-light-grey) dark:bg-(--premium-steel-grey)" style={{ clipPath: 'polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)' }}>
                <h2 id={`h-takeaways-${i}`} className={`font-heading font-black text-xl ${INK}`}>{a.keyTakeaways}</h2>
                <p className={`text-base leading-relaxed ${BODY}`}>{pick(block.text, lang)}</p>
              </aside>
            );
        }
      })}
    </>
  );
}
