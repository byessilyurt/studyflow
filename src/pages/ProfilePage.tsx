import React, { useState } from 'react';
import { User, Award, Clock, Flame, Star, Settings, Edit3 } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useAppContext } from '../context/AppContext';
import { getAvatarUrl, formatDuration, calculateExperienceForNextLevel } from '../utils/helpers';
import { achievements, avatars } from '../data/mockData';

export const ProfilePage = () => {
  const { state, dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(state.currentUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(state.currentUser?.avatar || 'avatar-1');

  if (!state.currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">Please sign in to view your profile</p>
        </Card>
      </div>
    );
  }

  const { currentUser, userStats } = state;
  const experienceForNext = calculateExperienceForNextLevel(userStats.experience);
  const progressPercent = ((userStats.experience % 1000) / 1000) * 100;

  const userAchievements = achievements.filter(achievement => 
    currentUser.achievements.includes(achievement.id)
  );

  const handleSaveProfile = () => {
    if (newName.trim() && selectedAvatar) {
      const updatedUser = {
        ...currentUser,
        name: newName.trim(),
        avatar: selectedAvatar
      };
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      setIsEditing(false);
    }
  };

  const stats = [
    {
      icon: Clock,
      label: 'Total Focus Time',
      value: formatDuration(userStats.totalFocusTime),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${userStats.currentStreak} days`,
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Star,
      label: 'Experience Level',
      value: `Level ${userStats.level}`,
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Award,
      label: 'Achievements',
      value: `${userAchievements.length}/${achievements.length}`,
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card variant="elevated" className="p-8 text-center">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Avatar Selection */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Choose Avatar</p>
                    <div className="grid grid-cols-3 gap-3">
                      {avatars.slice(0, 9).map(avatar => (
                        <button
                          key={avatar}
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            selectedAvatar === avatar
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={getAvatarUrl(avatar)}
                            alt="Avatar option"
                            className="w-12 h-12 rounded-full"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setNewName(currentUser.name);
                        setSelectedAvatar(currentUser.avatar);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} className="flex-1">
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={getAvatarUrl(currentUser.avatar)}
                    alt={currentUser.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-blue-100"
                  />
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentUser.name}</h1>
                  
                  <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium mb-6">
                    Level {userStats.level}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center mx-auto"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              )}
            </Card>

            {/* Experience Progress */}
            {!isEditing && (
              <Card variant="elevated" className="p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Progress</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Level {userStats.level}</span>
                    <span>Level {userStats.level + 1}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {experienceForNext} XP to next level
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Stats and Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} variant="elevated" className="p-6 text-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </Card>
              ))}
            </div>

            {/* Achievements */}
            <Card variant="elevated" className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Achievements</h2>
              
              {userAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userAchievements.map(achievement => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No achievements yet</h3>
                  <p className="text-gray-600">Start studying to unlock your first achievement!</p>
                </div>
              )}
            </Card>

            {/* Study History */}
            <Card variant="elevated" className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Study Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {userStats.sessionsCompleted}
                  </div>
                  <p className="text-gray-600">Sessions Completed</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {userStats.longestStreak}
                  </div>
                  <p className="text-gray-600">Longest Streak (days)</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {userStats.roomsJoined}
                  </div>
                  <p className="text-gray-600">Rooms Joined</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};