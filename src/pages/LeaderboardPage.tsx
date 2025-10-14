import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Flame, Star, Crown, Medal, Award } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useAppContext } from '../context/AppContext';
import { getAvatarUrl, formatDuration } from '../utils/helpers';
import { profileService } from '../lib/profileService';
import type { User } from '../types';

export const LeaderboardPage = () => {
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState<'focus' | 'streak' | 'level'>('focus');
  const [leaderboardUsers, setLeaderboardUsers] = useState<User[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [allAchievements, setAllAchievements] = useState<any[]>([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const profiles = await profileService.getLeaderboard(50);
        const users: User[] = profiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          focusTime: profile.focus_time,
          currentStreak: profile.current_streak,
          isAI: false,
          level: profile.level,
          experience: profile.experience,
          achievements: [],
        }));
        setLeaderboardUsers(users);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
    };

    const loadAchievements = async () => {
      try {
        const achievements = await profileService.getAllAchievements();
        setAllAchievements(achievements);

        if (state.currentUser) {
          const earned = await profileService.getUserAchievements(state.currentUser.id);
          setUserAchievements(earned);
        }
      } catch (error) {
        console.error('Error loading achievements:', error);
      }
    };

    loadLeaderboard();
    loadAchievements();
  }, [state.currentUser]);

  const sortedUsers = [...leaderboardUsers].sort((a, b) => {
    switch (activeTab) {
      case 'focus':
        return b.focusTime - a.focusTime;
      case 'streak':
        return b.currentStreak - a.currentStreak;
      case 'level':
        return b.level - a.level;
      default:
        return b.focusTime - a.focusTime;
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600';
    }
  };

  const getStatValue = (user: any) => {
    switch (activeTab) {
      case 'focus':
        return formatDuration(user.focusTime);
      case 'streak':
        return `${user.currentStreak} days`;
      case 'level':
        return `Level ${user.level}`;
      default:
        return formatDuration(user.focusTime);
    }
  };

  const tabs = [
    { id: 'focus', label: 'Focus Time', icon: Clock },
    { id: 'streak', label: 'Study Streaks', icon: Flame },
    { id: 'level', label: 'Experience', icon: Star }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Leaderboard</h1>
          <p className="text-lg text-gray-600">Compete with fellow learners and track your progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {sortedUsers.slice(0, 3).map((user, index) => {
                const rank = index + 1;
                const isCurrentUser = user.id === state.currentUser?.id;
                
                return (
                  <Card
                    key={user.id}
                    variant="elevated"
                    className={`p-6 text-center relative overflow-hidden ${
                      rank === 1 ? 'transform scale-105 order-2' : rank === 2 ? 'order-1' : 'order-3'
                    } ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`absolute inset-0 ${getRankBg(rank)} opacity-10`} />
                    
                    <div className="relative">
                      <div className="mb-4">
                        {getRankIcon(rank)}
                      </div>
                      
                      <img
                        src={getAvatarUrl(user.avatar)}
                        alt={user.name}
                        className={`w-16 h-16 rounded-full mx-auto mb-4 ${
                          rank === 1 ? 'ring-4 ring-yellow-400' : ''
                        }`}
                      />
                      
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {user.name}
                        {user.isAI && (
                          <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                            AI
                          </span>
                        )}
                      </h3>
                      
                      <p className="text-2xl font-bold text-gray-900">{getStatValue(user)}</p>
                      <p className="text-sm text-gray-600 capitalize">{activeTab} Leader</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Full Rankings */}
            <Card variant="elevated">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Full Rankings</h3>
                
                <div className="space-y-3">
                  {sortedUsers.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.id === state.currentUser?.id;
                    
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center space-x-4 p-4 rounded-lg transition-all hover:bg-gray-50 ${
                          isCurrentUser ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8">
                          {rank <= 3 ? getRankIcon(rank) : (
                            <span className="text-lg font-bold text-gray-500">#{rank}</span>
                          )}
                        </div>
                        
                        <img
                          src={getAvatarUrl(user.avatar)}
                          alt={user.name}
                          className="w-12 h-12 rounded-full"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                            {user.isAI && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                                AI
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">Level {user.level}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{getStatValue(user)}</p>
                          <p className="text-sm text-gray-500">{user.achievements.length} achievements</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Achievements Sidebar */}
          <div className="space-y-6">
            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Achievements</h3>
              
              {state.currentUser ? (
                <div className="space-y-3">
                  {userAchievements.map(ua => (
                    <div key={ua.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{ua.achievement.name}</p>
                        <p className="text-xs text-gray-600">{ua.achievement.description}</p>
                      </div>
                    </div>
                  ))}

                  {userAchievements.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Start studying to earn achievements!
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  Sign in to track achievements
                </p>
              )}
            </Card>

            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Achievements</h3>

              <div className="space-y-3">
                {allAchievements.slice(0, 5).map(achievement => (
                  <div key={achievement.id} className="flex items-center space-x-3 opacity-60">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 text-sm">{achievement.name}</p>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};