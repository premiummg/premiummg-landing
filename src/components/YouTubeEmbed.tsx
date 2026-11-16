import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';

// A YouTube film that costs the visitor nothing until they ask for it: the
// page shows YouTube's still frame and a play button, and only a click loads
// the player (from youtube-nocookie.com, no cookies set). A normal embed pulls
// several hundred KB of third-party script and hands the visitor to Google
// before they have pressed anything.
export function YouTubeEmbed({ id, title, playLabel }: { id: string; title: string; playLabel: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-(--premium-black)">
      {playing ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${playLabel}: ${title}`}
          className="group absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
        >
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute inset-0 bg-black/30 motion-safe:transition-colors group-hover:bg-black/15" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="w-18 h-18 rounded-full grid place-items-center bg-(--premium-red) text-white shadow-lg motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-110">
              <FiPlay size={30} aria-hidden="true" className="ml-1" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
