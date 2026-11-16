// Surface and ink classes shared by every section, taken from BRAND.md's own
// ramp so nothing here is a new colour: the page alternates two grounds so no
// two neighbouring bands share one, and a card always sits one step up the
// ramp from the band it is on.
export const BAND_PANEL = 'bg-white dark:bg-(--premium-dark-grey)';
export const BAND_GROUND = 'bg-(--premium-light-grey) dark:bg-(--premium-black)';
export const CARD_ON_PANEL = 'bg-white dark:bg-(--premium-steel-grey) border border-gray-200 dark:border-white/10';
export const CARD_ON_GROUND = 'bg-white dark:bg-(--premium-dark-grey) border border-gray-200 dark:border-white/10';
export const INK = 'text-(--premium-black) dark:text-white';
export const BODY = 'text-gray-600 dark:text-gray-300';
// Red as TEXT on a page background: SECONDARY red in light mode (MAIN red is
// 4.1:1 on light grey, under AA), and a lighter tint of MAIN red in dark mode
// (#A51E26 on #212121 is unreadable). Same mix NumberedCard uses.
export const ACCENT_TEXT = 'text-(--premium-red-dark) dark:text-[#F0797D]';
export const CONTAINER = 'max-w-6xl mx-auto px-6';
export const SECTION_PAD = 'py-20 md:py-24';
