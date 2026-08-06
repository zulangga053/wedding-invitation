'use client';

import { useRef, useState } from 'react';
import { Music, Pause } from 'lucide-react';
import type { Invitation } from '@momentia/shared';

/** Floating music player bound to the invitation's music config. */
export function MusicPlayer({ invitation }: { invitation: Invitation }) {
  const music = invitation.music;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  if (!music?.url) return null;

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false)
      );
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={music.url}
        loop={music.loop ?? true}
        preload="none"
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Jeda musik' : 'Putar musik'}
        aria-pressed={playing}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--inv-primary)] text-white shadow-lg"
      >
        {playing ? <Pause className="h-5 w-5" /> : <Music className="h-5 w-5" />}
      </button>
    </>
  );
}