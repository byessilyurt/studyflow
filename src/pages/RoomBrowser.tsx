import React, { useState } from 'react';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { RoomCard } from '../components/StudyRoom/RoomCard';
import { CreateRoomModal } from '../components/StudyRoom/CreateRoomModal';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { useAppContext } from '../context/AppContext';
import { subjects } from '../data/mockData';
import { roomService } from '../lib/roomService';

interface RoomBrowserProps {
  onJoinRoom: (roomId: string) => void;
}

export const RoomBrowser = ({ onJoinRoom }: RoomBrowserProps) => {
  const { state, dispatch } = useAppContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRooms = state.rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === '' || room.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleCreateRoom = async (room: any) => {
    if (!state.currentUser) return;

    try {
      const newRoom = await roomService.createRoom({
        name: room.name,
        subject: room.subject,
        theme: room.theme,
        maxUsers: room.maxUsers,
        musicTrack: room.musicTrack,
        creatorId: state.currentUser.id,
      });

      const transformedRoom = {
        ...room,
        id: newRoom.id,
        creator: state.currentUser.name,
        createdAt: new Date(newRoom.created_at),
        currentUsers: [state.currentUser],
      };

      dispatch({ type: 'ADD_ROOM', payload: transformedRoom });
      setShowCreateModal(false);

      onJoinRoom(newRoom.id);
    } catch (error: any) {
      console.error('Error creating room:', error);
      alert(error.message || 'Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = async (room: any) => {
    if (!state.currentUser) return;

    try {
      await roomService.joinRoom(room.id, state.currentUser.id);
      dispatch({ type: 'JOIN_ROOM', payload: room });
      onJoinRoom(room.id);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Study Rooms</h1>
          <p className="text-lg text-gray-600">Find the perfect study environment for your learning goals</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Subject Filter */}
            <div className="flex space-x-4">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create Room
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="text-3xl font-bold text-white mb-2">{state.rooms.length}</div>
            <div className="text-blue-100">Active Rooms</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-r from-green-500 to-green-600">
            <div className="text-3xl font-bold text-white mb-2">
              {state.rooms.reduce((total, room) => total + room.currentUsers.length, 0)}
            </div>
            <div className="text-green-100">Students Studying</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-r from-purple-500 to-purple-600">
            <div className="text-3xl font-bold text-white mb-2">
              {subjects.length}
            </div>
            <div className="text-purple-100">Study Subjects</div>
          </Card>
        </div>

        {/* Room Grid */}
        {filteredRooms.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedSubject 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to create a study room!'}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create First Room
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={handleJoinRoom}
              />
            ))}
          </div>
        )}

        {/* Create Room Modal */}
        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
          currentUser={state.currentUser}
        />
      </div>
    </div>
  );
};