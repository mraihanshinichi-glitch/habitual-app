"use client";

import { useState } from "react";
import { Repeat, Calendar, Sparkles } from "lucide-react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useHabitStore } from "@/store/useHabitStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { RecurringType } from "@/types";
import { habitTemplates } from "@/lib/habitTemplates";

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
  const [recurringType, setRecurringType] = useState<RecurringType>("once");
  const [showTemplates, setShowTemplates] = useState(false);
  const { addHabit } = useHabitStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    addHabit(title, description, category, recurringType);
    
    // Reset form
    setTitle("");
    setDescription("");
    setCategory(categories[0]);
    setRecurringType("once");
    onClose();
  };

  const handleTemplateSelect = async (templateId: string) => {
    const template = habitTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // Add all tasks from template
    for (const task of template.tasks) {
      await addHabit(task.title, "", task.category, task.recurringType);
    }

    setShowTemplates(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Kebiasaan Baru">
      {showTemplates ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Pilih Template</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(false)}
            >
              Kembali
            </Button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {habitTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className="w-full text-left p-4 bg-surface border border-primary/20 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.name.split(" ")[0]}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary mb-1">
                      {template.name.split(" ").slice(1).join(" ")}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {template.tasks.length} tugas
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Button */}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowTemplates(true)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Gunakan Template
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-text-secondary">atau buat manual</span>
            </div>
          </div>

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
      )}
    </Modal>
  );
}
