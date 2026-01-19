"use client";

import { Habit } from "@/types";
import { Check, MoreVertical, Archive, Trash2, Edit, Timer, Play, Pause, ArchiveRestore } from "lucide-react";
import { useState, useEffect } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { getCategoryColor, cn } from "@/lib/utils";
import { useHabitStore } from "@/store/useHabitStore";
import EditHabitModal from "./EditHabitModal";

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerComplete, setShowTimerComplete] = useState(false);
  const { toggleComplete, archiveHabit, unarchiveHabit, deleteHabit, startTimer, stopTimer } = useHabitStore();

  const isCompleted = habit.status === "completed";
  const hasTimer = habit.timerDuration && habit.timerDuration > 0;

  // Timer logic
  useEffect(() => {
    if (!hasTimer || !habit.timerStartedAt) {
      setIsTimerRunning(false);
      setTimeRemaining(null);
      return;
    }

    const startTime = new Date(habit.timerStartedAt).getTime();
    const duration = habit.timerDuration! * 60 * 1000; // convert to ms
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeRemaining(Math.ceil(remaining / 1000)); // convert to seconds
      setIsTimerRunning(remaining > 0);
      
      if (remaining === 0 && !showTimerComplete) {
        setShowTimerComplete(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [hasTimer, habit.timerStartedAt, habit.timerDuration, showTimerComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTimer = async () => {
    await startTimer(habit.id);
  };

  const handleTimerComplete = async (completed: boolean) => {
    await stopTimer(habit.id, completed);
    setShowTimerComplete(false);
  };

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
        <div className="flex-1 min-w-0 pr-12">
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
        <div className="relative z-30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-2 z-30"
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
                {habit.status === "archived" ? (
                  <>
                    <button
                      onClick={() => {
                        unarchiveHabit(habit.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-primary/10 hover:text-text-primary flex items-center gap-2 transition-colors"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                      Batalkan Arsip
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
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-primary/10 hover:text-text-primary flex items-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
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
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-primary/10 hover:text-text-primary flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Timer Section */}
      {hasTimer && (
        <div className="mt-4 pt-4 border-t border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary">
                {habit.timerDuration} menit
              </span>
            </div>
            
            {isTimerRunning && timeRemaining !== null ? (
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-lg font-bold",
                  timeRemaining < 60 ? "text-red-500" : "text-primary"
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            ) : habit.timerStartedAt ? (
              <span className="text-sm text-text-secondary">Timer selesai</span>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={handleStartTimer}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Mulai
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Timer Complete Dialog */}
      {showTimerComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-primary/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-text-primary mb-4">
              ⏰ Waktu Habis!
            </h3>
            <p className="text-text-secondary mb-6">
              Apakah kamu sudah menyelesaikan tugas ini?
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => handleTimerComplete(false)}
                className="flex-1"
              >
                Belum
              </Button>
              <Button
                variant="primary"
                onClick={() => handleTimerComplete(true)}
                className="flex-1"
              >
                Sudah Selesai
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditHabitModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        habit={habit}
      />
    </Card>
  );
}
