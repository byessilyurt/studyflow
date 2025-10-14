export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar: string
          focus_time: number
          current_streak: number
          longest_streak: number
          level: number
          experience: number
          sessions_completed: number
          rooms_created: number
          rooms_joined: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar?: string
          focus_time?: number
          current_streak?: number
          longest_streak?: number
          level?: number
          experience?: number
          sessions_completed?: number
          rooms_created?: number
          rooms_joined?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar?: string
          focus_time?: number
          current_streak?: number
          longest_streak?: number
          level?: number
          experience?: number
          sessions_completed?: number
          rooms_created?: number
          rooms_joined?: number
          created_at?: string
          updated_at?: string
        }
      }
      study_rooms: {
        Row: {
          id: string
          name: string
          subject: string
          theme: string
          max_users: number
          is_studying: boolean
          time_remaining: number
          session_type: string
          music_track: string
          creator_id: string
          total_study_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          theme?: string
          max_users?: number
          is_studying?: boolean
          time_remaining?: number
          session_type?: string
          music_track?: string
          creator_id: string
          total_study_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          theme?: string
          max_users?: number
          is_studying?: boolean
          time_remaining?: number
          session_type?: string
          music_track?: string
          creator_id?: string
          total_study_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          joined_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          joined_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          joined_at?: string
          is_active?: boolean
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          message: string
          is_ai: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          message: string
          is_ai?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          message?: string
          is_ai?: boolean
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          requirement: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          requirement: number
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          requirement?: number
          category?: string
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          room_id: string
          start_time: string
          end_time: string | null
          focus_time: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          start_time?: string
          end_time?: string | null
          focus_time?: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          start_time?: string
          end_time?: string | null
          focus_time?: number
          completed?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
