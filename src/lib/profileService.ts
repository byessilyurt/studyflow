import { supabase } from './supabase';

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: {
    name?: string;
    avatar?: string;
  }) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('focus_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async getAllAchievements() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data;
  },

  async checkAndAwardAchievements(userId: string) {
    const profile = await this.getProfile(userId);
    if (!profile) return;

    const achievements = await this.getAllAchievements();
    const userAchievements = await this.getUserAchievements(userId);
    const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id));

    for (const achievement of achievements) {
      if (earnedIds.has(achievement.id)) continue;

      let shouldAward = false;

      switch (achievement.category) {
        case 'focus':
          if (achievement.name === 'First Steps' && profile.sessions_completed >= 1) {
            shouldAward = true;
          } else if (achievement.name === 'Dedicated Learner' && profile.focus_time >= 36000) {
            shouldAward = true;
          } else if (achievement.name === 'Marathon Student' && profile.focus_time >= 180000) {
            shouldAward = true;
          } else if (achievement.name === 'Focused Mind' && profile.sessions_completed >= 100) {
            shouldAward = true;
          }
          break;
        case 'streak':
          if (achievement.name === 'Week Warrior' && profile.current_streak >= 7) {
            shouldAward = true;
          } else if (achievement.name === 'Month Master' && profile.current_streak >= 30) {
            shouldAward = true;
          }
          break;
        case 'social':
          if (achievement.name === 'Social Butterfly' && profile.rooms_joined >= 10) {
            shouldAward = true;
          } else if (achievement.name === 'Room Creator' && profile.rooms_created >= 5) {
            shouldAward = true;
          }
          break;
      }

      if (shouldAward) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          });
      }
    }
  },

  async getStudySessions(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('study_sessions')
      .select(`
        *,
        room:study_rooms(name, subject)
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};
