import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Flame } from 'lucide-react';
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

  return (
    <div className="fixed bottom-6 left-6 z-30">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-2xl shadow-2xl border border-white border-opacity-30 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-bold text-white">Room Stats</span>
          </div>
        </div>

        <div className="p-4 flex items-center space-x-6">
          <div className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Focus Time</p>
              <p className="text-lg font-bold text-gray-900">{hours}h {minutes}m</p>
            </div>
          </div>

          <div className="w-px h-12 bg-gray-200" />

          <div className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Sessions</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
          </div>

          <div className="w-px h-12 bg-gray-200" />

          <div className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Learners</p>
              <p className="text-lg font-bold text-gray-900">{participantCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
