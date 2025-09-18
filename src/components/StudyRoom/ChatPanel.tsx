import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../UI/Button';
import { getAvatarUrl } from '../../utils/helpers';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export const ChatPanel = ({ isOpen, onClose, roomId }: ChatPanelProps) => {
  const { state, dispatch } = useAppContext();
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !state.currentUser) return;

    const chatMessage = {
      id: Math.random().toString(),
      userId: state.currentUser.id,
      username: state.currentUser.name,
      message: message.trim(),
      timestamp: new Date(),
      isAI: false
    };

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: chatMessage });
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 top-20 w-80 z-50">
      <div className="bg-white rounded-xl shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Chat</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {state.chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs mt-1">Start a conversation to encourage each other!</p>
            </div>
          ) : (
            state.chatMessages.map(msg => (
              <div key={msg.id} className="flex space-x-2">
                <img
                  src={getAvatarUrl(state.users.find(u => u.id === msg.userId)?.avatar || 'avatar-1')}
                  alt={msg.username}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-sm text-gray-900">{msg.username}</p>
                    {msg.isAI && (
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                        AI
                      </span>
                    )}
                    <p className="text-xs text-gray-500">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 break-words">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Encourage your study buddies..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              maxLength={200}
            />
            <Button type="submit" size="sm" disabled={!message.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Keep messages study-focused and encouraging!
          </p>
        </form>
      </div>
    </div>
  );
};