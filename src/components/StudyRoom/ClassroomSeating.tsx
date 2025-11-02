import React, { useMemo } from 'react';
import { getAvatarUrl } from '../../utils/helpers';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  level: number;
  status: 'focus' | 'break' | 'idle';
  isAI?: boolean;
}

interface ClassroomSeatingProps {
  participants: Participant[];
  aiStudents?: Array<{ id: string; name: string; avatar_url: string }>;
}

const statusConfig = {
  focus: { label: '🔥 Deep Focus', color: 'border-green-500 shadow-green-500/50', ring: 'ring-green-400' },
  break: { label: '☕ On Break', color: 'border-yellow-500 shadow-yellow-500/50', ring: 'ring-yellow-400' },
  idle: { label: '💬 Chatting', color: 'border-blue-500 shadow-blue-500/50', ring: 'ring-blue-400' },
};

const ParticipantAvatar = React.memo(({
  participant,
  index,
  x,
  y
}: {
  participant: Participant;
  index: number;
  x: number;
  y: number;
}) => (
  <div
    key={participant.id}
    className="absolute group animate-slide-in"
    style={{
      left: `calc(${x}% - 30px)`,
      top: `calc(${y}% - 30px)`,
      animationDelay: `${index * 100}ms`,
    }}
  >
    <div className="relative">
      <div
        className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 ${
          participant.isAI ? 'border-purple-400 shadow-purple-400/50' : statusConfig[participant.status].color
        } shadow-2xl transition-all duration-300 hover:scale-125 hover:z-10 ring-4 ${
          participant.isAI ? 'ring-purple-200' : statusConfig[participant.status].ring
        } ring-opacity-50 bg-white`}
      >
        <img
          src={participant.isAI ? participant.avatar : getAvatarUrl(participant.avatar)}
          alt={participant.name}
          className="w-full h-full rounded-full object-cover"
          loading="lazy"
        />

        <div className={`absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full border-3 border-white shadow-lg ${
          participant.status === 'focus' ? 'bg-green-500 animate-pulse' :
          participant.status === 'break' ? 'bg-yellow-500' :
          'bg-blue-500'
        }`}>
          {participant.status === 'focus' && (
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
          )}
        </div>

        {participant.isAI && (
          <div className="absolute -top-1 -left-1 w-7 h-7 bg-purple-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs">
            🤖
          </div>
        )}
      </div>

      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
        <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl whitespace-nowrap min-w-max">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-bold text-sm">{participant.name}</p>
            {participant.isAI && (
              <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-semibold">
                AI
              </span>
            )}
          </div>
          {!participant.isAI && (
            <p className="text-xs text-gray-300">Level {participant.level}</p>
          )}
          <p className="text-xs mt-1 text-gray-200">{statusConfig[participant.status].label}</p>
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45" />
        </div>
      </div>
    </div>

    <div className="text-center mt-2">
      <p className="text-xs font-semibold text-white drop-shadow-lg truncate max-w-[80px]">
        {participant.name.split(' ')[0]}
      </p>
    </div>
  </div>
));

ParticipantAvatar.displayName = 'ParticipantAvatar';

export const ClassroomSeating = React.memo(({ participants, aiStudents = [] }: ClassroomSeatingProps) => {
  const allParticipants = useMemo(() => [
    ...participants,
    ...aiStudents.map(ai => ({
      id: ai.id,
      name: ai.name,
      avatar: ai.avatar_url,
      level: 1,
      status: 'idle' as const,
      isAI: true,
    }))
  ], [participants, aiStudents]);

  const totalParticipants = allParticipants.length;

  const radius = Math.min(totalParticipants * 15, 300);
  const centerX = 50;
  const centerY = totalParticipants > 5 ? 20 : 15;
  const maxAngle = totalParticipants > 8 ? 180 : 160;
  const angleStep = totalParticipants > 1 ? maxAngle / (totalParticipants - 1) : 0;
  const startAngle = totalParticipants > 8 ? -90 : -80;

  return (
    <div className="relative w-full h-80 mb-8">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 40"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={`M ${centerX - 40} ${centerY + 5} A 40 40 0 0 1 ${centerX + 40} ${centerY + 5}`}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="0.2"
          strokeDasharray="1,1"
          fill="none"
        />
      </svg>

      {allParticipants.map((participant, index) => {
        const angle = (startAngle + (totalParticipants > 1 ? index * angleStep : 0)) * (Math.PI / 180);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + (radius * Math.sin(angle)) * 0.4;

        return (
          <ParticipantAvatar
            key={participant.id}
            participant={participant}
            index={index}
            x={x}
            y={y}
          />
        );
      })}

      {allParticipants.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center opacity-75">
            <p className="text-lg font-semibold mb-2">Waiting for study buddies...</p>
            <p className="text-sm">Invite friends to join your study session</p>
          </div>
        </div>
      )}
    </div>
  );
});

ClassroomSeating.displayName = 'ClassroomSeating';
