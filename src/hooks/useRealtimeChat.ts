import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../lib/chatService';

interface Message {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  isAI: boolean;
  avatar: string;
  reactions?: Array<{ reaction: string; count: number; users: string[] }>;
}

export const useRealtimeChat = (roomId: string, isOpen: boolean) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      if (!isOpen) return;

      try {
        setIsLoading(true);
        const msgs = await chatService.getMessages(roomId);
        setMessages(msgs.map(msg => ({
          id: msg.id,
          userId: msg.user_id,
          username: msg.user.name,
          message: msg.message,
          timestamp: new Date(msg.created_at),
          isAI: msg.is_ai,
          avatar: msg.user.avatar,
          reactions: [],
        })));
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [roomId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = chatService.subscribeToMessages(roomId, (newMessage) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === newMessage.id);
        if (exists) return prev;

        return [...prev, {
          id: newMessage.id,
          userId: newMessage.user_id,
          username: newMessage.user.name,
          message: newMessage.message,
          timestamp: new Date(newMessage.created_at),
          isAI: newMessage.is_ai,
          avatar: newMessage.user.avatar,
          reactions: [],
        }];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, isOpen]);

  const addOptimisticMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, { ...message, id: `temp-${Date.now()}` }]);
  }, []);

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setMessages(prev => prev.filter(m => m.id !== tempId));
  }, []);

  return {
    messages,
    isLoading,
    addOptimisticMessage,
    removeOptimisticMessage,
  };
};
