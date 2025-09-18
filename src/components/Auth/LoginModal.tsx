import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { User } from 'lucide-react';
import { getAvatarUrl } from '../../utils/helpers';
import { avatars, aiNames } from '../../data/mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

export const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const user = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        avatar: selectedAvatar,
        focusTime: 0,
        currentStreak: 0,
        isAI: false,
        level: 1,
        experience: 0,
        achievements: [],
        joinedAt: new Date()
      };
      
      onLogin(user);
      onClose();
      setName('');
      setSelectedAvatar('avatar-1');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to StudyFlow" className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Choose your avatar and enter your name to get started!</p>
        </div>

        {/* Avatar Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Choose Your Avatar</label>
          <div className="grid grid-cols-4 gap-3">
            {avatars.slice(0, 8).map(avatar => (
              <button
                key={avatar}
                type="button"
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={!name.trim()}>
          Start Studying
        </Button>
      </form>
    </Modal>
  );
};