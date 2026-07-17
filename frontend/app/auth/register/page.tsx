"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ticket, Mail, Lock, User, Globe, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto-generate slug from workspace name
  useEffect(() => {
    const slug = workspaceName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove non-word chars
      .replace(/[\s_]+/g, "-")  // Replace spaces/underscores with hyphen
      .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
    setWorkspaceSlug(slug);
  }, [workspaceName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!workspaceSlug) {
      setError("Slug workspace tidak boleh kosong.");
      setIsLoading(false);
      return;
    }

    // Mock register
    setTimeout(() => {
      setIsLoading(false);
      alert(`Workspace "${workspaceName}" (${workspaceSlug}.stick.co) berhasil didaftarkan (Demo Mode)!`);
      router.push("/auth/login");
    }, 1500);
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-center items-center px-4 py-8 bg-primary-base">
      
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

      {/* Register Card */}
      <div className="w-full max-w-md bg-secondary-panel rounded-lg border border-secondary-border p-8 shadow-2xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2 rounded-md bg-accent-orange text-primary-base">
            <Ticket className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100 font-sans mt-2">
            Mulai Workspace Anda
          </h2>
          <p className="text-xs text-secondary-text">
            Miliki sistem ticketing SaaS Anda secara instan dalam 3 detik.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded font-medium">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="fullName" className="text-xs font-semibold text-zinc-300">
              Nama Lengkap Anda
            </label>
            <div className="relative flex items-center bg-primary-base border border-secondary-border rounded focus-within:border-accent-orange transition-colors">
              <User className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                id="fullName"
                type="text"
                required
                placeholder="Rian Adiputra"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="email" className="text-xs font-semibold text-zinc-300">
              Alamat Email Bisnis
            </label>
            <div className="relative flex items-center bg-primary-base border border-secondary-border rounded focus-within:border-accent-orange transition-colors">
              <Mail className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                id="email"
                type="email"
                required
                placeholder="rian@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Workspace Name */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="workspaceName" className="text-xs font-semibold text-zinc-300">
              Nama Workspace (Nama Perusahaan / Tim)
            </label>
            <div className="relative flex items-center bg-primary-base border border-secondary-border rounded focus-within:border-accent-orange transition-colors">
              <Globe className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                id="workspaceName"
                type="text"
                required
                placeholder="Tech Support Acme"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Workspace Slug */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-zinc-300">
              Alamat Subdomain Workspace
            </label>
            <div className="flex items-center text-xs bg-secondary-panel/50 border border-secondary-border rounded p-2.5 text-zinc-400 font-mono">
              <span className="text-accent-orange font-bold mr-1">
                {workspaceSlug || "workspace-slug"}
              </span>
              <span>.stick.co</span>
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="password" className="text-xs font-semibold text-zinc-300">
              Kata Sandi Akun
            </label>
            <div className="relative flex items-center bg-primary-base border border-secondary-border rounded focus-within:border-accent-orange transition-colors">
              <Lock className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                id="password"
                type="password"
                required
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
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
              "Buat Workspace"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center border-t border-secondary-border/50 pt-4 text-xs text-secondary-text">
          Sudah memiliki akun?{" "}
          <Link href="/auth/login" className="font-semibold text-accent-orange hover:underline">
            Masuk ke Workspace
          </Link>
        </div>

      </div>
    </div>
  );
}
