"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import Card from "../ui/Card";
import { Habit } from "@/types";
import { getCategoryColor } from "@/lib/utils";

interface CategoryStatsProps {
  habits: Habit[];
  period?: number; // days
}

export default function CategoryStats({ habits, period = 30 }: CategoryStatsProps) {
  const stats = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);

    const completedHabits = habits.filter(
      (h) =>
        h.status === "completed" &&
        h.completedAt &&
        new Date(h.completedAt) >= cutoffDate
    );

    if (completedHabits.length === 0) return [];

    const categoryCount: Record<string, number> = {};
    completedHabits.forEach((h) => {
      categoryCount[h.category] = (categoryCount[h.category] || 0) + 1;
    });

    const total = completedHabits.length;
    return Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
        color: getCategoryColor(category),
      }))
      .sort((a, b) => b.count - a.count);
  }, [habits, period]);

  if (stats.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            Statistik Kategori
          </h3>
        </div>
        <p className="text-text-secondary text-center py-8">
          Belum ada data untuk {period} hari terakhir
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Statistik Kategori
          </h3>
          <p className="text-sm text-text-secondary">
            {period} hari terakhir
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.category}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">
                {stat.category}
              </span>
              <span className="text-sm text-text-secondary">
                {stat.count} tugas ({stat.percentage}%)
              </span>
            </div>
            <div className="w-full h-3 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.color} transition-all duration-500`}
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {stats.length > 0 && (
        <div className="mt-6 pt-6 border-t border-primary/10">
          <p className="text-sm text-text-secondary text-center">
            {stats[0].percentage >= 50
              ? `🎯 Fokus utama: ${stats[0].category} (${stats[0].percentage}%)`
              : stats.length >= 3
              ? "📊 Distribusi cukup seimbang"
              : "💪 Terus tingkatkan konsistensi!"}
          </p>
        </div>
      )}
    </Card>
  );
}
