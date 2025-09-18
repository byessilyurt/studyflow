export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const calculateLevel = (experience: number): number => {
  return Math.floor(experience / 1000) + 1;
};

export const calculateExperienceForNextLevel = (experience: number): number => {
  const currentLevel = calculateLevel(experience);
  return currentLevel * 1000 - experience;
};

export const getAvatarUrl = (avatarId: string): string => {
  // Using DiceBear API for consistent, cute avatars
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarId}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=20`;
};

export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const getThemeGradient = (themeName: string): string => {
  const themes: Record<string, string> = {
    'cozy-library': 'from-amber-50 to-orange-100',
    'rainy-night': 'from-slate-800 to-slate-900',
    'forest-morning': 'from-green-50 to-emerald-100',
    'coffee-shop': 'from-amber-100 to-yellow-100',
    'minimalist': 'from-gray-50 to-white',
    'harry-potter': 'from-purple-100 to-indigo-200'
  };
  
  return themes[themeName] || 'from-blue-50 to-indigo-100';
};

export const getRandomEncouragingMessage = (): string => {
  const messages = [
    "Great focus everyone! 🎯",
    "You're doing amazing! Keep it up! 💪",
    "Focus mode activated! 🧠✨",
    "Study time = growth time! 🌱",
    "Consistency is key! 🔑",
    "Every minute counts! ⏰",
    "Knowledge is power! 📚⚡",
    "You've got this! 🌟",
    "Learning never stops! 🚀",
    "Focus brings results! 🎯"
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};