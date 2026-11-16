import { createContext, useContext } from 'react';
import { EN, type Copy, type Lang } from './copy';

export const LangCtx = createContext<{ t: Copy; lang: Lang }>({ t: EN, lang: 'en' });
/** The copy and the language of the page being rendered. */
export const useT = () => useContext(LangCtx);
