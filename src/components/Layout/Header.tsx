import React from 'react';
import { BookOpen, User, Trophy, Settings, LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getAvatarUrl, formatDuration } from '../../utils/helpers';
import { authService } from '../../lib/auth';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Header = ({ currentPage, onNavigate }: HeaderProps) => {
  const { state } = useAppContext();
  const { currentUser, userStats } = state;

  const handleLogout = async () => {
    try {
      await authService.signOut();
      onNavigate('landing');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => onNavigate('rooms')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">StudyFlow</h1>
              <p className="text-xs text-gray-500">Focus together</p>
            </div>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('rooms')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'rooms'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Study Rooms
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                currentPage === 'leaderboard'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>
          </nav>

          {/* User Menu */}
          {currentUser && (
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Level {userStats.level}</p>
                  <p className="text-gray-500">Focus Level</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-blue-600">{formatDuration(userStats.totalFocusTime)}</p>
                  <p className="text-gray-500">Total Focus</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">{userStats.currentStreak}</p>
                  <p className="text-gray-500">Day Streak</p>
                </div>
              </div>

              {/* Avatar */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={getAvatarUrl(currentUser.avatar)}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-900">
                    {currentUser.name}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};