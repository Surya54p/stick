"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ticket, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simple simulation for landing page dummy
    setTimeout(() => {
      setIsLoading(false);
      if (email === "demo@stick.co" && password === "demo123") {
        // Successful login mock
        alert("Login berhasil (Demo)!");
        // We'll redirect them to dashboard later, let's redirect to home for now or dashboard mock
        router.push("/dashboard");
      } else {
        setError("Email atau kata sandi salah. Gunakan demo@stick.co / demo123");
      }
    }, 1200);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 bg-primary-base">
      
      {/* Back Button */}
      <div className="w-full max-w-md mb-6 text-left">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-secondary-text hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-secondary-panel rounded-lg border border-secondary-border p-8 shadow-2xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2 rounded-md bg-accent-orange text-primary-base">
            <Ticket className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 font-sans mt-2">
            Masuk ke stick<span className="text-accent-orange">.</span>
          </h2>
          <p className="text-xs text-secondary-text">
            Gunakan akun demo: <code className="text-accent-orange px-1 bg-primary-base rounded">demo@stick.co</code> / <code className="text-accent-orange px-1 bg-primary-base rounded">demo123</code>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded font-medium">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="email" className="text-xs font-semibold text-zinc-300">
              Alamat Email
            </label>
            <div className="relative flex items-center bg-primary-base border border-secondary-border rounded focus-within:border-accent-orange transition-colors">
              <Mail className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                id="email"
                type="email"
                required
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold text-zinc-300">
                Kata Sandi
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-[10px] text-accent-orange hover:underline font-semibold"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative flex items-center bg-primary-base border border-secondary-border rounded focus-within:border-accent-orange transition-colors">
              <Lock className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-zinc-500 hover:text-zinc-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover disabled:bg-accent-orange/50 disabled:cursor-not-allowed rounded transition-all duration-200 shadow-lg shadow-accent-orange/10 font-sans active:scale-[0.99] flex justify-center items-center"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center border-t border-secondary-border/50 pt-4 text-xs text-secondary-text">
          Belum memiliki workspace?{" "}
          <Link href="/auth/register" className="font-semibold text-accent-orange hover:underline">
            Buat Baru
          </Link>
        </div>

      </div>
    </div>
  );
}
