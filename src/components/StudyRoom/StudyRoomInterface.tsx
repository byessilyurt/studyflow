import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Users, Music, MessageSquare, Settings, Volume2 } from 'lucide-react';
import { StudyRoom } from '../../types';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useTimer } from '../../hooks/useTimer';
import { useAppContext } from '../../context/AppContext';
import { getAvatarUrl, formatTime, getThemeGradient, getRandomEncouragingMessage } from '../../utils/helpers';
import { themes, musicTracks } from '../../data/mockData';
import { ChatPanel } from './ChatPanel';

interface StudyRoomInterfaceProps {
  room: StudyRoom;
  onLeave: () => void;
}

export const StudyRoomInterface = ({ room, onLeave }: StudyRoomInterfaceProps) => {
  const { state, dispatch } = useAppContext();
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<string>('');
  
  const { isRunning, startTimer, stopTimer, resetTimer, timeRemaining, sessionType } = useTimer({
    onSessionComplete: () => {
      setNotification(sessionType === 'study' ? '🎉 Study session completed!' : '✨ Break over! Ready to focus?');
      setTimeout(() => setNotification(''), 3000);
    }
  });

  const theme = themes.find(t => t.name === room.theme);
  const music = musicTracks.find(m => m.name === room.musicTrack);
  const isCreator = state.currentUser?.id === room.creator;

  // Add encouraging AI messages periodically
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
    }, 120000); // Every 2 minutes

    return () => clearInterval(interval);
  }, [isRunning, room.currentUsers, dispatch]);

  const handleTimerToggle = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  const progress = sessionType === 'study' 
    ? ((1500 - timeRemaining) / 1500) * 100
    : ((300 - timeRemaining) / 300) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${theme?.image})` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(room.theme)} opacity-80`} />

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg px-6 py-3 animate-bounce">
          <p className="font-medium text-gray-900">{notification}</p>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onLeave} className="text-white bg-black bg-opacity-20 hover:bg-opacity-30">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Leave Room
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl lg:text-2xl font-bold text-white drop-shadow-lg">{room.name}</h1>
            <p className="text-white opacity-90 text-sm">{room.subject}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowChat(!showChat)}
              className="text-white bg-black bg-opacity-20 hover:bg-opacity-30"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            
            {isCreator && (
              <Button
                variant="ghost"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white bg-black bg-opacity-20 hover:bg-opacity-30"
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <Card variant="elevated" className="p-8 text-center bg-white bg-opacity-95 backdrop-blur-sm">
              {/* Session Type */}
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                sessionType === 'study' 
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {sessionType === 'study' ? '📚 Study Time' : '☕ Break Time'}
              </div>

              {/* Timer Display */}
              <div className="mb-8">
                <div className="text-6xl lg:text-8xl font-bold text-gray-900 mb-4 font-mono">
                  {formatTime(timeRemaining)}
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      sessionType === 'study' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={handleTimerToggle}
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-6 h-6 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                
                <Button variant="outline" onClick={resetTimer} size="lg">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </Card>

            {/* Music Control */}
            <Card variant="elevated" className="mt-6 p-4 bg-white bg-opacity-95 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{music?.label}</p>
                    <p className="text-sm text-gray-600">{music?.description}</p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Participants Panel */}
          <div>
            <Card variant="elevated" className="p-6 bg-white bg-opacity-95 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Participants ({room.currentUsers.length})
                </h3>
              </div>

              <div className="space-y-3">
                {room.currentUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <img
                      src={getAvatarUrl(user.avatar)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate flex items-center">
                        {user.name}
                        {user.isAI && (
                          <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                            AI
                          </span>
                        )}
                        {user.id === room.creator && (
                          <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                            Host
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">Level {user.level}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      isRunning ? 'bg-green-400' : 'bg-gray-300'
                    }`} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card variant="elevated" className="mt-6 p-4 bg-white bg-opacity-95 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{Math.floor(room.totalStudyTime / 3600)}h</p>
                <p className="text-sm text-gray-600">Total Room Focus Time</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        roomId={room.id}
      />
    </div>
  );
};