"use client";

import { Search, ArrowUpDown } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useState } from "react";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "name-asc" | "name-desc" | "category" | "date-new" | "date-old";
  onSortChange: (sort: "name-asc" | "name-desc" | "category" | "date-new" | "date-old") => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function SearchAndFilter({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: SearchAndFilterProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: "name-asc", label: "Nama A-Z" },
    { value: "name-desc", label: "Nama Z-A" },
    { value: "category", label: "Kategori" },
    { value: "date-new", label: "Terbaru" },
    { value: "date-old", label: "Terlama" },
  ] as const;

  const getSortLabel = () => {
    return sortOptions.find((opt) => opt.value === sortBy)?.label || "Urutkan";
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Cari tugas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-primary/20 rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Filter & Sort */}
      <div className="flex flex-wrap gap-3">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onCategoryChange("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:text-text-primary border border-primary/20"
            }`}
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:text-text-primary border border-primary/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative ml-auto">
          <Button
            variant="secondary"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            {getSortLabel()}
          </Button>

          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute right-0 top-12 z-20 bg-surface border border-primary/20 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      sortBy === option.value
                        ? "bg-primary/20 text-primary"
                        : "text-text-secondary hover:bg-primary/10 hover:text-text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
