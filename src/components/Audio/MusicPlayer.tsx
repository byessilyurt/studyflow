import { useEffect, useRef } from 'react';

interface MusicPlayerProps {
  isPlaying: boolean;
  volume: number;
  trackUrl?: string;
}

export const MusicPlayer = ({ isPlaying, volume, trackUrl }: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!trackUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    if (audioRef.current.src !== trackUrl) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = trackUrl;
      audioRef.current.load();

      if (wasPlaying && isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Audio play failed:', err);
        });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [trackUrl, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current || !trackUrl) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Audio play failed:', err);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, trackUrl]);

  return null;
};
