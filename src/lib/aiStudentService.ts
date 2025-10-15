import { supabase } from './supabase';

const motivationalMessages = [
  "Keep going! You're doing great 💪",
  "I just finished my Pomodoro 🎉",
  "Focus is the key to success! 🔑",
  "Taking a quick break, be right back! ☕",
  "This study session is so productive! 📚",
  "Remember to stay hydrated! 💧",
  "You've got this! 🌟",
  "Learning something new every day! 🧠",
  "Time flies when you're focused! ⏰",
  "Great energy in this room! ⚡",
  "Just unlocked a new achievement! 🏆",
  "This material is getting easier! 📈",
  "Break time well deserved! 🎯",
  "Back to the grind! Let's do this! 💼",
  "Feeling motivated today! 🚀"
];

export const aiStudentService = {
  async getAIStudentsForRoom(roomId: string) {
    const { data, error } = await supabase
      .from('room_ai_students')
      .select(`
        ai_student:ai_students(*)
      `)
      .eq('room_id', roomId);

    if (error) throw error;
    return data.map(item => item.ai_student);
  },

  async sendAIMessage(roomId: string, aiStudentId: string, aiStudentName: string) {
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: aiStudentId,
        message,
        is_ai: true,
      });

    if (error) throw error;
  },

  async startAIBehavior(roomId: string) {
    const aiStudents = await this.getAIStudentsForRoom(roomId);

    const sendRandomMessage = async () => {
      if (aiStudents.length === 0) return;

      const randomAI = aiStudents[Math.floor(Math.random() * aiStudents.length)];

      if (Math.random() < 0.3) {
        try {
          await this.sendAIMessage(roomId, randomAI.id, randomAI.name);
        } catch (error) {
          console.error('Error sending AI message:', error);
        }
      }
    };

    const interval = setInterval(sendRandomMessage, 120000);

    return () => clearInterval(interval);
  },
};
