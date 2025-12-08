"use client";

import { useState, useEffect } from "react";
import { Repeat, Calendar, Timer as TimerIcon } from "lucide-react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useHabitStore } from "@/store/useHabitStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { RecurringType, Habit } from "@/types";

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit;
}

export default function EditHabitModal({ isOpen, onClose, habit }: EditHabitModalProps) {
  const { getAllCategories } = useSettingsStore();
  const categories = getAllCategories();
  
  const [title, setTitle] = useState(habit.title);
  const [description, setDescription] = useState(habit.description || "");
  const [category, setCategory] = useState(habit.category);
  const [recurringType, setRecurringType] = useState<RecurringType>(habit.recurringType);
  const [timerDuration, setTimerDuration] = useState(habit.timerDuration?.toString() || "");
  const { updateHabit } = useHabitStore();

  // Update form when habit changes
  useEffect(() => {
    setTitle(habit.title);
    setDescription(habit.description || "");
    setCategory(habit.category);
    setRecurringType(habit.recurringType);
    setTimerDuration(habit.timerDuration?.toString() || "");
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    await updateHabit(habit.id, {
      title,
      description,
      category,
      recurringType,
      timerDuration: timerDuration ? parseInt(timerDuration) : undefined,
    });
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Kebiasaan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Judul Kebiasaan"
          placeholder="Contoh: Olahraga pagi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Deskripsi (Opsional)
          </label>
          <textarea
            className="w-full px-4 py-2 bg-surface border border-primary/20 rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[80px]"
            placeholder="Tambahkan detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Recurring Type */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
            <Repeat className="w-4 h-4" />
            Frekuensi
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRecurringType("once")}
              className={`px-4 py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                recurringType === "once"
                  ? "border-primary bg-primary/20 text-text-primary"
                  : "border-primary/20 text-text-secondary hover:border-primary/40"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Sekali</span>
            </button>
            <button
              type="button"
              onClick={() => setRecurringType("daily")}
              className={`px-4 py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                recurringType === "daily"
                  ? "border-primary bg-primary/20 text-text-primary"
                  : "border-primary/20 text-text-secondary hover:border-primary/40"
              }`}
            >
              <Repeat className="w-5 h-5" />
              <span className="text-sm font-medium">Harian</span>
            </button>
            <button
              type="button"
              onClick={() => setRecurringType("weekly")}
              className={`px-4 py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                recurringType === "weekly"
                  ? "border-primary bg-primary/20 text-text-primary"
                  : "border-primary/20 text-text-secondary hover:border-primary/40"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Mingguan</span>
            </button>
          </div>
        </div>

        {/* Timer Duration */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
            <TimerIcon className="w-4 h-4" />
            Timer (Opsional)
          </label>
          <Input
            type="number"
            placeholder="Durasi dalam menit (kosongkan jika tidak perlu)"
            value={timerDuration}
            onChange={(e) => setTimerDuration(e.target.value)}
            min="1"
            max="480"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Kategori
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  category === cat
                    ? "border-primary bg-primary/20 text-text-primary"
                    : "border-primary/20 text-text-secondary hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
