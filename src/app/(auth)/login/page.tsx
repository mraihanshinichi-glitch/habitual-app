"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Email atau password tidak valid");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-2xl mb-4" />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Habitual</h1>
          <p className="text-text-secondary">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        {/* Form */}
        <div className="bg-surface border border-primary/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              error={error}
            />

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary hover:text-primary-light">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
