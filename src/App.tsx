import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { LandingPage } from './pages/LandingPage';
import { RoomBrowser } from './pages/RoomBrowser';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { StudyRoomInterface } from './components/StudyRoom/StudyRoomInterface';
import { LoginModal } from './components/Auth/LoginModal';

function AppContent() {
  const { state, dispatch } = useAppContext();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!state.currentUser && !state.isAuthenticated) {
      const timer = setTimeout(() => {
        setShowLoginModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.currentUser, state.isAuthenticated]);

  const handleLogin = () => {
    setShowLoginModal(false);
  };

  const handleJoinRoom = (roomId: string) => {
    const room = state.rooms.find(r => r.id === roomId);
    if (room) {
      dispatch({ type: 'JOIN_ROOM', payload: room });
      setCurrentRoomId(roomId);
      setCurrentPage('room');
    }
  };

  const handleLeaveRoom = () => {
    dispatch({ type: 'LEAVE_ROOM' });
    setCurrentRoomId(null);
    setCurrentPage('rooms');
  };

  const currentRoom = state.rooms.find(r => r.id === currentRoomId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show header only when not in a study room */}
      {currentPage !== 'room' && (
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      )}

      {/* Main Content */}
      <main>
        {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
        {currentPage === 'rooms' && <RoomBrowser onJoinRoom={handleJoinRoom} />}
        {currentPage === 'leaderboard' && <LeaderboardPage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'room' && currentRoom && (
          <StudyRoomInterface room={currentRoom} onLeave={handleLeaveRoom} />
        )}
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;