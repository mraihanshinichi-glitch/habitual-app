import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface SettingsStore {
  theme: "light" | "dark";
  customCategories: string[];
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: "light" | "dark") => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  removeCategory: (category: string) => Promise<void>;
  getAllCategories: () => string[];
}

// Kategori default
const DEFAULT_CATEGORIES: string[] = ["Olahraga", "Kerja", "Belajar", "Kesehatan", "Lainnya"];

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      customCategories: [],
      isLoading: false,

      // Load settings from Supabase or localStorage
      loadSettings: async () => {
        // If Supabase not configured, settings are already loaded from localStorage
        if (!isSupabaseConfigured) {
          return;
        }

        set({ isLoading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }

      // Load theme
      const { data: settings } = await supabase
        .from("user_settings")
        .select("theme")
        .eq("user_id", user.id)
        .single();

      // Load custom categories
      const { data: categories } = await supabase
        .from("custom_categories")
        .select("name")
        .eq("user_id", user.id);

      set({
        theme: settings?.theme || "dark",
        customCategories: categories?.map((c) => c.name) || [],
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      set({ isLoading: false });
    }
  },

  // Toggle tema
  toggleTheme: async () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    await get().setTheme(newTheme);
  },

  // Set tema
  setTheme: async (theme) => {
    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      set({ theme });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          theme,
        });

      if (error) throw error;

      set({ theme });
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  },

  // Tambah kategori custom
  addCategory: async (category) => {
    const trimmed = category.trim();
    if (!trimmed) return;

    const allCategories = get().getAllCategories();
    if (allCategories.includes(trimmed)) return;

    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      set((state) => ({
        customCategories: [...state.customCategories, trimmed],
      }));
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("custom_categories")
        .insert({
          user_id: user.id,
          name: trimmed,
        });

      if (error) throw error;

      set((state) => ({
        customCategories: [...state.customCategories, trimmed],
      }));
    } catch (error) {
      console.error("Error adding category:", error);
    }
  },

  // Hapus kategori custom
  removeCategory: async (category) => {
    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      set((state) => ({
        customCategories: state.customCategories.filter((c) => c !== category),
      }));
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("custom_categories")
        .delete()
        .eq("user_id", user.id)
        .eq("name", category);

      if (error) throw error;

      set((state) => ({
        customCategories: state.customCategories.filter((c) => c !== category),
      }));
    } catch (error) {
      console.error("Error removing category:", error);
    }
  },

  // Ambil semua kategori (default + custom)
  getAllCategories: () => {
    return [...DEFAULT_CATEGORIES, ...get().customCategories];
  },
    }),
    {
      name: "habitual-settings",
    }
  )
);
