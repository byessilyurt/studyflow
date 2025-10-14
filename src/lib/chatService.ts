import { supabase } from './supabase';

export const chatService = {
  async getMessages(roomId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(roomId: string, userId: string, message: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        message,
        is_ai: false,
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToMessages(roomId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`chat:${roomId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user:profiles(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback(data);
          }
        }
      )
      .subscribe((status) => {
        console.log('Chat subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  },
};
