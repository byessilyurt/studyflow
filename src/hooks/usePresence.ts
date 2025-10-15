import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PresenceUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  status: 'focus' | 'break' | 'idle';
}

export const usePresence = (roomId: string, currentUser: any) => {
  const [participants, setParticipants] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel(`room-presence:${roomId}`, {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];

        Object.keys(state).forEach(key => {
          const presences = state[key];
          if (presences && presences.length > 0) {
            const presence = presences[0] as any;
            users.push({
              id: key,
              name: presence.name,
              avatar: presence.avatar,
              level: presence.level,
              status: presence.status || 'idle',
            });
          }
        });

        setParticipants(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            level: currentUser.level || 1,
            status: 'idle',
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, currentUser]);

  const updateStatus = async (status: 'focus' | 'break' | 'idle') => {
    const channel = supabase.channel(`room-presence:${roomId}`);
    await channel.track({
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      level: currentUser.level || 1,
      status,
    });
  };

  return { participants, updateStatus };
};
