import { HabitTemplate } from "@/types";

export const habitTemplates: HabitTemplate[] = [
  {
    id: "morning-routine",
    name: "🌅 Rutinitas Pagi",
    tasks: [
      { title: "Bangun pagi jam 6", category: "Kesehatan", recurringType: "daily" },
      { title: "Minum air putih 2 gelas", category: "Kesehatan", recurringType: "daily" },
      { title: "Olahraga 15 menit", category: "Olahraga", recurringType: "daily" },
      { title: "Sarapan sehat", category: "Kesehatan", recurringType: "daily" },
    ],
  },
  {
    id: "fitness",
    name: "💪 Program Fitness",
    tasks: [
      { title: "Cardio 30 menit", category: "Olahraga", recurringType: "daily" },
      { title: "Strength training", category: "Olahraga", recurringType: "weekly" },
      { title: "Yoga/Stretching", category: "Olahraga", recurringType: "daily" },
      { title: "Track kalori harian", category: "Kesehatan", recurringType: "daily" },
    ],
  },
  {
    id: "productivity",
    name: "📚 Produktivitas",
    tasks: [
      { title: "Baca buku 30 menit", category: "Belajar", recurringType: "daily" },
      { title: "Review goals mingguan", category: "Kerja", recurringType: "weekly" },
      { title: "Journaling", category: "Lainnya", recurringType: "daily" },
      { title: "Belajar skill baru", category: "Belajar", recurringType: "daily" },
    ],
  },
  {
    id: "wellness",
    name: "🧘 Kesehatan Mental",
    tasks: [
      { title: "Meditasi 10 menit", category: "Kesehatan", recurringType: "daily" },
      { title: "Gratitude journal", category: "Lainnya", recurringType: "daily" },
      { title: "Tidur 8 jam", category: "Kesehatan", recurringType: "daily" },
      { title: "Digital detox 1 jam", category: "Kesehatan", recurringType: "daily" },
    ],
  },
  {
    id: "work",
    name: "💼 Rutinitas Kerja",
    tasks: [
      { title: "Planning harian", category: "Kerja", recurringType: "daily" },
      { title: "Deep work 2 jam", category: "Kerja", recurringType: "daily" },
      { title: "Review email", category: "Kerja", recurringType: "daily" },
      { title: "Weekly review", category: "Kerja", recurringType: "weekly" },
    ],
  },
];
