"use client";

import { Habit } from "@/types";
import { Check, MoreVertical, Archive, Trash2 } from "lucide-react";
import { useState } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { getCategoryColor, cn } from "@/lib/utils";
import { useHabitStore } from "@/store/useHabitStore";

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { toggleComplete, archiveHabit, deleteHabit } = useHabitStore();

  const isCompleted = habit.status === "completed";

  return (
    <Card className={cn("relative", isCompleted && "opacity-60")}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => toggleComplete(habit.id)}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all",
            "flex items-center justify-center",
            isCompleted
              ? "bg-primary border-primary"
              : "border-primary/40 hover:border-primary"
          )}
        >
          {isCompleted && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-lg font-semibold text-text-primary mb-1",
              isCompleted && "line-through"
            )}
          >
            {habit.title}
          </h3>
          {habit.description && (
            <p className="text-sm text-text-secondary mb-3">{habit.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getCategoryColor(habit.category)}>
              {habit.category}
            </Badge>
            {habit.recurringType !== "once" && (
              <Badge variant="bg-indigo-600">
                {habit.recurringType === "daily" ? "🔄 Harian" : "📅 Mingguan"}
              </Badge>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-2"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 z-20 bg-surface border border-primary/20 rounded-lg shadow-xl overflow-hidden min-w-[150px]">
                <button
                  onClick={() => {
                    archiveHabit(habit.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-primary/10 hover:text-text-primary flex items-center gap-2 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Arsipkan
                </button>
                <button
                  onClick={() => {
                    deleteHabit(habit.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
