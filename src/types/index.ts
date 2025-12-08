// Tipe data untuk kategori tugas (bisa string untuk custom categories)
export type Category = string;

// Tipe data untuk status tugas
export type TaskStatus = "active" | "completed" | "archived";

// Tipe data untuk recurring frequency
export type RecurringType = "once" | "daily" | "weekly";

// Tipe data untuk mood
export type MoodType = "great" | "good" | "okay" | "bad" | "terrible";

// Interface untuk Habit/Task
export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: Category;
  status: TaskStatus;
  recurringType: RecurringType;
  lastCompletedDate?: Date;
  timerDuration?: number; // in minutes
  timerStartedAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}

// Interface untuk Daily Mood
export interface DailyMood {
  id: string;
  userId: string;
  mood: MoodType;
  note?: string;
  date: string;
  createdAt: Date;
}

// Interface untuk Statistics
export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

// Interface untuk Streak
export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null;
  longestStreak: number;
}

// Template tugas
export interface HabitTemplate {
  id: string;
  name: string;
  tasks: {
    title: string;
    category: string;
    recurringType: RecurringType;
  }[];
}

// Interface untuk User
export interface User {
  id: string;
  name: string;
  email: string;
}
