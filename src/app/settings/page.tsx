"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Plus, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import Navbar from "@/components/features/Navbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, isLoading: authLoading } = useAuthStore();
  const { theme, toggleTheme, customCategories, addCategory, removeCategory, loadSettings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [newCategory, setNewCategory] = useState("");

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
      loadSettings();
    }
  }, [isAuthenticated, loadSettings]);

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

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory);
      setNewCategory("");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Pengaturan
          </h1>
          <p className="text-text-secondary">
            Sesuaikan aplikasi sesuai preferensi Anda
          </p>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Tema Aplikasi
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="w-6 h-6 text-primary" />
                ) : (
                  <Sun className="w-6 h-6 text-primary" />
                )}
                <div>
                  <p className="text-text-primary font-medium">
                    {theme === "dark" ? "Mode Gelap" : "Mode Terang"}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Ubah tampilan aplikasi
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={toggleTheme}
                className="flex items-center gap-2"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4" />
                    Terang
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    Gelap
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Category Management */}
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Kelola Kategori
            </h2>
            
            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Nama kategori baru..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="primary">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </form>

            {/* Default Categories */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-text-secondary mb-3">
                Kategori Default
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="bg-purple-600">Olahraga</Badge>
                <Badge variant="bg-violet-600">Kerja</Badge>
                <Badge variant="bg-indigo-600">Belajar</Badge>
                <Badge variant="bg-fuchsia-600">Kesehatan</Badge>
                <Badge variant="bg-purple-500">Lainnya</Badge>
              </div>
            </div>

            {/* Custom Categories */}
            {customCategories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3">
                  Kategori Custom
                </h3>
                <div className="flex flex-wrap gap-2">
                  {customCategories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium"
                    >
                      <span>{category}</span>
                      <button
                        onClick={() => removeCategory(category)}
                        className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {customCategories.length === 0 && (
              <p className="text-sm text-text-secondary italic">
                Belum ada kategori custom. Tambahkan kategori baru di atas.
              </p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
