import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility untuk menggabungkan className dengan Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mendapatkan greeting berdasarkan waktu
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return "Selamat Pagi";
  if (hour < 18) return "Selamat Siang";
  return "Selamat Malam";
}

// Mendapatkan warna badge berdasarkan kategori
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Olahraga: "bg-purple-600",
    Kerja: "bg-violet-600",
    Belajar: "bg-indigo-600",
    Kesehatan: "bg-fuchsia-600",
    Lainnya: "bg-purple-500",
  };
  
  // Untuk kategori custom, gunakan warna random tapi konsisten
  if (!colors[category]) {
    const hash = category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorOptions = ["bg-purple-600", "bg-violet-600", "bg-indigo-600", "bg-fuchsia-600", "bg-pink-600", "bg-purple-500"];
    return colorOptions[hash % colorOptions.length];
  }
  
  return colors[category];
}

// Generate ID unik
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
