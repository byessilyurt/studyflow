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
    <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-80 z-30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Room Goals</span>
        </h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Focus Time</p>
                <p className="text-2xl font-bold text-gray-900 counting-animation">
                  {hours}h {minutes}m
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sessions Completed</p>
                <p className="text-2xl font-bold text-gray-900 counting-animation">
                  {stats.totalSessions}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Learners</p>
                <p className="text-2xl font-bold text-gray-900 counting-animation">
                  {participantCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          🎯 Keep the momentum going together!
        </p>
      </div>
    </div>
  );
};
