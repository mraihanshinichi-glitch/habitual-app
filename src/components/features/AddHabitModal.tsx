"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useHabitStore } from "@/store/useHabitStore";
import { useSettingsStore } from "@/store/useSettingsStore";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const { getAllCategories } = useSettingsStore();
  const categories = getAllCategories();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const { addHabit } = useHabitStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    addHabit(title, description, category);
    
    // Reset form
    setTitle("");
    setDescription("");
    setCategory(categories[0]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Kebiasaan Baru">
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
            className="w-full px-4 py-2 bg-surface border border-primary/20 rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[100px]"
            placeholder="Tambahkan detail tentang kebiasaan ini..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            Tambah
          </Button>
        </div>
      </form>
    </Modal>
  );
}
