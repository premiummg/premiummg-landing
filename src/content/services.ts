import type { ServiceKey } from '../formLimits';
import type { PhotoKey } from './media';
import type { L } from './l10n';
import { CMS } from './cms';
import { applyServiceOverride } from '../../studio/schemaTypes/contentModel';

// The five service pages. Headings and the substance of every item come from
// the matching page on premiummg.ca (/caulking, /firestopping, /fireproofing,
// /drywalling, /contracting); the French is a new translation. Drywall's
// "Code Compliance" and "Insurance Requirements" steps were left out: on the
// live site they describe firestopping and name "Premium Caulking", which
// reads as a copy-paste from another page.

export interface Item {
  title: L;
  body: L;
}

export interface Service {
  key: ServiceKey;
  // The slug the live site used, so vercel.json can redirect it here.
  legacySlug: string;
  name: L;
  // One line for the home page card.
  card: L;
  photo: PhotoKey | null;
  // Set by the Studio: the service's own picture, replacing `photo`.
  photoUrl?: string;
  photoAlt: string;
  h1: L;
  intro: L;
  badge?: L;
  stat?: { value: string; label: L };
  offer?: { title: L; items: Item[] };
  benefits?: { title: L; items: Item[] };
  process?: { title: L; items: Item[] };
  // Order of the two lists on the page: the live site leads with benefits on
  // some pages and with the process on others.
  benefitsFirst?: boolean;
  faq?: { q: L; a: L }[];
}

const t = (en: string, fr: string): L => ({ en, fr });

export const DEFAULT_SERVICES: Service[] = [
  {
    key: 'caulking',
    legacySlug: 'caulking',
    name: t('Caulking', 'Calfeutrage'),
    card: t(
      'Sealed joints, expansion gaps and building envelopes. Specified product, specified depth, documented on completion.',
      'Joints scellés, joints de dilatation et enveloppe du bâtiment. Produit prescrit, profondeur prescrite, documenté à la fin.',
    ),
    photo: 'lift',
    photoAlt: 'Premium technician on a boom lift preparing to seal a building envelope',
    h1: t('Protect Joints, Extend Life', 'Protégez les joints, prolongez la durée de vie'),
    intro: t(
      'High-grade sealants and a skilled team with advanced equipment, for projects of any size.',
      'Des scellants de haute qualité et une équipe qualifiée dotée d’équipement de pointe, pour des projets de toute taille.',
    ),
    offer: {
      title: t('What Do We Offer?', 'Que proposons-nous ?'),
      items: [
        { title: t('Walkways', 'Allées piétonnes'), body: t('Filling cracks and movement gaps in sidewalks and slabs keeps moisture out and extends the life of the structure.', 'Le remplissage des fissures et des joints de mouvement des trottoirs et des dalles empêche l’humidité de pénétrer et prolonge la vie de la structure.') },
        { title: t('Joint Filling', 'Remplissage de joints'), body: t('Suitable fillers in interior concrete slab joints cut warehouse downtime during repairs and prevent concrete from chipping or flaking.', 'Des produits adaptés dans les joints de dalles de béton intérieures réduisent les arrêts d’entrepôt et empêchent le béton de s’écailler.') },
        { title: t('Structural Glazing / Cap Beads', 'Vitrage structural / cordons de finition'), body: t('A building system that attaches glass to the frame using specially engineered silicones.', 'Un système qui fixe le verre à la structure du bâtiment au moyen de silicones spécialement conçus.') },
        { title: t('Windows (Exterior and Interior)', 'Fenêtres (extérieur et intérieur)'), body: t('High-grade sealants that keep water out of new and existing buildings.', 'Des scellants de haute qualité qui gardent l’eau hors des bâtiments neufs et existants.') },
        { title: t('Heritage Projects', 'Projets patrimoniaux'), body: t('Caulking of stonework, stone stairs and heritage buildings to prevent water damage and improve appearance.', 'Calfeutrage de maçonnerie de pierre, d’escaliers de pierre et de bâtiments patrimoniaux pour prévenir les dégâts d’eau et améliorer l’apparence.') },
        { title: t('Skylights / Solariums', 'Puits de lumière / solariums'), body: t('Proper skylight sealing helps prevent leaks and unexpected damage.', 'Un scellement adéquat des puits de lumière aide à prévenir les fuites et les dommages imprévus.') },
        { title: t('Stone', 'Pierre'), body: t('Sealing stone, granite and marble panels blocks water intrusion and extends the life of the cladding.', 'Le scellement des panneaux de pierre, de granit et de marbre bloque l’infiltration d’eau et prolonge la vie du revêtement.') },
        { title: t('Sunroom Caulking', 'Calfeutrage de verrières'), body: t('Keeping a sunroom dry depends on properly maintaining its sealant system.', 'Garder une verrière au sec dépend du bon entretien de son système de scellement.') },
        { title: t('High-Rise Caulking', 'Calfeutrage en hauteur'), body: t('A skilled team with advanced equipment handles projects of any size, including high-rise work.', 'Une équipe qualifiée et un équipement de pointe pour des projets de toute taille, y compris en grande hauteur.') },
        { title: t('Preventative Maintenance', 'Entretien préventif'), body: t('Maintaining sealants helps minimize the cost of potential damage to your property. Protection systems for any application.', 'L’entretien des scellants aide à réduire le coût des dommages potentiels à votre propriété. Des systèmes de protection pour toute application.') },
        { title: t('Swimming Pools', 'Piscines'), body: t('Specialty caulking protects pools from damage caused by expansion and contraction with temperature changes.', 'Un calfeutrage spécialisé protège les piscines des dommages causés par la dilatation et la contraction thermiques.') },
        { title: t('Control and Expansion Joints', 'Joints de contrôle et de dilatation'), body: t('Control joints are engineered to handle expansion, contraction and vibration.', 'Les joints de contrôle sont conçus pour absorber la dilatation, la contraction et les vibrations.') },
        { title: t('Restoration and Sealers', 'Restauration et scellants'), body: t('Restoration work is improved by removing worn-out sealants and installing top-quality sealants.', 'Les travaux de restauration sont améliorés par le retrait des scellants usés et la pose de scellants de première qualité.') },
      ],
    },
  },
  {
    key: 'firestopping',
    legacySlug: 'firestopping',
    name: t('Firestopping', 'Coupe-feu'),
    card: t(
      'UL-certified systems at every penetration through a rated assembly, installed to the listing and inspected before close-in.',
      'Systèmes certifiés UL à chaque pénétration d’un assemblage coté, installés selon la fiche et inspectés avant la fermeture.',
    ),
    photo: 'firestop',
    photoAlt: 'Conduits and pipes passing through a firestopped penetration',
    h1: t('Firestop & Smoke Sealing for Safety & Strength', 'Coupe-feu et étanchéité à la fumée pour la sécurité et la solidité'),
    intro: t(
      'Life safety through firestopping that stops fire and smoke from spreading early.',
      'La sécurité des personnes grâce à un coupe-feu qui arrête tôt la propagation du feu et de la fumée.',
    ),
    badge: t('Atlantic Canada’s first ULC-Certified Firestop Contractor', 'Premier entrepreneur coupe-feu certifié ULC au Canada atlantique'),
    process: {
      title: t('What we do', 'Ce que nous faisons'),
      items: [
        { title: t('Assessment', 'Évaluation'), body: t('We review the building’s fire protection needs: applicable codes, occupancy type, required fire ratings and the specific hazards present.', 'Nous évaluons les besoins de protection incendie du bâtiment : codes applicables, type d’occupation, degrés de résistance exigés et risques présents.') },
        { title: t('System Design', 'Conception du système'), body: t('A firestopping plan specifies where fire-rated materials go: barriers, sealants, sprays and wraps.', 'Un plan coupe-feu précise où vont les matériaux cotés : barrières, scellants, produits projetés et enveloppes.') },
        { title: t('Installation', 'Installation'), body: t('Trained crews apply fire-resistant materials to pipe and cable penetrations, ductwork, electrical outlets and other openings in walls, floors and ceilings.', 'Des équipes formées appliquent les matériaux résistants au feu aux pénétrations de tuyaux et de câbles, aux conduits, aux prises électriques et aux autres ouvertures des murs, planchers et plafonds.') },
        { title: t('Testing and Certification', 'Essais et certification'), body: t('Tests confirm fire ratings and regulatory compliance.', 'Des essais confirment les degrés de résistance au feu et la conformité réglementaire.') },
        { title: t('Maintenance and Inspections', 'Entretien et inspections'), body: t('Ongoing upkeep keeps the systems functional.', 'Un entretien continu garde les systèmes fonctionnels.') },
      ],
    },
    benefits: {
      title: t('Now, Why Is Firestopping Beneficial?', 'Pourquoi le coupe-feu est-il avantageux ?'),
      items: [
        { title: t('Life Safety', 'Sécurité des personnes'), body: t('Contains fire and slows its spread, giving occupants more time to get out.', 'Confine le feu et ralentit sa propagation, donnant aux occupants plus de temps pour sortir.') },
        { title: t('Property Protection', 'Protection des biens'), body: t('Keeps fire in its area of origin, limiting damage and making firefighting easier.', 'Garde le feu dans sa zone d’origine, limite les dommages et facilite l’intervention.') },
        { title: t('Code Compliance', 'Conformité aux codes'), body: t('Helps buildings meet fire codes and regulations, avoiding penalties and legal exposure.', 'Aide les bâtiments à respecter les codes et règlements d’incendie, évitant sanctions et risques juridiques.') },
        { title: t('Insurance Requirements', 'Exigences d’assurance'), body: t('Many policies require adequate fire protection. Firestopping can help satisfy that and may lower premiums.', 'Bien des polices exigent une protection incendie adéquate. Le coupe-feu aide à y répondre et peut réduire les primes.') },
        { title: t('Business Continuity', 'Continuité des affaires'), body: t('Less fire damage means less downtime and a faster return to normal operations.', 'Moins de dommages signifie moins d’arrêts et un retour plus rapide aux activités normales.') },
      ],
    },
    faq: [
      { q: t('What is firestopping, and why is it important?', 'Qu’est-ce que le coupe-feu et pourquoi est-ce important ?'), a: t('Sealing openings in fire-rated walls, floors and ceilings with fire-resistant materials, which protects occupants and limits property damage.', 'Le scellement des ouvertures dans les murs, planchers et plafonds cotés au moyen de matériaux résistants au feu, ce qui protège les occupants et limite les dommages matériels.') },
      { q: t('What are the benefits of firestopping in commercial buildings?', 'Quels sont les avantages du coupe-feu dans les bâtiments commerciaux ?'), a: t('Life safety, property protection, code compliance, meeting insurance requirements and business continuity.', 'La sécurité des personnes, la protection des biens, la conformité aux codes, le respect des exigences d’assurance et la continuité des affaires.') },
      { q: t('What services do firestopping contractors provide?', 'Quels services offrent les entrepreneurs en coupe-feu ?'), a: t('Assessment, system design, installation, testing and certification, and maintenance and inspections.', 'L’évaluation, la conception du système, l’installation, les essais et la certification, ainsi que l’entretien et les inspections.') },
    ],
  },
  {
    key: 'fireproofing',
    legacySlug: 'fireproofing',
    name: t('Fireproofing', 'Ignifugation'),
    card: t(
      'Spray-applied and intumescent protection that holds structural steel to its rated hour.',
      'Protection projetée et intumescente qui maintient l’acier de structure à son degré de résistance.',
    ),
    photo: 'fireproofing',
    photoAlt: 'Technician in a protective suit spraying fireproofing onto a steel deck',
    h1: t('Ensuring Safety and Resilience Through Fireproofing', 'Assurer la sécurité et la résilience par l’ignifugation'),
    intro: t(
      'Certified technicians apply fireproofing to manufacturer guidelines and UL assembly specifications.',
      'Des techniciens certifiés appliquent l’ignifugation selon les directives des fabricants et les spécifications d’assemblage UL.',
    ),
    stat: { value: '4 h', label: t('Up to 4 hours of fire resistance, depending on the system', 'Jusqu’à 4 heures de résistance au feu, selon le système') },
    benefitsFirst: true,
    benefits: {
      title: t('Why Fireproofing Matters', 'Pourquoi l’ignifugation compte'),
      items: [
        { title: t('Code compliance', 'Conformité aux codes'), body: t('Helps the building meet local and national fire codes.', 'Aide le bâtiment à respecter les codes d’incendie locaux et nationaux.') },
        { title: t('Structural integrity', 'Intégrité structurale'), body: t('Helps the structural frame hold its integrity during a fire.', 'Aide l’ossature à conserver son intégrité pendant un incendie.') },
        { title: t('Required by construction type', 'Exigée selon le type de construction'), body: t('Required in most Type I and Type II construction projects.', 'Exigée dans la plupart des projets de construction de type I et de type II.') },
      ],
    },
    process: {
      title: t('Our Process', 'Notre processus'),
      items: [
        { title: t('Project Review & Scope Assessment', 'Revue du projet et évaluation de la portée'), body: t('We review plans, fire protection requirements and specifications, and work with the GC, engineers and architects to confirm code targets (IBC, NFPA, UL and others).', 'Nous examinons les plans, les exigences de protection incendie et le devis, et travaillons avec l’entrepreneur général, les ingénieurs et les architectes pour confirmer les cibles de code (IBC, NFPA, UL et autres).') },
        { title: t('Material Selection & Specification Matching', 'Choix des matériaux et conformité au devis'), body: t('Materials are recommended and sourced by project type, fire rating and exposure: SFRMs, intumescent coatings and firestop systems from trusted manufacturers.', 'Les matériaux sont recommandés et fournis selon le type de projet, le degré de résistance et l’exposition : SFRM, revêtements intumescents et systèmes coupe-feu de fabricants reconnus.') },
        { title: t('Site Prep & Coordination', 'Préparation du site et coordination'), body: t('We coordinate with other trades to avoid schedule conflicts and secure access to structural elements. Surfaces are prepared for adhesion.', 'Nous coordonnons avec les autres métiers pour éviter les conflits d’horaire et assurer l’accès aux éléments de structure. Les surfaces sont préparées pour l’adhérence.') },
        { title: t('Professional Application', 'Application professionnelle'), body: t('Certified technicians apply fireproofing materials with current spray equipment for uniform coverage and consistent thickness.', 'Des techniciens certifiés appliquent les matériaux avec un équipement de projection actuel pour une couverture uniforme et une épaisseur constante.') },
        { title: t('Quality Control & Inspection', 'Contrôle de la qualité et inspection'), body: t('Inspections and wet and dry film thickness testing follow ASTM standards. Third-party inspection is coordinated as needed.', 'Les inspections et les mesures d’épaisseur de film humide et sec suivent les normes ASTM. Une inspection par un tiers est coordonnée au besoin.') },
        { title: t('Project Closeout & Follow-Up', 'Clôture du projet et suivi'), body: t('A final walk-through with your team addresses punch items. We remain available for warranty information, maintenance or retrofits.', 'Une visite finale avec votre équipe règle les déficiences. Nous restons disponibles pour la garantie, l’entretien ou les mises à niveau.') },
      ],
    },
  },
  {
    key: 'drywall',
    legacySlug: 'drywalling',
    name: t('Drywall', 'Cloisons sèches'),
    card: t(
      'Framing, boarding and finishing to the level your spec calls for, sequenced around the trades already on site.',
      'Ossature, pose et finition au niveau exigé par le devis, séquencées autour des corps de métier déjà sur place.',
    ),
    photo: null,
    photoAlt: 'Drywall project photo',
    h1: t('We Ensure Expert Walls for Expert Builds.', 'Des murs d’experts pour des constructions d’experts.'),
    intro: t(
      'Precision-built drywall solutions, made to specification. Framing, boarding, taping, finishing and soundproofing, done right the first time, on schedule and on budget.',
      'Des solutions de cloisons sèches réalisées avec précision, selon le devis. Ossature, pose, tirage de joints, finition et insonorisation, bien faites du premier coup, dans les délais et le budget.',
    ),
    benefitsFirst: true,
    offer: {
      title: t('What we install', 'Ce que nous installons'),
      items: [
        { title: t('Drywall Installation', 'Pose de cloisons sèches'), body: t('Precision installation for small projects and large commercial builds, producing smooth walls and ceilings ready for finishing.', 'Une pose précise pour les petits projets comme les grands chantiers commerciaux, pour des murs et plafonds lisses prêts à finir.') },
        { title: t('Taping & Finishing', 'Tirage de joints et finition'), body: t('Joint compound, tape and sanding create seamless surfaces ready for paint or texture.', 'Composé à joints, ruban et ponçage créent des surfaces sans raccord, prêtes pour la peinture ou la texture.') },
        { title: t('T-Bar Ceiling Installations', 'Plafonds suspendus à profilés en T'), body: t('Suspended T-bar ceilings for commercial and institutional spaces that stay accessible for utilities.', 'Des plafonds suspendus pour espaces commerciaux et institutionnels, qui restent accessibles pour les services.') },
        { title: t('Steel Studs', 'Montants d’acier'), body: t('Steel stud framing that is durable, precise and built with fire-resistant materials.', 'Une ossature à montants d’acier durable, précise et faite de matériaux résistants au feu.') },
      ],
    },
    benefits: {
      title: t('Why choose Premium', 'Pourquoi choisir Premium'),
      items: [
        { title: t('Proven Commercial Expertise', 'Expertise commerciale éprouvée'), body: t('Commercial drywall for office buildings, retail, healthcare and large developments, with an understanding of timelines, specifications and trade coordination.', 'Cloisons sèches commerciales pour bureaux, commerces, soins de santé et grands projets, avec la maîtrise des échéanciers, des devis et de la coordination des métiers.') },
        { title: t('Responsive & Reliable Communication', 'Communication réactive et fiable'), body: t('You’ll always know where we stand. Available, responsive and honest from planning through closeout.', 'Vous saurez toujours où nous en sommes. Disponibles, réactifs et honnêtes, de la planification à la clôture.') },
        { title: t('Precision & Quality Workmanship', 'Précision et qualité d’exécution'), body: t('Clean, consistent work that meets or exceeds industry standards, from framing through finishing.', 'Un travail propre et constant qui respecte ou dépasse les normes de l’industrie, de l’ossature à la finition.') },
      ],
    },
    process: {
      title: t('What we do', 'Ce que nous faisons'),
      items: [
        { title: t('Consultation & Site Walk', 'Consultation et visite du site'), body: t('We meet on site to review plans, assess conditions and align on goals, timeline and budget, so challenges surface early.', 'Nous nous rencontrons sur place pour revoir les plans, évaluer les conditions et convenir des objectifs, de l’échéancier et du budget.') },
        { title: t('Scheduling & Coordination', 'Planification et coordination'), body: t('We work with general contractors and other trades on a tight schedule, with flexibility and communication.', 'Nous travaillons avec les entrepreneurs généraux et les autres métiers selon un échéancier serré, avec souplesse et communication.') },
        { title: t('Framing & Drywall Installation', 'Ossature et pose'), body: t('Crews handle metal stud framing, drywall hanging and related components to commercial codes and safety protocols.', 'Nos équipes réalisent l’ossature métallique, la pose et les composants connexes selon les codes commerciaux et les protocoles de sécurité.') },
        { title: t('Quality Control & Final Walkthrough', 'Contrôle de la qualité et visite finale'), body: t('A thorough inspection confirms the work meets spec, followed by a site walkthrough with you for final touch-ups.', 'Une inspection complète confirme la conformité au devis, suivie d’une visite avec vous pour les retouches finales.') },
      ],
    },
  },
  {
    key: 'contracting',
    legacySlug: 'contracting',
    name: t('Contracting', 'Entrepreneur général'),
    card: t(
      'One contract across the full fire-and-envelope scope, so the trades that overlap answer to one number.',
      'Un seul contrat pour tous les travaux coupe-feu et d’enveloppe : les métiers qui se chevauchent répondent à un seul numéro.',
    ),
    photo: 'facade',
    photoAlt: 'Multi-storey building under construction seen from below',
    h1: t('Commercial Renovation Contractors Across the Atlantic Provinces', 'Entrepreneurs en rénovation commerciale dans les provinces de l’Atlantique'),
    intro: t(
      'Offices, retail spaces and other commercial properties, delivered on time and on budget. We don’t just renovate spaces: we help businesses thrive.',
      'Bureaux, commerces et autres propriétés commerciales, livrés dans les délais et le budget. Nous ne faisons pas que rénover des espaces : nous aidons les entreprises à prospérer.',
    ),
    process: {
      title: t('Here’s an overview of what we’ll typically do', 'Voici un aperçu de ce que nous faisons habituellement'),
      items: [
        { title: t('Consultation & Planning', 'Consultation et planification'), body: t('We work with you on goals, budget and timeline, and help develop renovation plans that fit your needs.', 'Nous travaillons avec vous sur les objectifs, le budget et l’échéancier, et aidons à élaborer des plans adaptés à vos besoins.') },
        { title: t('Design & Engineering', 'Conception et ingénierie'), body: t('We work with architects, engineers and designers on detailed plans covering structure, codes and accessibility, or from your existing plans.', 'Nous travaillons avec architectes, ingénieurs et designers sur des plans détaillés couvrant la structure, les codes et l’accessibilité, ou à partir de vos plans.') },
        { title: t('Permitting and Approvals', 'Permis et approbations'), body: t('We help obtain the required permits and approvals from local authorities before work begins.', 'Nous aidons à obtenir les permis et approbations requis des autorités locales avant le début des travaux.') },
        { title: t('Demolition and Construction', 'Démolition et construction'), body: t('From tearing out old structures to installing new walls, flooring, lighting and systems.', 'Du retrait des anciennes structures à l’installation de nouveaux murs, planchers, éclairage et systèmes.') },
        { title: t('Finishing and Detailing', 'Finition et détails'), body: t('Paint, flooring, countertops, cabinetry and decorative elements, matched to your specifications.', 'Peinture, planchers, comptoirs, armoires et éléments décoratifs, conformes à vos spécifications.') },
        { title: t('Project Management', 'Gestion de projet'), body: t('We coordinate subcontractors, suppliers and stakeholders, overseeing scheduling, budgeting and logistics.', 'Nous coordonnons sous-traitants, fournisseurs et intervenants, et supervisons l’échéancier, le budget et la logistique.') },
        { title: t('Quality Control and Inspections', 'Contrôle de la qualité et inspections'), body: t('Quality checks and inspections throughout the project confirm the work meets the agreed plans and specifications.', 'Des contrôles et inspections tout au long du projet confirment que le travail respecte les plans et devis convenus.') },
      ],
    },
    benefits: {
      title: t('Why Is Hiring Premium Group as Your Commercial Renovation Contractor Beneficial?', 'Pourquoi confier votre rénovation commerciale à Premium Group ?'),
      items: [
        { title: t('Enhanced Functionality', 'Fonctionnalité accrue'), body: t('Optimized layouts and workflow that adapt to changing needs and improve efficiency.', 'Des aménagements et des flux optimisés qui s’adaptent aux besoins et améliorent l’efficacité.') },
        { title: t('Improved Aesthetics', 'Esthétique améliorée'), body: t('Outdated properties become modern spaces that reflect the brand.', 'Des propriétés désuètes deviennent des espaces modernes à l’image de la marque.') },
        { title: t('Increased Property Value', 'Valeur immobilière accrue'), body: t('Renovation can raise market value and make properties more attractive to buyers or tenants.', 'La rénovation peut hausser la valeur marchande et rendre les propriétés plus attrayantes pour acheteurs et locataires.') },
        { title: t('Compliance and Safety', 'Conformité et sécurité'), body: t('Spaces meet building codes, safety rules and accessibility standards.', 'Des espaces conformes aux codes du bâtiment, aux règles de sécurité et aux normes d’accessibilité.') },
        { title: t('Cost Savings', 'Économies'), body: t('Long-term savings through better energy efficiency, lower maintenance and longer-lasting systems.', 'Des économies à long terme grâce à une meilleure efficacité énergétique, moins d’entretien et des systèmes plus durables.') },
        { title: t('Competitive Advantage', 'Avantage concurrentiel'), body: t('Renovated properties stand out and attract customers, tenants and investors.', 'Les propriétés rénovées se démarquent et attirent clients, locataires et investisseurs.') },
      ],
    },
  },
];

// What the CMS holds for each service page lies over the code's default; a
// service with no document keeps the default whole.
export const SERVICES: Service[] = DEFAULT_SERVICES.map(s => applyServiceOverride(s, CMS.services?.[s.key]));

export const serviceByKey = (key: string) => SERVICES.find(s => s.key === key);
