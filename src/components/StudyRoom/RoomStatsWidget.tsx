import React, { useState, useEffect } from 'react';
import { Zap, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RoomStatsWidgetProps {
  roomId: string;
  participantCount: number;
}

export const RoomStatsWidget = ({ roomId, participantCount }: RoomStatsWidgetProps) => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalFocusTime: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const { data, error } = await supabase
        .from('room_stats')
        .select('*')
        .eq('room_id', roomId)
        .maybeSingle();

      if (!error && data) {
        setStats({
          totalSessions: data.total_sessions,
          totalFocusTime: data.total_focus_time,
        });
      }
    };

    loadStats();

    const channel = supabase
      .channel(`room-stats:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'room_stats',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setStats({
            totalSessions: payload.new.total_sessions,
            totalFocusTime: payload.new.total_focus_time,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  const hours = Math.floor(stats.totalFocusTime / 3600);
  const minutes = Math.floor((stats.totalFocusTime % 3600) / 60);
  const totalMinutes = Math.floor(stats.totalFocusTime / 60);

  // Calculate streak/energy level based on activity
  const energyLevel = Math.min(100, Math.floor((totalMinutes / 100) * 100));
  const streakDays = Math.floor(stats.totalSessions / 4); // Rough estimate

  return (
    <div className="fixed top-20 right-6 z-30 animate-slide-in">
      {/* Energy/Streak Indicator */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-1 shadow-2xl mb-3">
        <div className="bg-black bg-opacity-40 backdrop-blur-xl rounded-xl px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Zap className="w-6 h-6 text-yellow-300 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-xs text-white opacity-75 font-medium">Group Energy</p>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${energyLevel}%` }}
                  />
                </div>
                <span className="text-white font-bold text-sm">{energyLevel}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Learners Badge */}
      <div className="bg-white bg-opacity-10 backdrop-blur-xl rounded-xl border border-white border-opacity-20 px-4 py-2 shadow-xl">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white font-semibold text-sm">{participantCount} studying</span>
          </div>
          {streakDays > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-2xl">🔥</span>
              <span className="text-white font-bold text-sm">{streakDays}d</span>
            </div>
          )}
        </div>
        {totalMinutes > 60 && (
          <p className="text-xs text-white opacity-75 mt-1 text-center">
            {hours}h {minutes}m conquered together
          </p>
        )}
      </div>
    </div>
  );
};
