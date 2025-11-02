import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Settings2, MessageSquare } from 'lucide-react';
import { StudyRoom } from '../../types';
import { Button } from '../UI/Button';
import { useTimer } from '../../hooks/useTimer';
import { useAppContext } from '../../context/AppContext';
import { usePresence } from '../../hooks/usePresence';
import { useUserSettings } from '../../hooks/useUserSettings';
import { useRoomPresence } from '../../hooks/useRoomPresence';
import { formatTime, getThemeGradient } from '../../utils/helpers';
import { themes } from '../../data/mockData';
import { ClassroomSeating } from './ClassroomSeating';
import { TimerModal } from './TimerModal';
import { RoomStatsWidget } from './RoomStatsWidget';
import { EnhancedChatPanel } from './EnhancedChatPanel';
import { AmbientSoundMixer } from '../Audio/AmbientSoundMixer';
import { aiStudentService } from '../../lib/aiStudentService';

interface ImmersiveStudyRoomProps {
  room: StudyRoom;
  onLeave: () => void;
}

export const ImmersiveStudyRoom = ({ room, onLeave }: ImmersiveStudyRoomProps) => {
  const { state } = useAppContext();
  const [showChat, setShowChat] = useState(true);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [notification, setNotification] = useState<string>('');
  const [confetti, setConfetti] = useState(false);
  const [aiStudents, setAiStudents] = useState<any[]>([]);

  const { settings, updateSettings } = useUserSettings(state.currentUser?.id);
  const { participants, updateStatus } = usePresence(room.id, state.currentUser);
  const { leave } = useRoomPresence({
    roomId: room.id,
    userId: state.currentUser?.id,
    onLeave,
  });

  const { isRunning, startTimer, stopTimer, resetTimer, setCustomDuration, timeRemaining, sessionType } = useTimer({
    onSessionComplete: () => {
      setNotification(sessionType === 'study' ? '🎉 Study session completed! +10 XP' : '✨ Break over! Ready to focus?');
      if (sessionType === 'study') {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      }
      setTimeout(() => setNotification(''), 3000);
    }
  });

  const theme = themes.find(t => t.name === room.theme);

  useEffect(() => {
    let stopAIBehavior: (() => void) | null = null;

    const initialize = async () => {
      try {
        const students = await aiStudentService.getAIStudentsForRoom(room.id);
        setAiStudents(students);

        stopAIBehavior = await aiStudentService.startAIBehavior(room.id);
      } catch (error) {
        console.error('Error initializing AI students:', error);
      }
    };

    initialize();

    return () => {
      if (stopAIBehavior) {
        stopAIBehavior();
      }
    };
  }, [room.id]);

  useEffect(() => {
    if (isRunning) {
      updateStatus(sessionType === 'study' ? 'focus' : 'break');
    } else {
      updateStatus('idle');
    }
  }, [isRunning, sessionType]);

  const handleTimerToggle = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const handleLeave = async () => {
    try {
      console.log('Leaving room...');
      await leave();
      console.log('Left room successfully');
    } catch (error) {
      console.error('Error leaving room:', error);
      // Force leave anyway
      onLeave();
    }
  };

  const handleSaveTimer = async (studyMinutes: number, breakMinutes: number) => {
    await updateSettings({
      studyDuration: studyMinutes,
      breakDuration: breakMinutes,
    });
    if (sessionType === 'study') {
      setCustomDuration(studyMinutes);
    } else {
      setCustomDuration(breakMinutes);
    }
  };

  const handleAmbientVolumeChange = async (sound: string, volume: number) => {
    const newVolumes = { ...settings.ambientVolumes, [sound]: volume };
    await updateSettings({ ambientVolumes: newVolumes });
  };

  const progress = sessionType === 'study'
    ? ((settings.studyDuration * 60 - timeRemaining) / (settings.studyDuration * 60)) * 100
    : ((settings.breakDuration * 60 - timeRemaining) / (settings.breakDuration * 60)) * 100;

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${theme?.image})` }}
      />

      <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(room.theme)} opacity-85`} />

      <div className="floating-particles absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {confetti && (
        <div className="confetti-container absolute inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-4 border-4 border-yellow-300">
            <p className="font-bold text-gray-900 text-lg">{notification}</p>
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button
              variant="ghost"
              onClick={handleLeave}
              className="text-white bg-black bg-opacity-30 hover:bg-opacity-40 backdrop-blur-md border border-white border-opacity-20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Leave Room
            </Button>

            <div className="text-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-white drop-shadow-2xl">{room.name}</h1>
              <p className="text-white opacity-90 text-lg mt-1 drop-shadow-lg">{room.subject}</p>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowChat(!showChat)}
              className="text-white bg-black bg-opacity-30 hover:bg-opacity-40 backdrop-blur-md border border-white border-opacity-20 relative"
            >
              <MessageSquare className="w-5 h-5" />
              {!showChat && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
          </div>
        </div>

        <ClassroomSeating participants={participants} aiStudents={aiStudents} />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative">
            <svg className="transform -rotate-90" width="320" height="320">
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="160"
                cy="160"
                r="140"
                stroke={sessionType === 'study' ? 'url(#gradient-blue)' : 'url(#gradient-green)'}
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
                style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' }}
              />
              <defs>
                <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
                  sessionType === 'study'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                }`}>
                  {sessionType === 'study' ? '🔥 Focus Mode' : '☕ Break Time'}
                </div>

                <button
                  onClick={() => !isRunning && setShowTimerModal(true)}
                  className={`text-7xl font-bold text-white mb-6 font-mono drop-shadow-2xl ${
                    !isRunning ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                  } transition-transform`}
                  disabled={isRunning}
                >
                  {formatTime(timeRemaining)}
                </button>

                {!isRunning && (
                  <p className="text-sm text-white opacity-75 mb-6">Click to customize</p>
                )}

                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={handleTimerToggle}
                    size="lg"
                    className="px-10 py-6 text-xl font-bold shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-7 h-7 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-7 h-7 mr-2" />
                        Start
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={resetTimer}
                    size="lg"
                    className="px-6 py-6 bg-white bg-opacity-20 backdrop-blur-md border-2 border-white border-opacity-30 text-white hover:bg-opacity-30"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowTimerModal(true)}
                    size="lg"
                    className="px-6 py-6 bg-white bg-opacity-20 backdrop-blur-md border-2 border-white border-opacity-30 text-white hover:bg-opacity-30"
                  >
                    <Settings2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoomStatsWidget roomId={room.id} participantCount={participants.length} />

      <EnhancedChatPanel
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        roomId={room.id}
      />

      <AmbientSoundMixer
        volumes={settings.ambientVolumes}
        onVolumeChange={handleAmbientVolumeChange}
        isPlaying={isRunning}
      />

      <TimerModal
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        currentStudyDuration={settings.studyDuration}
        currentBreakDuration={settings.breakDuration}
        onSave={handleSaveTimer}
      />
    </div>
  );
};
