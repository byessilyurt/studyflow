import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, CloudRain, Coffee, Flame } from 'lucide-react';

interface AmbientSoundMixerProps {
  volumes: {
    lofi: number;
    rain: number;
    cafe: number;
    fireplace: number;
  };
  onVolumeChange: (sound: string, volume: number) => void;
  isPlaying: boolean;
}

const soundTracks = {
  lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  cafe: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  fireplace: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
};

export const AmbientSoundMixer = ({ volumes, onVolumeChange, isPlaying }: AmbientSoundMixerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    Object.keys(soundTracks).forEach(key => {
      if (!audioRefs.current[key]) {
        const audio = new Audio(soundTracks[key as keyof typeof soundTracks]);
        audio.loop = true;
        audio.volume = volumes[key as keyof typeof volumes];
        audioRefs.current[key] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  useEffect(() => {
    Object.keys(audioRefs.current).forEach(key => {
      const audio = audioRefs.current[key];
      const volume = volumes[key as keyof typeof volumes];
      audio.volume = volume;

      if (isPlaying && volume > 0) {
        audio.play().catch(err => console.log('Audio play failed:', err));
      } else {
        audio.pause();
      }
    });
  }, [volumes, isPlaying]);

  const handleVolumeChange = (sound: string, value: number) => {
    onVolumeChange(sound, value);
  };

  const sounds = [
    { key: 'lofi', label: 'Lo-Fi', icon: Music, color: 'from-purple-500 to-pink-500' },
    { key: 'rain', label: 'Rain', icon: CloudRain, color: 'from-blue-500 to-cyan-500' },
    { key: 'cafe', label: 'Café', icon: Coffee, color: 'from-amber-500 to-orange-500' },
    { key: 'fireplace', label: 'Fire', icon: Flame, color: 'from-red-500 to-orange-600' },
  ];

  return (
    <div
      className={`fixed bottom-4 left-4 bg-white rounded-2xl shadow-2xl transition-all duration-300 z-40 ${
        isExpanded ? 'w-80' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4">
        {!isExpanded ? (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Ambient Sounds</h3>
              {isPlaying ? (
                <Volume2 className="w-5 h-5 text-blue-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <div className="space-y-3">
              {sounds.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 bg-gradient-to-r ${color} rounded-md flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(volumes[key as keyof typeof volumes] * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volumes[key as keyof typeof volumes] * 100}
                    onChange={(e) => handleVolumeChange(key, parseInt(e.target.value) / 100)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${volumes[key as keyof typeof volumes] * 100}%, rgb(229, 231, 235) ${volumes[key as keyof typeof volumes] * 100}%, rgb(229, 231, 235) 100%)`
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Hover to customize your soundscape
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
