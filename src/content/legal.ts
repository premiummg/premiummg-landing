import type { L } from './l10n';

// Section headings of the two legal pages, as published on premiummg.ca. The
// legal text itself is NOT reproduced here: it has to be carried over
// unchanged from the current site by whoever owns it, so each section shows a
// visible placeholder until it is.
export interface LegalDoc {
  path: '/terms' | '/privacy';
  updated: L;
  sections: L[];
}

const t = (en: string, fr: string): L => ({ en, fr });

export const LEGAL: Record<'terms' | 'privacy', LegalDoc> = {
  terms: {
    path: '/terms',
    updated: t('Last updated: May 2025', 'Dernière mise à jour : mai 2025'),
    sections: [
      t('Use of the Site', 'Utilisation du site'),
      t('Intellectual Property', 'Propriété intellectuelle'),
      t('User Accounts', 'Comptes d’utilisateur'),
      t('Prohibited Conduct', 'Conduite interdite'),
      t('Third-Party Links', 'Liens vers des tiers'),
      t('Disclaimers', 'Avis de non-responsabilité'),
      t('Limitation of Liability', 'Limitation de responsabilité'),
      t('Indemnification', 'Indemnisation'),
      t('Changes to These Terms', 'Modifications des présentes conditions'),
      t('Governing Law', 'Droit applicable'),
      t('Contact Us', 'Contactez-nous'),
    ],
  },
  privacy: {
    path: '/privacy',
    updated: t('Last updated: September 29, 2025', 'Dernière mise à jour : 29 septembre 2025'),
    sections: [
      t('Information Collection, Use, and Sharing', 'Collecte, utilisation et partage des renseignements'),
      t('Your Consent', 'Votre consentement'),
      t('Security', 'Sécurité'),
      t('Cookies & Remarketing', 'Témoins et remarketing'),
      t('Google Analytics', 'Google Analytics'),
      t('Applicable Law', 'Droit applicable'),
    ],
  },
};
