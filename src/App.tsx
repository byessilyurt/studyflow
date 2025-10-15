import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { LandingPage } from './pages/LandingPage';
import { RoomBrowser } from './pages/RoomBrowser';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ImmersiveStudyRoom } from './components/StudyRoom/ImmersiveStudyRoom';
import { LoginModal } from './components/Auth/LoginModal';
import { roomService } from './lib/roomService';

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

  const handleJoinRoom = async (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentPage('room');

    let room = state.rooms.find(r => r.id === roomId);

    if (!room) {
      try {
        const roomData = await roomService.getRoomById(roomId);
        if (roomData) {
          room = {
            id: roomData.id,
            name: roomData.name,
            subject: roomData.subject,
            theme: roomData.theme,
            maxUsers: roomData.max_users,
            creator: roomData.creator?.name || 'Unknown',
            createdAt: new Date(roomData.created_at),
            currentUsers: roomData.participants?.map((p: any) => p.user) || [],
          };
          dispatch({ type: 'ADD_ROOM', payload: room });
        }
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    }

    if (room) {
      dispatch({ type: 'JOIN_ROOM', payload: room });
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
          <ImmersiveStudyRoom room={currentRoom} onLeave={handleLeaveRoom} />
        )}
        {currentPage === 'room' && !currentRoom && (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-700">Loading room...</p>
            </div>
          </div>
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