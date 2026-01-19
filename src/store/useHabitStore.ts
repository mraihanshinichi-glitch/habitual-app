import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Habit, RecurringType, StreakData } from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { generateId } from "@/lib/utils";

interface HabitStore {
  habits: Habit[];
  isLoading: boolean;
  streak: StreakData;
  loadHabits: () => Promise<void>;
  loadStreak: () => Promise<void>;
  addHabit: (
    title: string,
    description: string,
    category: string,
    recurringType: RecurringType,
    timerDuration?: number
  ) => Promise<void>;
  updateHabit: (
    id: string,
    updates: Partial<Pick<Habit, "title" | "description" | "category" | "recurringType" | "timerDuration">>
  ) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  unarchiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  startTimer: (id: string) => Promise<void>;
  stopTimer: (id: string, completed: boolean) => Promise<void>;
  getTodayProgress: () => number;
  resetRecurringHabits: () => Promise<void>;
  updateStreak: () => Promise<void>;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      isLoading: false,
      streak: {
        currentStreak: 0,
        lastCompletedDate: null,
        longestStreak: 0,
      },

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
        recurringType: (h.recurring_type || "once") as RecurringType,
        lastCompletedDate: h.last_completed_date ? new Date(h.last_completed_date) : undefined,
        timerDuration: h.timer_duration || undefined,
        timerStartedAt: h.timer_started_at ? new Date(h.timer_started_at) : undefined,
        createdAt: new Date(h.created_at),
        completedAt: h.completed_at ? new Date(h.completed_at) : undefined,
      }));

      set({ habits, isLoading: false });
    } catch (error) {
      console.error("Error loading habits:", error);
      set({ isLoading: false });
    }
  },

  // Load streak data
  loadStreak: async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        set({
          streak: {
            currentStreak: data.current_streak,
            lastCompletedDate: data.last_completed_date,
            longestStreak: data.longest_streak,
          },
        });
      }
    } catch (error) {
      console.error("Error loading streak:", error);
    }
  },

  // Add new habit
  addHabit: async (title, description, category, recurringType = "once", timerDuration) => {
    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      const newHabit: Habit = {
        id: generateId(),
        title,
        description: description || undefined,
        category,
        status: "active",
        recurringType,
        timerDuration,
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
          recurring_type: recurringType,
          timer_duration: timerDuration || null,
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
          recurringType: (data.recurring_type || "once") as RecurringType,
          lastCompletedDate: data.last_completed_date ? new Date(data.last_completed_date) : undefined,
          timerDuration: data.timer_duration || undefined,
          timerStartedAt: data.timer_started_at ? new Date(data.timer_started_at) : undefined,
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

      // Update streak if completing a task
      if (newStatus === "completed") {
        get().updateStreak();
      }
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

      // Update streak if completing a task (don't await to avoid blocking UI)
      if (newStatus === "completed") {
        get().updateStreak().catch((err) => console.error("Error updating streak:", err));
      }
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

  // Unarchive habit
  unarchiveHabit: async (id) => {
    // If Supabase not configured, use localStorage
    if (!isSupabaseConfigured) {
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, status: "active" as const } : h
        ),
      }));
      return;
    }

    try {
      const { error } = await supabase
        .from("habits")
        .update({ status: "active" })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, status: "active" as const } : h
        ),
      }));
    } catch (error) {
      console.error("Error unarchiving habit:", error);
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

  // Reset recurring habits (daily/weekly)
  resetRecurringHabits: async () => {
    if (!isSupabaseConfigured) {
      // For localStorage, reset based on date
      const today = new Date();
      const todayDate = today.toDateString();
      const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      set((state) => ({
        habits: state.habits.map((h) => {
          if (h.status === "completed" && h.completedAt) {
            const completedDate = new Date(h.completedAt);
            const completedDateStr = completedDate.toDateString();

            // Reset daily habits if not completed today
            if (h.recurringType === "daily" && completedDateStr !== todayDate) {
              return { ...h, status: "active", completedAt: undefined };
            }

            // Reset weekly habits if it's Monday and not completed today
            if (h.recurringType === "weekly" && todayDay === 1 && completedDateStr !== todayDate) {
              return { ...h, status: "active", completedAt: undefined };
            }
          }
          return h;
        }),
      }));
      return;
    }

    try {
      // Call Supabase function to reset
      const { error } = await supabase.rpc("reset_recurring_habits");
      if (error) throw error;

      // Reload habits
      await get().loadHabits();
    } catch (error) {
      console.error("Error resetting habits:", error);
    }
  },

  // Update streak when completing a task
  updateStreak: async () => {
    console.log("updateStreak called");
    
    if (!isSupabaseConfigured) {
      // For localStorage, just update local state
      const today = new Date().toISOString().split("T")[0];
      const { streak } = get();
      
      console.log("Current streak:", streak);
      console.log("Today:", today);
      
      if (streak.lastCompletedDate === today) {
        console.log("Already updated today");
        return; // Already updated today
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;
      if (streak.lastCompletedDate === yesterdayStr) {
        newStreak = streak.currentStreak + 1;
      }

      console.log("New streak:", newStreak);

      set({
        streak: {
          currentStreak: newStreak,
          lastCompletedDate: today,
          longestStreak: Math.max(newStreak, streak.longestStreak),
        },
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split("T")[0];
      
      console.log("Supabase mode - updating streak for today:", today);
      
      // Get current streak
      const { data: currentStreak, error: fetchError } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log("Current streak from DB:", currentStreak);
      console.log("Fetch error:", fetchError);

      if (!currentStreak || fetchError?.code === "PGRST116") {
        // Create new streak
        console.log("Creating new streak");
        const { error: insertError } = await supabase.from("user_streaks").insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_completed_date: today,
        });
        
        if (insertError) {
          console.error("Error inserting streak:", insertError);
          throw insertError;
        }
        
        set({
          streak: {
            currentStreak: 1,
            lastCompletedDate: today,
            longestStreak: 1,
          },
        });
        return;
      }

      // Check if already updated today
      if (currentStreak.last_completed_date === today) {
        return;
      }

      // Calculate new streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;
      if (currentStreak.last_completed_date === yesterdayStr) {
        newStreak = currentStreak.current_streak + 1;
      }

      const newLongest = Math.max(newStreak, currentStreak.longest_streak);

      // Update streak
      await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_completed_date: today,
        })
        .eq("user_id", user.id);

      set({
        streak: {
          currentStreak: newStreak,
          lastCompletedDate: today,
          longestStreak: newLongest,
        },
      });
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  },

  // Update habit
  updateHabit: async (id, updates) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, ...updates } : h
        ),
      }));
      return;
    }

    try {
      const { error } = await supabase
        .from("habits")
        .update({
          title: updates.title,
          description: updates.description || null,
          category: updates.category,
          recurring_type: updates.recurringType,
          timer_duration: updates.timerDuration || null,
        })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, ...updates } : h
        ),
      }));
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  },

  // Start timer
  startTimer: async (id) => {
    const now = new Date();
    
    if (!isSupabaseConfigured) {
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, timerStartedAt: now } : h
        ),
      }));
      return;
    }

    try {
      const { error } = await supabase
        .from("habits")
        .update({
          timer_started_at: now.toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, timerStartedAt: now } : h
        ),
      }));
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  },

  // Stop timer
  stopTimer: async (id, completed) => {
    if (!isSupabaseConfigured) {
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id
            ? {
                ...h,
                timerStartedAt: undefined,
                status: completed ? "completed" : h.status,
                completedAt: completed ? new Date() : h.completedAt,
              }
            : h
        ),
      }));

      if (completed) {
        get().updateStreak();
      }
      return;
    }

    try {
      const updates: any = {
        timer_started_at: null,
      };

      if (completed) {
        updates.status = "completed";
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === id
            ? {
                ...h,
                timerStartedAt: undefined,
                status: completed ? "completed" : h.status,
                completedAt: completed ? new Date() : h.completedAt,
              }
            : h
        ),
      }));

      if (completed) {
        get().updateStreak();
      }
    } catch (error) {
      console.error("Error stopping timer:", error);
    }
  },
    }),
    {
      name: "habitual-storage",
    }
  )
);
