import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserSettings {
  studyDuration: number;
  breakDuration: number;
  musicVolume: number;
  ambientVolumes: {
    lofi: number;
    rain: number;
    cafe: number;
    fireplace: number;
  };
  themePreference: string;
}

const defaultSettings: UserSettings = {
  studyDuration: 25,
  breakDuration: 5,
  musicVolume: 0.5,
  ambientVolumes: {
    lofi: 0.5,
    rain: 0,
    cafe: 0,
    fireplace: 0,
  },
  themePreference: 'cozy-library',
};

export const useUserSettings = (userId: string | undefined) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings({
            studyDuration: data.study_duration,
            breakDuration: data.break_duration,
            musicVolume: data.music_volume,
            ambientVolumes: data.ambient_volumes,
            themePreference: data.theme_preference,
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();

    const channel = supabase
      .channel(`user-settings:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const data = payload.new;
          setSettings({
            studyDuration: data.study_duration,
            breakDuration: data.break_duration,
            musicVolume: data.music_volume,
            ambientVolumes: data.ambient_volumes,
            themePreference: data.theme_preference,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!userId) return;

    const dbUpdates: any = {};
    if (updates.studyDuration !== undefined) dbUpdates.study_duration = updates.studyDuration;
    if (updates.breakDuration !== undefined) dbUpdates.break_duration = updates.breakDuration;
    if (updates.musicVolume !== undefined) dbUpdates.music_volume = updates.musicVolume;
    if (updates.ambientVolumes !== undefined) dbUpdates.ambient_volumes = updates.ambientVolumes;
    if (updates.themePreference !== undefined) dbUpdates.theme_preference = updates.themePreference;

    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...dbUpdates }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating settings:', error);
      throw error;
    }

    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings, isLoading };
};
