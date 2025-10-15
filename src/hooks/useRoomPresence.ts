import { useEffect, useRef } from 'react';
import { roomService } from '../lib/roomService';

export const useRoomPresence = (roomId: string | null, userId: string | undefined) => {
  const hasJoinedRef = useRef(false);
  const isCleaningUpRef = useRef(false);

  useEffect(() => {
    if (!roomId || !userId || hasJoinedRef.current) return;

    hasJoinedRef.current = true;

    const cleanup = async () => {
      if (isCleaningUpRef.current) return;
      isCleaningUpRef.current = true;

      try {
        await roomService.leaveRoom(roomId, userId);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      cleanup();
      navigator.sendBeacon('/api/leave-room', JSON.stringify({ roomId, userId }));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cleanup();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanup();
    };
  }, [roomId, userId]);

  return { cleanup: async () => {
    if (roomId && userId) {
      await roomService.leaveRoom(roomId, userId);
    }
  }};
};
