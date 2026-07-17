import Link from "next/link";
import { Ticket } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-base border-t border-secondary-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-accent-orange text-primary-base">
              <Ticket className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-100">
              stick<span className="text-accent-orange">.</span>
            </span>
          </Link>
          <p className="text-xs text-secondary-text mt-1 text-center md:text-left">
            Sistem ticketing sederhana, cepat, dan terorganisir untuk efisiensi tim Anda.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-secondary-text">
          <Link href="#features" className="hover:text-zinc-100 transition-colors duration-200">
            Fitur
          </Link>
          <Link href="#about" className="hover:text-zinc-100 transition-colors duration-200">
            Tentang Aplikasi
          </Link>
          <Link href="#pricing" className="hover:text-zinc-100 transition-colors duration-200">
            Harga
          </Link>
          <Link href="/privacy" className="hover:text-zinc-100 transition-colors duration-200">
            Privasi
          </Link>
          <Link href="/terms" className="hover:text-zinc-100 transition-colors duration-200">
            Ketentuan
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-xs text-secondary-text text-center md:text-right">
          <p>&copy; {currentYear} stick. Hak Cipta Dilindungi.</p>
          <p className="text-[10px] mt-0.5 text-zinc-600">Dibuat dengan Next.js & FastAPI</p>
        </div>
      </div>
    </footer>
  );
}
