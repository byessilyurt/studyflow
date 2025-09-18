import { User, StudyRoom, Achievement, ThemeName, MusicTrack } from '../types';

export const themes: { name: ThemeName; label: string; description: string; image: string }[] = [
  {
    name: 'cozy-library',
    label: 'Cozy Library',
    description: 'Warm, book-filled sanctuary',
    image: 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    name: 'rainy-night',
    label: 'Rainy Night',
    description: 'Peaceful rain with thunder',
    image: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    name: 'forest-morning',
    label: 'Forest Morning',
    description: 'Fresh mountain air and trees',
    image: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    name: 'coffee-shop',
    label: 'Coffee Shop',
    description: 'Warm café atmosphere',
    image: 'https://images.pexels.com/photos/1002740/pexels-photo-1002740.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    name: 'minimalist',
    label: 'Minimalist',
    description: 'Clean, distraction-free space',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    name: 'harry-potter',
    label: 'Magical Library',
    description: 'Hogwarts-inspired study hall',
    image: 'https://images.pexels.com/photos/2041396/pexels-photo-2041396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  }
];

export const musicTracks: { name: MusicTrack; label: string; description: string }[] = [
  { name: 'lofi-study', label: 'Lo-fi Study', description: 'Chill beats for focus' },
  { name: 'classical', label: 'Classical', description: 'Peaceful orchestral music' },
  { name: 'rain-sounds', label: 'Rain Sounds', description: 'Natural rain ambiance' },
  { name: 'forest-ambiance', label: 'Forest Sounds', description: 'Birds and nature' },
  { name: 'cafe-sounds', label: 'Café Ambiance', description: 'Coffee shop atmosphere' },
  { name: 'white-noise', label: 'White Noise', description: 'Pure focus frequency' },
  { name: 'none', label: 'Silence', description: 'Complete quiet' }
];

export const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Literature', 'History', 'Psychology', 'Economics', 'Languages',
  'Art', 'Music Theory', 'Philosophy', 'Engineering', 'Medicine',
  'Law', 'Business', 'Statistics', 'Astronomy', 'Other'
];

export const avatars = [
  'avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5',
  'avatar-6', 'avatar-7', 'avatar-8', 'avatar-9', 'avatar-10'
];

export const aiNames = [
  'Study Buddy Sarah', 'Focus Fox Alex', 'Wise Owl Emma', 'Scholar Sam',
  'Bookworm Ben', 'Mindful Maya', 'Zen Master Zoe', 'Captain Concentrate',
  'Professor Lily', 'Focus Friend Jake', 'Study Star Luna', 'Brain Boost Bob'
];

export const achievements: Achievement[] = [
  {
    id: 'first-session',
    name: 'First Steps',
    description: 'Complete your first study session',
    icon: 'play',
    requirement: 1,
    category: 'focus'
  },
  {
    id: 'marathon-studier',
    name: 'Marathon Studier',
    description: 'Study for 3 hours in one day',
    icon: 'clock',
    requirement: 10800,
    category: 'focus'
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Study before 7 AM',
    icon: 'sunrise',
    requirement: 1,
    category: 'special'
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Study after 10 PM',
    icon: 'moon',
    requirement: 1,
    category: 'special'
  },
  {
    id: 'consistent-learner',
    name: 'Consistent Learner',
    description: 'Study 7 days in a row',
    icon: 'calendar',
    requirement: 7,
    category: 'streak'
  },
  {
    id: 'room-creator',
    name: 'Room Creator',
    description: 'Create your first study room',
    icon: 'plus',
    requirement: 1,
    category: 'social'
  },
  {
    id: 'helpful-helper',
    name: 'Helpful Helper',
    description: 'Send 50 encouraging messages',
    icon: 'heart',
    requirement: 50,
    category: 'social'
  },
  {
    id: 'focus-master',
    name: 'Focus Master',
    description: 'Reach 100 hours of focus time',
    icon: 'target',
    requirement: 360000,
    category: 'focus'
  }
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Chen',
    avatar: 'avatar-1',
    focusTime: 125400,
    currentStreak: 5,
    isAI: false,
    level: 8,
    experience: 2340,
    achievements: ['first-session', 'consistent-learner', 'room-creator'],
    joinedAt: new Date('2024-01-15')
  },
  {
    id: 'ai-1',
    name: 'Study Buddy Sarah',
    avatar: 'avatar-3',
    focusTime: 89600,
    currentStreak: 3,
    isAI: true,
    level: 6,
    experience: 1820,
    achievements: ['first-session', 'marathon-studier'],
    joinedAt: new Date('2024-01-10')
  },
  {
    id: 'ai-2',
    name: 'Focus Fox Alex',
    avatar: 'avatar-5',
    focusTime: 156000,
    currentStreak: 8,
    isAI: true,
    level: 10,
    experience: 3200,
    achievements: ['first-session', 'consistent-learner', 'focus-master'],
    joinedAt: new Date('2024-01-05')
  },
  {
    id: 'user-2',
    name: 'Maria Rodriguez',
    avatar: 'avatar-2',
    focusTime: 67800,
    currentStreak: 2,
    isAI: false,
    level: 4,
    experience: 980,
    achievements: ['first-session', 'early-bird'],
    joinedAt: new Date('2024-01-20')
  },
  {
    id: 'ai-3',
    name: 'Wise Owl Emma',
    avatar: 'avatar-7',
    focusTime: 98400,
    currentStreak: 4,
    isAI: true,
    level: 7,
    experience: 2100,
    achievements: ['first-session', 'night-owl', 'helpful-helper'],
    joinedAt: new Date('2024-01-12')
  }
];

export const mockRooms: StudyRoom[] = [
  {
    id: 'room-1',
    name: 'Advanced Calculus Study Group',
    subject: 'Mathematics',
    theme: 'cozy-library',
    currentUsers: [mockUsers[0], mockUsers[1], mockUsers[2]],
    maxUsers: 8,
    isStudying: true,
    timeRemaining: 1200,
    sessionType: 'study',
    musicTrack: 'classical',
    creator: 'user-1',
    createdAt: new Date('2024-01-25T14:30:00'),
    totalStudyTime: 14400
  },
  {
    id: 'room-2',
    name: 'Physics Problem Solving',
    subject: 'Physics',
    theme: 'minimalist',
    currentUsers: [mockUsers[3], mockUsers[4]],
    maxUsers: 6,
    isStudying: false,
    timeRemaining: 300,
    sessionType: 'break',
    musicTrack: 'lofi-study',
    creator: 'user-2',
    createdAt: new Date('2024-01-25T13:00:00'),
    totalStudyTime: 7200
  },
  {
    id: 'room-3',
    name: 'Organic Chemistry Deep Dive',
    subject: 'Chemistry',
    theme: 'forest-morning',
    currentUsers: [mockUsers[0], mockUsers[4]],
    maxUsers: 10,
    isStudying: true,
    timeRemaining: 1800,
    sessionType: 'study',
    musicTrack: 'forest-ambiance',
    creator: 'ai-3',
    createdAt: new Date('2024-01-25T12:00:00'),
    totalStudyTime: 10800
  },
  {
    id: 'room-4',
    name: 'Literature Analysis Circle',
    subject: 'Literature',
    theme: 'harry-potter',
    currentUsers: [mockUsers[1], mockUsers[2], mockUsers[3]],
    maxUsers: 12,
    isStudying: false,
    timeRemaining: 180,
    sessionType: 'break',
    musicTrack: 'rain-sounds',
    creator: 'ai-1',
    createdAt: new Date('2024-01-25T11:30:00'),
    totalStudyTime: 16200
  },
  {
    id: 'room-5',
    name: 'Computer Science Algorithms',
    subject: 'Computer Science',
    theme: 'coffee-shop',
    currentUsers: [mockUsers[2]],
    maxUsers: 8,
    isStudying: true,
    timeRemaining: 900,
    sessionType: 'study',
    musicTrack: 'cafe-sounds',
    creator: 'ai-2',
    createdAt: new Date('2024-01-25T15:00:00'),
    totalStudyTime: 3600
  }
];