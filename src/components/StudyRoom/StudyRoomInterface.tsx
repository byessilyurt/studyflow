import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Users, Music, MessageSquare, Clock, Volume2, VolumeX } from 'lucide-react';
import { StudyRoom } from '../../types';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useTimer } from '../../hooks/useTimer';
import { useAppContext } from '../../context/AppContext';
import { getAvatarUrl, formatTime, getThemeGradient, getRandomEncouragingMessage } from '../../utils/helpers';
import { validateNumber } from '../../utils/security';
import { themes, musicTracks } from '../../data/mockData';
import { ChatPanel } from './ChatPanel';
import { MusicPlayer } from '../Audio/MusicPlayer';

interface StudyRoomInterfaceProps {
  room: StudyRoom;
  onLeave: () => void;
}

export const StudyRoomInterface = ({ room, onLeave }: StudyRoomInterfaceProps) => {
  const { state, dispatch } = useAppContext();
  const [showChat, setShowChat] = useState(false);
  const [showTimerEdit, setShowTimerEdit] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [notification, setNotification] = useState<string>('');
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const { isRunning, startTimer, stopTimer, resetTimer, setCustomDuration, timeRemaining, sessionType } = useTimer({
    onSessionComplete: () => {
      setNotification(sessionType === 'study' ? '🎉 Study session completed!' : '✨ Break over! Ready to focus?');
      setTimeout(() => setNotification(''), 3000);
    }
  });

  const theme = themes.find(t => t.name === room.theme);
  const music = musicTracks.find(m => m.name === room.musicTrack);
  const isCreator = state.currentUser?.id === room.creator;

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning && Math.random() < 0.3) {
        const aiUser = room.currentUsers.find(u => u.isAI);
        if (aiUser) {
          const message = {
            id: Math.random().toString(),
            userId: aiUser.id,
            username: aiUser.name,
            message: getRandomEncouragingMessage(),
            timestamp: new Date(),
            isAI: true
          };
          dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
        }
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [isRunning, room.currentUsers, dispatch]);

  const handleTimerToggle = () => {
    if (isRunning) {
      stopTimer();
      setIsMusicPlaying(false);
    } else {
      startTimer();
      setIsMusicPlaying(true);
    }
  };

  const handleSetCustomTime = () => {
    setCustomDuration(customMinutes);
    setShowTimerEdit(false);
  };

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
  };

  // Calculate progress based on actual session duration
  const studyDurationSeconds = 25 * 60; // 25 minutes default
  const breakDurationSeconds = 5 * 60;  // 5 minutes default

  const progress = sessionType === 'study'
    ? ((studyDurationSeconds - timeRemaining) / studyDurationSeconds) * 100
    : ((breakDurationSeconds - timeRemaining) / breakDurationSeconds) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${theme?.image})` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(room.theme)} opacity-80`} />

      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg px-6 py-3 animate-bounce">
          <p className="font-medium text-gray-900">{notification}</p>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onLeave} className="text-white bg-black bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Leave Room
            </Button>

            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">{room.name}</h1>
              <p className="text-white opacity-90 text-sm mt-1">{room.subject}</p>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowChat(!showChat)}
              className="text-white bg-black bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <Card variant="elevated" className="p-8 lg:p-12 text-center bg-white bg-opacity-95 backdrop-blur-sm">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                    sessionType === 'study'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {sessionType === 'study' ? '📚 Focus Session' : '☕ Break Time'}
                  </div>

                  <div className="mb-8">
                    <button
                      onClick={() => !isRunning && setShowTimerEdit(!showTimerEdit)}
                      className="text-7xl lg:text-9xl font-bold text-gray-900 mb-4 font-mono hover:text-blue-600 transition-colors cursor-pointer"
                      disabled={isRunning}
                    >
                      {formatTime(timeRemaining)}
                    </button>

                    {!isRunning && (
                      <p className="text-sm text-gray-500 mb-4">Click time to customize</p>
                    )}

                    {showTimerEdit && !isRunning && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Set Duration (minutes)
                        </label>
                        <div className="flex items-center justify-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(validateNumber(e.target.value, 1, 120, 25))}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center"
                          />
                          <Button onClick={handleSetCustomTime} size="sm">
                            Set
                          </Button>
                          <Button variant="outline" onClick={() => setShowTimerEdit(false)} size="sm">
                            Cancel
                          </Button>
                        </div>
                        <div className="flex justify-center space-x-2 mt-3">
                          {[15, 25, 45, 60].map(mins => (
                            <button
                              key={mins}
                              onClick={() => {
                                setCustomMinutes(mins);
                                setCustomDuration(mins);
                                setShowTimerEdit(false);
                              }}
                              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              {mins}m
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-1000 ${
                          sessionType === 'study' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      onClick={handleTimerToggle}
                      size="lg"
                      className="px-10 py-5 text-xl font-semibold"
                    >
                      {isRunning ? (
                        <>
                          <Pause className="w-7 h-7 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-7 h-7 mr-2" />
                          Start Focus
                        </>
                      )}
                    </Button>

                    <Button variant="outline" onClick={resetTimer} size="lg" className="px-6 py-5">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </Card>

                <Card variant="elevated" className="p-4 bg-white bg-opacity-95 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{music?.label}</p>
                        <p className="text-sm text-gray-600">{music?.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMusic}
                      >
                        {isMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                  {!isMusicPlaying && (
                    <p className="text-xs text-gray-500 mt-2 text-center">Click play to start music</p>
                  )}
                </Card>
              </div>

              <div className="space-y-6">
                <Card variant="elevated" className="p-6 bg-white bg-opacity-95 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Study Group
                    </h3>
                    <span className="text-sm text-gray-500">{room.currentUsers.length}/{room.maxUsers}</span>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {room.currentUsers.map(user => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="relative">
                          <img
                            src={getAvatarUrl(user.avatar)}
                            alt={user.name}
                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                          />
                          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                            isRunning ? 'bg-green-400' : 'bg-gray-300'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate flex items-center">
                            {user.name}
                            {user.isAI && (
                              <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                                AI
                              </span>
                            )}
                            {user.id === room.creator && (
                              <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-600 text-xs rounded-full">
                                Host
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">Level {user.level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card variant="elevated" className="p-6 bg-white bg-opacity-95 backdrop-blur-sm text-center">
                  <div className="mb-2">
                    <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <p className="text-3xl font-bold text-gray-900">{Math.floor(room.totalStudyTime / 3600)}h {Math.floor((room.totalStudyTime % 3600) / 60)}m</p>
                    <p className="text-sm text-gray-600 mt-1">Total Group Focus Time</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatPanel
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        roomId={room.id}
      />

      <MusicPlayer
        isPlaying={isMusicPlaying}
        volume={musicVolume}
        trackUrl={music?.url}
      />
    </div>
  );
};
