import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Habit } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateId } from "@/lib/utils";

interface HabitStore {
  habits: Habit[];
  isLoading: boolean;
  loadHabits: () => Promise<void>;
  addHabit: (title: string, description: string, category: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  getTodayProgress: () => number;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      isLoading: false,

      // Load habits from Supabase or localStorage
      loadHabits: async () => {
        // If Supabase not configured, habits are already loaded from localStorage
        if (!isSupabaseConfigured) {
          return;
        }

        set({ isLoading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ habits: [], isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const habits: Habit[] = (data || []).map((h: any) => ({
        id: h.id,
        title: h.title,
        description: h.description || undefined,
        category: h.category,
        status: h.status as "active" | "completed" | "archived",
        createdAt: new Date(h.created_at),
        completedAt: h.completed_at ? new Date(h.completed_at) : undefined,
      }));

      set({ habits, isLoading: false });
    } catch (error) {
      console.error("Error loading habits:", error);
      set({ isLoading: false });
    }
  },

  // Add new habit
  addHabit: async (title, description, category) => {
    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      const newHabit: Habit = {
        id: generateId(),
        title,
        description: description || undefined,
        category,
        status: "active",
        createdAt: new Date(),
      };
      set((state) => ({ habits: [newHabit, ...state.habits] }));
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          category,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newHabit: Habit = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          category: data.category,
          status: data.status as "active" | "completed" | "archived",
          createdAt: new Date(data.created_at),
          completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        };

        set((state) => ({ habits: [newHabit, ...state.habits] }));
      }
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  },

  // Toggle complete status
  toggleComplete: async (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return;

    const newStatus = habit.status === "completed" ? "active" : "completed";
    const completedAt = newStatus === "completed" ? new Date() : undefined;

    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id
            ? { ...h, status: newStatus as "active" | "completed", completedAt }
            : h
        ),
      }));
      return;
    }

    try {
      const completedAtISO = completedAt ? completedAt.toISOString() : null;

      const { error } = await supabase
        .from("habits")
        .update({
          status: newStatus,
          completed_at: completedAtISO,
        })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id
            ? { ...h, status: newStatus as "active" | "completed", completedAt }
            : h
        ),
      }));
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  },

  // Archive habit
  archiveHabit: async (id) => {
    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, status: "archived" as const } : h
        ),
      }));
      return;
    }

    try {
      const { error } = await supabase
        .from("habits")
        .update({ status: "archived" })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, status: "archived" as const } : h
        ),
      }));
    } catch (error) {
      console.error("Error archiving habit:", error);
    }
  },

  // Delete habit
  deleteHabit: async (id) => {
    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      }));
      return;
    }

    try {
      const { error } = await supabase.from("habits").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  },

  // Calculate today's progress
  getTodayProgress: () => {
    const activeHabits = get().habits.filter((h) => h.status !== "archived");
    if (activeHabits.length === 0) return 0;

    const completed = activeHabits.filter((h) => h.status === "completed").length;
    return Math.round((completed / activeHabits.length) * 100);
  },
    }),
    {
      name: "habitual-storage",
    }
  )
);
