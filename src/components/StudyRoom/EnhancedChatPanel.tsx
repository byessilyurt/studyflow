import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Smile } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../UI/Button';
import { getAvatarUrl } from '../../utils/helpers';
import { chatService } from '../../lib/chatService';
import { useRealtimeChat } from '../../hooks/useRealtimeChat';

interface EnhancedChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

const reactions = ['👍', '🔥', '💯', '❤️', '😊'];

export const EnhancedChatPanel = ({ isOpen, onClose, roomId }: EnhancedChatPanelProps) => {
  const { state } = useAppContext();
  const [message, setMessage] = useState('');
  const { messages, isLoading, addOptimisticMessage, removeOptimisticMessage } = useRealtimeChat(roomId, isOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !state.currentUser) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      userId: state.currentUser.id,
      username: state.currentUser.name,
      message: message.trim(),
      timestamp: new Date(),
      isAI: false,
      avatar: state.currentUser.avatar,
      reactions: [],
    };

    addOptimisticMessage(optimisticMessage);
    setMessage('');

    try {
      await chatService.sendMessage(roomId, state.currentUser.id, message.trim());
      removeOptimisticMessage(tempId);
    } catch (error) {
      console.error('Error sending message:', error);
      removeOptimisticMessage(tempId);
      alert('Failed to send message. Please try again.');
    }
  };

  const getRandomRotation = () => {
    const rotations = ['-rotate-1', 'rotate-0', 'rotate-1', '-rotate-2', 'rotate-2'];
    return rotations[Math.floor(Math.random() * rotations.length)];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 top-20 w-96 z-50">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl h-full flex flex-col border-4 border-amber-200">
        <div className="flex items-center justify-between p-4 border-b-2 border-amber-200 bg-amber-100">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
            <span className="text-xl">💬</span>
            <span>Study Notes</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs mt-1">Start a conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${getRandomRotation()} animate-fade-in`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    borderLeft: msg.isAI ? '4px solid #9333ea' : '4px solid #3b82f6'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={msg.avatar || getAvatarUrl('avatar-1')}
                      alt={msg.username}
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900">{msg.username}</p>
                        {msg.isAI && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full font-medium">
                            AI
                          </span>
                        )}
                        <p className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 break-words leading-relaxed">{msg.message}</p>

                      <div className="flex items-center space-x-1 mt-2">
                        {reactions.map((reaction) => (
                          <button
                            key={reaction}
                            className="px-2 py-1 hover:bg-gray-100 rounded-md transition-colors text-sm"
                            title={`React with ${reaction}`}
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-amber-200 bg-amber-50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm bg-white"
              maxLength={200}
            />
            <Button type="submit" size="sm" disabled={!message.trim()} className="px-4">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-600">
              💡 Keep messages study-focused
            </p>
            <p className="text-xs text-gray-500">
              {message.length}/200
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
