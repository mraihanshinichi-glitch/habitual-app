"use client";

import { useState } from "react";
import { Smile, Meh, Frown, X } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { MoodType } from "@/types";

interface MoodTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mood: MoodType, note: string) => void;
}

const moods: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: "great", emoji: "😄", label: "Luar Biasa", color: "bg-green-500" },
  { type: "good", emoji: "😊", label: "Baik", color: "bg-blue-500" },
  { type: "okay", emoji: "😐", label: "Biasa Saja", color: "bg-yellow-500" },
  { type: "bad", emoji: "😔", label: "Kurang Baik", color: "bg-orange-500" },
  { type: "terrible", emoji: "😢", label: "Buruk", color: "bg-red-500" },
];

export default function MoodTracker({ isOpen, onClose, onSubmit }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!selectedMood) return;
    onSubmit(selectedMood, note);
    setSelectedMood(null);
    setNote("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bagaimana Perasaanmu Hari Ini?">
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-3">
          {moods.map((mood) => (
            <button
              key={mood.type}
              onClick={() => setSelectedMood(mood.type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedMood === mood.type
                  ? `border-primary ${mood.color} bg-opacity-20`
                  : "border-primary/20 hover:border-primary/40"
              }`}
            >
              <span className="text-4xl">{mood.emoji}</span>
              <span className="text-xs text-text-secondary text-center">{mood.label}</span>
            </button>
          ))}
        </div>

        {selectedMood && (
          <div className="animate-in fade-in duration-200">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              className="w-full px-4 py-2 bg-surface border border-primary/20 rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[80px]"
              placeholder="Apa yang membuatmu merasa seperti ini?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Lewati
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedMood}
            className="flex-1"
          >
            Simpan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
