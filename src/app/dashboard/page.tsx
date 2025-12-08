"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useHabitStore } from "@/store/useHabitStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import Navbar from "@/components/features/Navbar";
import HabitCard from "@/components/features/HabitCard";
import AddHabitModal from "@/components/features/AddHabitModal";
import SearchAndFilter from "@/components/features/SearchAndFilter";
import StreakDisplay from "@/components/features/StreakDisplay";
import CategoryStats from "@/components/features/CategoryStats";
import MoodTracker from "@/components/features/MoodTracker";
import Button from "@/components/ui/Button";
import { getGreeting } from "@/lib/utils";
import { Habit, MoodType } from "@/types";

type SortType = "name-asc" | "name-desc" | "category" | "date-new" | "date-old";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth, isLoading: authLoading } = useAuthStore();
  const { habits: allHabits, getTodayProgress, loadHabits, loadStreak, resetRecurringHabits, streak } = useHabitStore();
  const { getAllCategories, loadSettings } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoodTrackerOpen, setIsMoodTrackerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("date-new");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      // Check if mood was tracked today
      const today = new Date().toISOString().split("T")[0];
      const lastMoodDate = localStorage.getItem("lastMoodDate");
      
      if (lastMoodDate !== today) {
        // Show mood tracker after 1 second
        setTimeout(() => {
          setIsMoodTrackerOpen(true);
        }, 1000);
      }
    }
  }, [mounted, isAuthenticated]);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, mounted, authLoading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadHabits();
      loadSettings();
      loadStreak();
      resetRecurringHabits();
    }
  }, [isAuthenticated, user, loadHabits, loadSettings, loadStreak, resetRecurringHabits]);

  // Filter dan sort habits
  const filteredAndSortedHabits = useMemo(() => {
    // Get active habits only
    let habits = allHabits.filter((h) => h.status !== "archived");

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      habits = habits.filter(
        (habit) =>
          habit.title.toLowerCase().includes(query) ||
          habit.description?.toLowerCase().includes(query) ||
          habit.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      habits = habits.filter((habit) => habit.category === selectedCategory);
    }

    // Sort habits
    const sorted = [...habits];
    switch (sortBy) {
      case "name-asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "category":
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case "date-new":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "date-old":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    return sorted;
  }, [allHabits, searchQuery, selectedCategory, sortBy]);

  if (!mounted || authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Memuat...</p>
        </div>
      </div>
    );
  }

  const progress = getTodayProgress();
  const allCategories = getAllCategories();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {getGreeting()}, {user?.name}! 👋
          </h1>
          <p className="text-text-secondary">
            Mari kita bangun kebiasaan baik hari ini
          </p>
        </div>

        {/* Streak Display */}
        <div className="mb-6">
          <StreakDisplay 
            currentStreak={streak.currentStreak} 
            longestStreak={streak.longestStreak}
          />
        </div>

        {/* Category Statistics */}
        <div className="mb-6">
          <CategoryStats habits={allHabits} period={30} />
        </div>

        {/* Progress Bar */}
        <div className="bg-surface border border-primary/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary">Progress Hari Ini</span>
            <span className="text-2xl font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Kebiasaan Hari Ini
          </h2>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tambah Tugas
          </Button>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categories={allCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Habits List */}
        {filteredAndSortedHabits.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {searchQuery || selectedCategory !== "all" 
                ? "Tidak ada hasil" 
                : "Belum ada kebiasaan"}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchQuery || selectedCategory !== "all"
                ? "Coba ubah pencarian atau filter Anda"
                : "Mulai dengan menambahkan kebiasaan pertama Anda"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Tambah Kebiasaan
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      <MoodTracker
        isOpen={isMoodTrackerOpen}
        onClose={() => setIsMoodTrackerOpen(false)}
        onSubmit={(mood: MoodType, note: string) => {
          // Save mood to localStorage for now
          const today = new Date().toISOString().split("T")[0];
          localStorage.setItem("lastMoodDate", today);
          localStorage.setItem(`mood_${today}`, JSON.stringify({ mood, note }));
          console.log("Mood saved:", mood, note);
        }}
      />
    </div>
  );
}
