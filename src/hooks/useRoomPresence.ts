import { useEffect, useRef, useCallback } from 'react';
import { roomService } from '../lib/roomService';
import { supabase } from '../lib/supabase';

interface UseRoomPresenceOptions {
  roomId: string | null;
  userId: string | undefined;
  onLeave?: () => void;
}

export const useRoomPresence = ({ roomId, userId, onLeave }: UseRoomPresenceOptions) => {
  const hasJoinedRef = useRef(false);
  const isCleaningUpRef = useRef(false);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const presenceChannelRef = useRef<any>(null);

  const cleanup = useCallback(async () => {
    if (isCleaningUpRef.current || !roomId || !userId) return;

    isCleaningUpRef.current = true;

    try {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      if (presenceChannelRef.current) {
        await presenceChannelRef.current.untrack();
        await presenceChannelRef.current.unsubscribe();
        presenceChannelRef.current = null;
      }

      await roomService.leaveRoom(roomId, userId);
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      hasJoinedRef.current = false;
      isCleaningUpRef.current = false;
    }
  }, [roomId, userId]);

  const sendBeacon = useCallback(() => {
    if (!roomId || !userId) return;

    const url = `${supabase.supabaseUrl}/rest/v1/rpc/leave_room_cleanup`;
    const data = JSON.stringify({
      p_room_id: roomId,
      p_user_id: userId,
    });

    const blob = new Blob([data], { type: 'application/json' });

    try {
      navigator.sendBeacon(url, blob);
    } catch (error) {
      console.error('sendBeacon failed:', error);
    }
  }, [roomId, userId]);

  useEffect(() => {
    if (!roomId || !userId || hasJoinedRef.current) return;

    hasJoinedRef.current = true;

    const setupPresence = async () => {
      presenceChannelRef.current = supabase.channel(`presence:${roomId}`, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      presenceChannelRef.current
        .on('presence', { event: 'sync' }, () => {
          const state = presenceChannelRef.current.presenceState();
        })
        .on('presence', { event: 'leave' }, async ({ key }: { key: string }) => {
          if (key === userId) {
            await cleanup();
          }
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannelRef.current.track({
              user_id: userId,
              online_at: new Date().toISOString(),
            });
          }
        });

      heartbeatIntervalRef.current = setInterval(async () => {
        try {
          await roomService.updateParticipantActivity(roomId, userId);
        } catch (error) {
          console.error('Heartbeat failed:', error);
        }
      }, 30000);
    };

    setupPresence();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      sendBeacon();
      cleanup();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendBeacon();
      }
    };

    const handlePageHide = () => {
      sendBeacon();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      cleanup();
    };
  }, [roomId, userId, cleanup, sendBeacon]);

  const leave = useCallback(async () => {
    await cleanup();
    onLeave?.();
  }, [cleanup, onLeave]);

  return { leave, cleanup };
};
