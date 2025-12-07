"use client";

import { Flame } from "lucide-react";
import Card from "../ui/Card";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Glow effect */}
      {currentStreak > 0 && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-primary/10 to-transparent" />
      )}
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`relative ${currentStreak > 0 ? "animate-pulse" : ""}`}>
            <Flame 
              className={`w-12 h-12 ${
                currentStreak > 0 
                  ? "text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                  : "text-text-secondary"
              }`}
              fill={currentStreak > 0 ? "currentColor" : "none"}
            />
            {currentStreak > 0 && (
              <div className="absolute inset-0 blur-xl bg-orange-500/30 -z-10" />
            )}
          </div>
          
          <div>
            <p className="text-sm text-text-secondary mb-1">Streak Saat Ini</p>
            <p className="text-3xl font-bold text-text-primary">
              {currentStreak} <span className="text-lg text-text-secondary">hari</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-text-secondary mb-1">Terpanjang</p>
          <p className="text-2xl font-bold text-primary">
            {longestStreak} <span className="text-sm text-text-secondary">hari</span>
          </p>
        </div>
      </div>

      {currentStreak > 0 && (
        <div className="mt-4 pt-4 border-t border-primary/10">
          <p className="text-sm text-text-secondary text-center">
            {currentStreak >= 7 
              ? "🔥 Luar biasa! Pertahankan!"
              : currentStreak >= 3
              ? "💪 Terus semangat!"
              : "✨ Awal yang bagus!"}
          </p>
        </div>
      )}
    </Card>
  );
}
