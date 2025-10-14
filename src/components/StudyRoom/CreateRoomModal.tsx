import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { StudyRoom } from '../../types';
import { themes, musicTracks, subjects } from '../../data/mockData';
import { generateRandomId, getThemeGradient } from '../../utils/helpers';
import { Brain, Music, Users, Palette } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (room: StudyRoom) => void;
  currentUser: any;
}

export const CreateRoomModal = ({ isOpen, onClose, onCreate, currentUser }: CreateRoomModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Mathematics',
    theme: 'cozy-library' as const,
    musicTrack: 'lofi-study' as const,
    maxUsers: 8
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('You must be logged in to create a room');
      return;
    }

    const newRoom: StudyRoom = {
      id: generateRandomId(),
      name: formData.name,
      subject: formData.subject,
      theme: formData.theme,
      currentUsers: [],
      maxUsers: formData.maxUsers,
      isStudying: false,
      timeRemaining: 300,
      sessionType: 'break',
      musicTrack: formData.musicTrack,
      creator: currentUser.name,
      createdAt: new Date(),
      totalStudyTime: 0
    };

    onCreate(newRoom);
    onClose();

    setFormData({
      name: '',
      subject: 'Mathematics',
      theme: 'cozy-library',
      musicTrack: 'lofi-study',
      maxUsers: 8
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Study Room" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Advanced Calculus Study Group"
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Brain className="w-4 h-4" />
            <span>Subject</span>
          </label>
          <select
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
            <Palette className="w-4 h-4" />
            <span>Study Environment</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {themes.map(theme => (
              <div
                key={theme.name}
                onClick={() => setFormData(prev => ({ ...prev, theme: theme.name }))}
                className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                  formData.theme === theme.name
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="h-20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${theme.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${getThemeGradient(theme.name)} opacity-60`} />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white">
                  <p className="text-xs font-medium">{theme.label}</p>
                  <p className="text-xs opacity-80">{theme.description}</p>
                </div>
                {formData.theme === theme.name && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Music Selection */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Music className="w-4 h-4" />
            <span>Background Music</span>
          </label>
          <select
            value={formData.musicTrack}
            onChange={(e) => setFormData(prev => ({ ...prev, musicTrack: e.target.value as any }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {musicTracks.map(track => (
              <option key={track.name} value={track.name}>
                {track.label} - {track.description}
              </option>
            ))}
          </select>
        </div>

        {/* Max Users */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4" />
            <span>Maximum Participants</span>
          </label>
          <select
            value={formData.maxUsers}
            onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={4}>4 participants</option>
            <option value={8}>8 participants</option>
            <option value={12}>12 participants</option>
            <option value={16}>16 participants</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Create Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};