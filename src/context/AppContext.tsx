import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, StudyRoom, ChatMessage, StudySession, UserStats } from '../types';
import { mockUsers, mockRooms } from '../data/mockData';

interface AppState {
  currentUser: User | null;
  currentRoom: StudyRoom | null;
  rooms: StudyRoom[];
  users: User[];
  chatMessages: ChatMessage[];
  userStats: UserStats;
  isAuthenticated: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'JOIN_ROOM'; payload: StudyRoom }
  | { type: 'LEAVE_ROOM' }
  | { type: 'UPDATE_ROOM'; payload: StudyRoom }
  | { type: 'ADD_ROOM'; payload: StudyRoom }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_USER_STATS'; payload: Partial<UserStats> }
  | { type: 'UPDATE_TIMER'; payload: { timeRemaining: number; sessionType: 'study' | 'break' } }
  | { type: 'COMPLETE_SESSION'; payload: StudySession }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

const initialState: AppState = {
  currentUser: null,
  currentRoom: null,
  rooms: mockRooms,
  users: mockUsers,
  chatMessages: [],
  userStats: {
    totalFocusTime: 0,
    sessionsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    roomsCreated: 0,
    roomsJoined: 0,
    level: 1,
    experience: 0
  },
  isAuthenticated: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
        userStats: {
          totalFocusTime: action.payload.focusTime,
          sessionsCompleted: Math.floor(action.payload.focusTime / 1500),
          currentStreak: action.payload.currentStreak,
          longestStreak: action.payload.currentStreak,
          roomsCreated: 0,
          roomsJoined: 5,
          level: action.payload.level,
          experience: action.payload.experience
        }
      };
    
    case 'JOIN_ROOM':
      const updatedRoom = {
        ...action.payload,
        currentUsers: state.currentUser
          ? [...action.payload.currentUsers.filter(u => u.id !== state.currentUser.id), state.currentUser]
          : action.payload.currentUsers
      };
      
      return {
        ...state,
        currentRoom: updatedRoom,
        rooms: state.rooms.map(room => 
          room.id === action.payload.id ? updatedRoom : room
        )
      };
    
    case 'LEAVE_ROOM':
      return {
        ...state,
        currentRoom: null,
        chatMessages: []
      };
    
    case 'UPDATE_ROOM':
      return {
        ...state,
        currentRoom: state.currentRoom?.id === action.payload.id ? action.payload : state.currentRoom,
        rooms: state.rooms.map(room => 
          room.id === action.payload.id ? action.payload : room
        )
      };
    
    case 'ADD_ROOM':
      return {
        ...state,
        rooms: [action.payload, ...state.rooms]
      };
    
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload]
      };
    
    case 'UPDATE_USER_STATS':
      return {
        ...state,
        userStats: { ...state.userStats, ...action.payload }
      };
    
    case 'UPDATE_TIMER':
      if (!state.currentRoom) return state;
      
      const updatedCurrentRoom = {
        ...state.currentRoom,
        timeRemaining: action.payload.timeRemaining,
        sessionType: action.payload.sessionType
      };
      
      return {
        ...state,
        currentRoom: updatedCurrentRoom,
        rooms: state.rooms.map(room => 
          room.id === state.currentRoom?.id ? updatedCurrentRoom : room
        )
      };
    
    case 'COMPLETE_SESSION':
      const focusTime = action.payload.focusTime;
      const newExperience = state.userStats.experience + Math.floor(focusTime / 60) * 10;
      const newLevel = Math.floor(newExperience / 1000) + 1;
      
      return {
        ...state,
        userStats: {
          ...state.userStats,
          totalFocusTime: state.userStats.totalFocusTime + focusTime,
          sessionsCompleted: state.userStats.sessionsCompleted + 1,
          experience: newExperience,
          level: newLevel
        }
      };
    
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('study-focus-user');
    const savedStats = localStorage.getItem('study-focus-stats');
    
    if (savedUser && savedStats) {
      const user = JSON.parse(savedUser);
      const stats = JSON.parse(savedStats);
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'UPDATE_USER_STATS', payload: stats });
    }
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (state.currentUser && state.isAuthenticated) {
      localStorage.setItem('study-focus-user', JSON.stringify(state.currentUser));
      localStorage.setItem('study-focus-stats', JSON.stringify(state.userStats));
    }
  }, [state.currentUser, state.userStats, state.isAuthenticated]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};