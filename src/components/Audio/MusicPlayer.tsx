import { useEffect, useRef } from 'react';

interface MusicPlayerProps {
  isPlaying: boolean;
  volume: number;
  trackUrl?: string;
}

export const MusicPlayer = ({ isPlaying, volume, trackUrl }: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && trackUrl) {
      audioRef.current = new Audio(trackUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [trackUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log('Audio play failed:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return null;
};
