"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await register(name, email, password);
    
    if (result.success) {
      if (result.error) {
        // Email confirmation required
        setError(result.error);
        setIsLoading(false);
      } else {
        // Directly logged in
        router.push("/dashboard");
      }
    } else {
      setError(result.error || "Gagal membuat akun. Pastikan semua field terisi dengan benar.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Habitual</h1>
          <p className="text-text-secondary">Buat akun baru</p>
        </div>

        {/* Form */}
        <div className="bg-surface border border-primary/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nama"
              type="text"
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className={`text-sm p-3 rounded-lg ${
                error.includes("cek email") 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Daftar"}
            </Button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:text-primary-light">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
