import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a dummy client if not configured (for development without Supabase)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
        };
        Update: {
          name?: string;
          email?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          status: "active" | "completed" | "archived";
          created_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          status?: "active" | "completed" | "archived";
          completed_at?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: string;
          status?: "active" | "completed" | "archived";
          completed_at?: string | null;
        };
      };
      custom_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: "light" | "dark";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: "light" | "dark";
        };
        Update: {
          theme?: "light" | "dark";
        };
      };
    };
  };
}
