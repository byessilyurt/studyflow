export interface User {
  id: string;
  name: string;
  avatar: string;
  focusTime: number; // total seconds
  currentStreak: number;
  isAI: boolean;
  level: number;
  experience: number;
  achievements: string[];
  joinedAt?: Date;
}

export interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  theme: ThemeName;
  currentUsers: User[];
  maxUsers: number;
  isStudying: boolean;
  timeRemaining: number; // seconds
  sessionType: 'study' | 'break';
  musicTrack: MusicTrack;
  creator: string;
  createdAt: Date;
  totalStudyTime: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  isAI?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  category: 'focus' | 'streak' | 'social' | 'special';
}

export interface UserStats {
  totalFocusTime: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  roomsCreated: number;
  roomsJoined: number;
  level: number;
  experience: number;
}

export type ThemeName = 'cozy-library' | 'rainy-night' | 'forest-morning' | 'coffee-shop' | 'minimalist' | 'harry-potter';

export type MusicTrack = 'lofi-study' | 'classical' | 'rain-sounds' | 'forest-ambiance' | 'cafe-sounds' | 'white-noise' | 'none';

export interface StudySession {
  roomId: string;
  startTime: Date;
  endTime?: Date;
  focusTime: number;
  completed: boolean;
}