// Tipe data untuk kategori tugas (bisa string untuk custom categories)
export type Category = string;

// Tipe data untuk status tugas
export type TaskStatus = "active" | "completed" | "archived";

// Interface untuk Habit/Task
export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: Category;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
}

// Interface untuk User
export interface User {
  id: string;
  name: string;
  email: string;
}
