import React from 'react';
import { Users, Clock, Music, Brain } from 'lucide-react';
import { StudyRoom } from '../../types';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { getAvatarUrl, formatTime, getThemeGradient } from '../../utils/helpers';
import { themes, musicTracks } from '../../data/mockData';

interface RoomCardProps {
  room: StudyRoom;
  onJoin: (room: StudyRoom) => void;
}

export const RoomCard = ({ room, onJoin }: RoomCardProps) => {
  const theme = themes.find(t => t.name === room.theme);
  const music = musicTracks.find(m => m.name === room.musicTrack);

  return (
    <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Theme Image */}
      <div className="relative h-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${theme?.image})` }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${getThemeGradient(room.theme)} opacity-60`} />
        
        {/* Room Status */}
        <div className="absolute top-3 right-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            room.isStudying 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {room.isStudying ? '📚 Studying' : '☕ Break'}
          </div>
        </div>

        {/* Timer */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center space-x-1 bg-white bg-opacity-90 px-2 py-1 rounded-lg">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-800">
              {formatTime(room.timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{room.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Brain className="w-4 h-4" />
            <span>{room.subject}</span>
          </div>
        </div>

        {/* Users */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {room.currentUsers.length}/{room.maxUsers}
            </span>
          </div>
          
          <div className="flex -space-x-1">
            {room.currentUsers.slice(0, 4).map((user, index) => (
              <img
                key={user.id}
                src={getAvatarUrl(user.avatar)}
                alt={user.name}
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ zIndex: 10 - index }}
              />
            ))}
            {room.currentUsers.length > 4 && (
              <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  +{room.currentUsers.length - 4}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Music */}
        <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
          <Music className="w-4 h-4" />
          <span>{music?.label || 'Silence'}</span>
        </div>

        {/* Join Button */}
        <Button
          onClick={() => onJoin(room)}
          className="w-full"
          disabled={room.currentUsers.length >= room.maxUsers}
        >
          {room.currentUsers.length >= room.maxUsers ? 'Room Full' : 'Join Room'}
        </Button>
      </div>
    </Card>
  );
};