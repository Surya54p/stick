"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  
  // User profile states
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  
  // Password change states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
      setEmail(user.email || "");
      setFullName(user.full_name || "");
    } else {
      router.push("/auth/login");
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload: any = {
        full_name: fullName,
        email: email
      };

      const updated = await apiRequest("/auth/me", "PUT", payload);
      
      // Update localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const newUser = { ...user, email: updated.email, full_name: updated.full_name };
        localStorage.setItem("user", JSON.stringify(newUser));
      }

      setSuccessMsg("Informasi profil berhasil diperbarui!");
      
      // Refresh header initials/names in 1.5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1200);

    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui profil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg("Kata sandi baru tidak boleh kosong.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await apiRequest("/auth/me", "PUT", {
        password: password
      });

      setSuccessMsg("Kata sandi berhasil diperbarui!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left max-w-4xl font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col gap-1.5 border-b border-secondary-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <User className="h-5.5 w-5.5 text-accent-orange" />
          Profil Saya
        </h1>
        <p className="text-xs text-secondary-text">
          Kelola informasi nama lengkap, alamat email, dan ubah kata sandi login Anda.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Side: General Profile Form */}
        <div className="bg-secondary-panel rounded-lg border border-secondary-border p-6 shadow-2xl flex flex-col gap-4">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-secondary-border/50 pb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-zinc-500" />
            Informasi Diri
          </h3>

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-[11px] font-semibold text-zinc-400">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="Nama Lengkap Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 pl-9 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-accent-orange w-full transition-colors"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-semibold text-zinc-400">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="email@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 pl-9 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-accent-orange w-full transition-colors"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
              </div>
            </div>

            {/* Save Profile Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Informasi Diri
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Side: Password Change Form */}
        <div className="bg-secondary-panel rounded-lg border border-secondary-border p-6 shadow-2xl flex flex-col gap-4">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-secondary-border/50 pb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-zinc-500" />
            Ubah Kata Sandi
          </h3>

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPass" className="text-[11px] font-semibold text-zinc-400">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="newPass"
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 pl-9 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-accent-orange w-full transition-colors"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPass" className="text-[11px] font-semibold text-zinc-400">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="confirmPass"
                  type="password"
                  required
                  placeholder="Ketik ulang kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 pl-9 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-accent-orange w-full transition-colors"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
              </div>
            </div>

            {/* Save Password Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all duration-200 shadow-md active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Perbarui Kata Sandi
                </>
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
