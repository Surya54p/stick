import Link from "next/link";
import { ArrowRight, Play, ShieldAlert } from "lucide-react";
import TicketMockup from "./TicketMockup";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 bg-primary-base">
      {/* Decorative gradient overlay behind content */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.08),transparent_55%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12 relative z-10">
        
        {/* Tagline / Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-panel border border-secondary-border text-xs text-secondary-text">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
          <span>SaaS Ticketing Terisolasi & Instan</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="flex flex-col gap-5 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.1] font-sans">
            Solusi Ticketing Simpel<br />
            Untuk <span className="text-accent-orange">Skala Bisnis Anda</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-secondary-text max-w-2xl mx-auto leading-relaxed">
            Buka workspace ticketing mandiri untuk tim support Anda dalam hitungan detik. Layani klien dengan antarmuka yang tajam, minimalis, dan dirancang khusus untuk kecepatan kerja.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded-md transition-all duration-200 shadow-xl shadow-accent-orange/10 hover:shadow-accent-orange/20 active:scale-[0.98]"
          >
            Mulai Sekarang — Gratis
            <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
          </Link>
          <Link
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-zinc-300 hover:text-zinc-100 bg-secondary-panel hover:bg-zinc-900 border border-secondary-border rounded-md transition-all duration-200 active:scale-[0.98]"
          >
            Pelajari Fitur
          </Link>
        </div>

        {/* Live Interactive Demo Embed */}
        <div className="w-full max-w-4xl mt-4">
          <div className="flex items-center justify-between mb-3 text-xs text-secondary-text px-2">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Coba Klik Tiket di Bawah Ini:
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px]">
              Tipe Warna: <span className="text-zinc-400 font-mono bg-secondary-panel border border-secondary-border px-1.5 py-0.5 rounded">60% Hitam (Base) : 30% Zinc (Panel) : 10% Jingga (Aksen)</span>
            </span>
          </div>
          <TicketMockup />
        </div>
      </div>
    </section>
  );
}
