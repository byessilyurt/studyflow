import React from 'react';
import { getAvatarUrl } from '../../utils/helpers';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  level: number;
  status: 'focus' | 'break' | 'idle';
}

interface ParticipantRowProps {
  participants: Participant[];
}

const statusConfig = {
  focus: { label: '🔥 Deep Focus', color: 'border-green-400 shadow-green-400/50' },
  break: { label: '☕ On Break', color: 'border-yellow-400 shadow-yellow-400/50' },
  idle: { label: '💬 Chatting', color: 'border-blue-400 shadow-blue-400/50' },
};

export const ParticipantRow = ({ participants }: ParticipantRowProps) => {
  return (
    <div className="flex items-center justify-center space-x-4 px-4 py-6">
      <div className="flex items-center space-x-3 overflow-x-auto max-w-4xl">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className="relative group animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`relative w-16 h-16 rounded-full border-4 ${statusConfig[participant.status].color} shadow-lg transition-all duration-300 hover:scale-110`}
            >
              <img
                src={getAvatarUrl(participant.avatar)}
                alt={participant.name}
                className="w-full h-full rounded-full object-cover"
              />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                participant.status === 'focus' ? 'bg-green-400' :
                participant.status === 'break' ? 'bg-yellow-400' :
                'bg-blue-400'
              }`} />
            </div>

            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs">
                <p className="font-semibold">{participant.name}</p>
                <p className="text-gray-300">Level {participant.level}</p>
                <p className="text-xs mt-1">{statusConfig[participant.status].label}</p>
              </div>
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="text-white opacity-75 text-sm">
            Waiting for study buddies to join...
          </div>
        )}
      </div>
    </div>
  );
};
