import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

  // Check authentication status
  checkAuth: async () => {
    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      // Check if we have persisted auth data
      const persistedState = localStorage.getItem("habitual-auth");
      if (persistedState) {
        try {
          const parsedState = JSON.parse(persistedState);
          if (parsedState.state && parsedState.state.isAuthenticated) {
            set({
              user: parsedState.state.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        } catch (e) {
          console.error("Error parsing persisted auth:", e);
        }
      }
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          set({
            user: {
              id: profile.id,
              name: profile.name,
              email: profile.email,
            },
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }

      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error("Auth check error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Login with Supabase or localStorage
  login: async (email, password) => {
    // If Supabase not configured, use localStorage (mock)
    if (!isSupabaseConfigured) {
      if (email && password.length >= 6) {
        const user: User = {
          id: "local-user-1",
          name: email.split("@")[0],
          email,
        };
        set({ user, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: "Email atau password tidak valid" };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profile) {
          set({
            user: {
              id: profile.id,
              name: profile.name,
              email: profile.email,
            },
            isAuthenticated: true,
          });
          return { success: true };
        }
      }

      return { success: false, error: "Profile not found" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Register with Supabase or localStorage
  register: async (name, email, password) => {
    // If Supabase not configured, use localStorage (mock)
    if (!isSupabaseConfigured) {
      if (name && email && password.length >= 6) {
        const user: User = {
          id: "local-user-1",
          name,
          email,
        };
        set({ user, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, error: "Gagal membuat akun" };
    }

    try {
      // Sign up user with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          // User is automatically logged in (email confirmation disabled)
          // Profile and settings will be created automatically by trigger
          await new Promise((resolve) => setTimeout(resolve, 500));

          set({
            user: {
              id: data.user.id,
              name,
              email,
            },
            isAuthenticated: true,
          });

          return { success: true };
        } else {
          // Email confirmation required
          return {
            success: true,
            error: "Silakan cek email Anda untuk konfirmasi akun. Setelah konfirmasi, Anda bisa login.",
          };
        }
      }

      return { success: false, error: "Registration failed" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null, isAuthenticated: false });
  },
    }),
    {
      name: "habitual-auth",
    }
  )
);
