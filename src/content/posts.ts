import type { ServiceKey } from '../formLimits';
import type { PhotoKey } from './media';
import type { L } from './l10n';
import { CMS } from './cms';

// The blog's articles. Every post below is SAMPLE content written for the
// redesign: it is built only from what Premium's own pages already say, but
// none of it has been published by Premium. `sample: true` makes the blog
// show a visible "Sample content" tag. Real articles come from the Sanity CMS
// (studio/), pulled at build time; once it has one, these are not used.
//
// The shape is deliberately CMS-friendly: a slug, a date, a category, a
// photo, and a body made of typed blocks rather than HTML. The Studio's
// schema (studio/schemaTypes/post.ts) mirrors it field for field.

export type Block =
  | { type: 'p'; text: L }
  | { type: 'h2'; id: string; text: L }
  | { type: 'quote'; text: L }
  | { type: 'list'; items: L[] }
  | { type: 'takeaways'; text: L }
  | { type: 'video'; url: L }
  | { type: 'link'; label: L; url: L };

export type CategoryKey = 'project-updates' | 'site-safety' | 'industry-trends' | 'company' | ServiceKey;

export const POST_CATEGORIES: { key: CategoryKey; label: L }[] = [
  { key: 'project-updates', label: { en: 'Project updates', fr: 'Nouvelles de projets' } },
  { key: 'site-safety', label: { en: 'Site safety', fr: 'Sécurité au chantier' } },
  { key: 'industry-trends', label: { en: 'Industry trends', fr: 'Tendances de l’industrie' } },
  { key: 'company', label: { en: 'Company', fr: 'Notre entreprise' } },
  { key: 'caulking', label: { en: 'Caulking', fr: 'Calfeutrage' } },
  { key: 'firestopping', label: { en: 'Firestopping', fr: 'Coupe-feu' } },
  { key: 'fireproofing', label: { en: 'Fireproofing', fr: 'Ignifugation' } },
  { key: 'drywall', label: { en: 'Drywall', fr: 'Cloisons sèches' } },
];

export interface Post {
  slug: string;
  sample: boolean;
  date: string; // YYYY-MM-DD
  category: CategoryKey;
  // The service the article sends a reader to at the end. Null for posts that
  // are not about a service (company news, social media): the closing card
  // then invites a general estimate request.
  service: ServiceKey | null;
  photo: PhotoKey | null;
  // Set by the CMS: a full image URL that replaces `photo`.
  photoUrl?: string;
  photoAlt: string;
  photoCaption?: L;
  readMinutes: number;
  // Who wrote it: the name of the Studio account that created the article.
  // Empty: the company name (and, on the sample posts, a visible placeholder).
  author?: string;
  title: L;
  excerpt: L;
  body: Block[];
}

const t = (en: string, fr: string): L => ({ en, fr });
const p = (en: string, fr: string): Block => ({ type: 'p', text: t(en, fr) });
const h2 = (id: string, en: string, fr: string): Block => ({ type: 'h2', id, text: t(en, fr) });

const SAMPLE_POSTS: Post[] = [
  {
    slug: 'fireproofing-structural-steel-before-close-in',
    sample: true,
    date: '2026-11-10',
    category: 'project-updates',
    service: 'fireproofing',
    photo: 'fireproofing',
    photoAlt: 'Technician in full protective suit spraying fireproofing onto a steel deck',
    photoCaption: t('Spray-applied fireproofing inside a contained work area.', 'Ignifugation projetée dans une zone de travail confinée.'),
    readMinutes: 5,
    title: t('Site update: fireproofing structural steel ahead of close-in', 'Nouvelles du chantier : ignifuger l’acier de structure avant la fermeture'),
    excerpt: t(
      'What a spray-applied fireproofing shift looks like from containment to final thickness checks, and why the sequence matters to every trade that follows.',
      'À quoi ressemble un quart d’ignifugation projetée, du confinement aux vérifications finales d’épaisseur, et pourquoi la séquence compte pour chaque corps de métier qui suit.',
    ),
    body: [
      p('Fireproofing is one of the few scopes on a job that nobody sees once the building is finished, and one of the few that an inspector will measure. This is what a shift looks like when it is done to the listing.',
        'L’ignifugation est l’un des rares travaux que personne ne voit une fois le bâtiment terminé, et l’un des rares qu’un inspecteur mesurera. Voici à quoi ressemble un quart de travail réalisé selon la fiche.'),
      h2('containment', 'Containment comes first', 'Le confinement d’abord'),
      p('Before any material is mixed, the work area is enclosed and the surfaces are prepared for adhesion. Coordination with the other trades happens here, so access to the structural elements is clear and nobody is working underneath the spray.',
        'Avant de mélanger quoi que ce soit, la zone est confinée et les surfaces sont préparées pour l’adhérence. La coordination avec les autres métiers se fait à ce moment, afin que l’accès aux éléments de structure soit libre et que personne ne travaille sous la projection.'),
      h2('application', 'Application to the assembly', 'Application selon l’assemblage'),
      p('Certified technicians apply the material to the manufacturer’s guidelines and the UL assembly specification. The aim is uniform coverage and consistent thickness on every member, not just the ones that are easy to reach.',
        'Des techniciens certifiés appliquent le matériau selon les directives du fabricant et la spécification d’assemblage UL. L’objectif : une couverture uniforme et une épaisseur constante sur chaque élément, pas seulement sur ceux qui sont faciles d’accès.'),
      { type: 'quote', text: t('Thickness is measured, recorded and handed over. It is never assumed.', 'L’épaisseur est mesurée, consignée et remise. Elle n’est jamais présumée.') },
      h2('thickness', 'Thickness is measured, not assumed', 'L’épaisseur se mesure, elle ne se présume pas'),
      p('Quality control follows the application. Wet and dry film thickness is tested to ASTM standards, and a third-party inspection is coordinated where the project calls for one.',
        'Le contrôle de la qualité suit l’application. L’épaisseur du film humide et sec est vérifiée selon les normes ASTM, et une inspection par un tiers est coordonnée lorsque le projet l’exige.'),
      { type: 'list', items: [
        t('Surfaces prepared for adhesion', 'Surfaces préparées pour l’adhérence'),
        t('Applied to the UL assembly specification', 'Application selon la spécification d’assemblage UL'),
        t('Film thickness tested to ASTM standards', 'Épaisseur du film vérifiée selon les normes ASTM'),
        t('Third-party inspection coordinated as needed', 'Inspection par un tiers coordonnée au besoin'),
      ] },
      h2('next-trade', 'What the next trade needs to know', 'Ce que le métier suivant doit savoir'),
      p('A final walk-through with the client’s team closes out the scope and deals with punch items. After that, the protection has to stay intact: anything fixed to the steel later needs to be coordinated, not improvised.',
        'Une visite finale avec l’équipe du client clôt les travaux et règle les déficiences. Ensuite, la protection doit rester intacte : tout ce qui sera fixé à l’acier plus tard doit être coordonné, pas improvisé.'),
      { type: 'takeaways', text: t(
        'Sequence the fireproofing before close-in, give the crew clear access, and ask for the thickness records with your closeout package.',
        'Planifiez l’ignifugation avant la fermeture, donnez à l’équipe un accès dégagé et demandez les relevés d’épaisseur avec votre dossier de livraison.',
      ) },
    ],
  },
  {
    slug: 'working-at-height-lift-checks',
    sample: true,
    date: '2026-10-27',
    category: 'site-safety',
    service: 'caulking',
    photo: 'lift',
    photoAlt: 'Premium technician in hi-vis gear operating a boom lift beside a multi-storey building',
    readMinutes: 4,
    title: t('Working at height: the checks our lift crews run before the first joint is sealed', 'Travail en hauteur : les vérifications de nos équipes avant de sceller le premier joint'),
    excerpt: t(
      'Harness, anchor, ground conditions, exclusion zone. The pre-use routine behind every day of envelope work on a boom lift.',
      'Harnais, ancrage, état du sol, zone d’exclusion. La routine préalable derrière chaque journée de travaux d’enveloppe sur une nacelle.',
    ),
    body: [
      p('High-rise caulking is only as good as the access that gets a technician to the joint. Every shift on a lift starts on the ground.',
        'Le calfeutrage en hauteur ne vaut que l’accès qui mène le technicien au joint. Chaque quart sur une nacelle commence au sol.'),
      h2('before', 'Before the lift moves', 'Avant que la nacelle bouge'),
      { type: 'list', items: [
        t('Harness and lanyard inspected', 'Harnais et longe inspectés'),
        t('Anchor point confirmed', 'Point d’ancrage confirmé'),
        t('Ground conditions checked', 'État du sol vérifié'),
        t('Exclusion zone set below the work', 'Zone d’exclusion établie sous les travaux'),
      ] },
      h2('cor', 'Why it is written down', 'Pourquoi c’est consigné'),
      p('Premium works under the Certificate of Recognition (COR) program, which means the safety routine is documented, audited and repeated, not left to memory.',
        'Premium travaille dans le cadre du programme de Certificat de reconnaissance (COR) : la routine de sécurité est documentée, auditée et répétée, pas laissée à la mémoire.'),
    ],
  },
  {
    slug: 'firestop-documentation-at-closeout',
    sample: true,
    date: '2026-10-13',
    category: 'industry-trends',
    service: 'firestopping',
    photo: 'firestop',
    photoAlt: 'Conduits and pipes passing through a firestopped floor penetration',
    readMinutes: 6,
    title: t('What general contractors should know about firestop documentation at closeout', 'Ce que les entrepreneurs généraux doivent savoir sur la documentation coupe-feu à la livraison'),
    excerpt: t(
      'Inspectors are asking for more than photos. A plain-language look at the records a rated assembly needs before the wall closes.',
      'Les inspecteurs demandent plus que des photos. Un regard simple sur les dossiers qu’exige un assemblage coté avant la fermeture du mur.',
    ),
    body: [
      p('A firestopped penetration is hidden the day the wall closes. What stays visible is the record of what was installed, where, and to which tested system.',
        'Une pénétration coupe-feu disparaît le jour où le mur se ferme. Ce qui reste visible, c’est le dossier de ce qui a été installé, où et selon quel système testé.'),
      h2('what', 'What the record covers', 'Ce que couvre le dossier'),
      p('Assessment, system design, installation, testing and certification: each step leaves something an inspector can check.',
        'Évaluation, conception du système, installation, essais et certification : chaque étape laisse une trace que l’inspecteur peut vérifier.'),
    ],
  },
  {
    slug: 'commercial-vs-industrial-caulking',
    sample: true,
    date: '2026-09-29',
    category: 'caulking',
    service: 'caulking',
    photo: 'facade',
    photoAlt: 'Multi-storey building facade seen from below with a swing stage in place',
    readMinutes: 5,
    title: t('Commercial vs. industrial caulking: choosing the right sealant for the joint', 'Calfeutrage commercial ou industriel : choisir le bon scellant pour le joint'),
    excerpt: t(
      'Movement, exposure and substrate decide the product. How joints get assessed before a single tube is opened.',
      'Le mouvement, l’exposition et le support déterminent le produit. Comment les joints sont évalués avant d’ouvrir un seul tube.',
    ),
    body: [
      p('Control joints are engineered to handle expansion, contraction and vibration, and the sealant in them has to match that movement.',
        'Les joints de contrôle sont conçus pour absorber la dilatation, la contraction et les vibrations, et le scellant doit suivre ce mouvement.'),
    ],
  },
  {
    slug: 'spray-applied-or-intumescent',
    sample: true,
    date: '2026-09-15',
    category: 'fireproofing',
    service: 'fireproofing',
    photo: 'spray',
    photoAlt: 'Fireproofing being sprayed onto the underside of a steel deck',
    readMinutes: 7,
    title: t('Spray-applied or intumescent? How fireproofing gets specified', 'Projetée ou intumescente ? Comment l’ignifugation est prescrite'),
    excerpt: t(
      'Two ways to protect structural steel, two very different finishes. Where each one fits and what drives the choice.',
      'Deux façons de protéger l’acier de structure, deux finis très différents. Où chacune convient et ce qui guide le choix.',
    ),
    body: [
      p('Materials are chosen by project type, fire rating and exposure. Systems can deliver up to 4 hours of fire resistance, depending on the assembly.',
        'Les matériaux sont choisis selon le type de projet, le degré de résistance et l’exposition. Les systèmes offrent jusqu’à 4 heures de résistance au feu, selon l’assemblage.'),
    ],
  },
  {
    slug: 'sequencing-drywall-around-other-trades',
    sample: true,
    date: '2026-09-01',
    category: 'drywall',
    service: 'drywall',
    photo: null,
    photoAlt: 'Drywall photo',
    readMinutes: 4,
    title: t('Sequencing drywall around the trades already on site', 'Séquencer les cloisons sèches autour des métiers déjà sur place'),
    excerpt: t(
      'Boarding too early costs rework; too late costs the schedule. How framing, boarding and finishing are planned around everyone else.',
      'Poser trop tôt entraîne des reprises ; trop tard, des retards. Comment l’ossature, la pose et la finition se planifient autour des autres.',
    ),
    body: [
      p('We work with general contractors and other trades on a tight schedule, with flexibility and communication.',
        'Nous travaillons avec les entrepreneurs généraux et les autres métiers selon un échéancier serré, avec souplesse et communication.'),
    ],
  },
  {
    slug: 'what-cor-certification-means',
    sample: true,
    date: '2026-08-18',
    category: 'site-safety',
    service: 'contracting',
    photo: null,
    photoAlt: 'Site safety photo',
    readMinutes: 5,
    title: t('What a COR certification means for the people on your site', 'Ce que la certification COR signifie pour les gens sur votre chantier'),
    excerpt: t(
      'The Certificate of Recognition is more than a logo on a bid. What the audit covers and how it shows up day to day.',
      'Le Certificat de reconnaissance est plus qu’un logo sur une soumission. Ce que couvre l’audit et comment il se vit au quotidien.',
    ),
    body: [
      p('Premium is certified under the Certificate of Recognition (COR) program across Atlantic Canada.',
        'Premium est certifié dans le cadre du programme de Certificat de reconnaissance (COR) partout au Canada atlantique.'),
    ],
  },
];

// What the CMS holds, or the sample articles above while it holds none.
export const POSTS: Post[] = CMS.posts ?? SAMPLE_POSTS;

// Newest first, whatever order they were written in above.
export const SORTED_POSTS = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
export const postBySlug = (slug: string) => POSTS.find(post => post.slug === slug);
export const categoryLabel = (key: CategoryKey) => POST_CATEGORIES.find(c => c.key === key)!.label;
