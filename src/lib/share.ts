// Share-by-link URLs: plain addresses each network publishes for this, so no
// third-party script is loaded and nothing tracks a visitor until they click.
export type ShareNetwork = 'linkedin' | 'facebook' | 'x' | 'whatsapp';

export function shareUrl(network: ShareNetwork, url: string, title: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (network) {
    case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'x': return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case 'whatsapp': return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  }
}
