import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward } from 'lucide-react';

interface Track {
  id: number;
  name: string;
  url: string;
}

interface MusicPlayerAdvancedProps {
  isPlaying: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

const tracks: Track[] = [
  { id: 1, name: 'Lo-Fi Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, name: 'Rain Ambience', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, name: 'Café Chatter', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 4, name: 'Study Focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

export const MusicPlayerAdvanced = ({ isPlaying, onPlayStateChange }: MusicPlayerAdvancedProps) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [waveformActive, setWaveformActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume;

      const savedVolume = localStorage.getItem('musicVolume');
      if (savedVolume) {
        const parsedVolume = parseFloat(savedVolume);
        setVolume(parsedVolume);
        audioRef.current.volume = parsedVolume;
      }
    }

    const audio = audioRef.current;
    const newTrackUrl = tracks[currentTrackIndex].url;

    if (audio.src !== newTrackUrl) {
      const wasPlaying = !audio.paused;
      audio.src = newTrackUrl;
      audio.load();

      if (wasPlaying && isPlaying) {
        audio.play().catch(err => {
          console.error('Track change play failed:', err);
        });
      }
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setWaveformActive(true);
          })
          .catch(err => {
            console.error('Audio autoplay blocked:', err);
            setWaveformActive(false);
          });
      } else {
        setWaveformActive(true);
      }
    } else {
      audioRef.current.pause();
      setWaveformActive(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('musicVolume', volume.toString());
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    onPlayStateChange?.(!isPlaying);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div
      className={`fixed bottom-4 right-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl transition-all duration-300 z-40 ${
        isExpanded ? 'w-80' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4">
        {!isExpanded ? (
          <div className="flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center space-x-2">
                <span>🎵</span>
                <span>Music Player</span>
              </h3>
              {waveformActive && (
                <div className="flex items-center space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full animate-pulse"
                      style={{
                        height: `${12 + Math.random() * 12}px`,
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: `${0.6 + Math.random() * 0.4}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm font-semibold text-white mb-1">Now Playing</p>
              <p className="text-xs text-white opacity-90">{currentTrack.name}</p>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-white text-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              <button
                onClick={handleNextTrack}
                className="w-10 h-10 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:scale-110 transition-transform"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <span className="text-xs text-white font-semibold">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer slider-white"
              />
            </div>

            <div className="pt-3 border-t border-white border-opacity-20">
              <div className="grid grid-cols-2 gap-2">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => setCurrentTrackIndex(index)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      currentTrackIndex === index
                        ? 'bg-white text-purple-600'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
