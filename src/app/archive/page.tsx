"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Archive as ArchiveIcon } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useHabitStore } from "@/store/useHabitStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import Navbar from "@/components/features/Navbar";
import HabitCard from "@/components/features/HabitCard";
import SearchAndFilter from "@/components/features/SearchAndFilter";

type SortType = "name-asc" | "name-desc" | "category" | "date-new" | "date-old";

export default function ArchivePage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuthStore();
  const { habits: allHabits, loadHabits } = useHabitStore();
  const { getAllCategories, loadSettings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("date-new");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, mounted, authLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      loadHabits();
      loadSettings();
    }
  }, [isAuthenticated, loadHabits, loadSettings]);

  // Filter dan sort habits
  const filteredAndSortedHabits = useMemo(() => {
    // Get archived habits only
    let habits = allHabits.filter((h) => h.status === "archived");

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

  const allCategories = getAllCategories();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Arsip Kebiasaan
          </h1>
          <p className="text-text-secondary">
            Kebiasaan yang telah Anda arsipkan
          </p>
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

        {/* Archived Habits List */}
        {filteredAndSortedHabits.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <ArchiveIcon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {searchQuery || selectedCategory !== "all" 
                ? "Tidak ada hasil" 
                : "Belum ada arsip"}
            </h3>
            <p className="text-text-secondary">
              {searchQuery || selectedCategory !== "all"
                ? "Coba ubah pencarian atau filter Anda"
                : "Kebiasaan yang diarsipkan akan muncul di sini"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
