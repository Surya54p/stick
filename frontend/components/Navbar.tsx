"use client";

import { useState } from "react";
import Link from "next/link";
import { Ticket, Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-primary-base/80 backdrop-blur-md border-b border-secondary-border transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-md bg-accent-orange text-primary-base transition-transform group-hover:scale-105 duration-200">
                <Ticket className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-100 font-sans">
                stick<span className="text-accent-orange font-bold">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-secondary-text hover:text-zinc-100 transition-colors duration-200">
              Fitur
            </Link>
            <Link href="#about" className="text-sm font-medium text-secondary-text hover:text-zinc-100 transition-colors duration-200">
              Tentang Aplikasi
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-secondary-text hover:text-zinc-100 transition-colors duration-200">
              Harga
            </Link>
            <Link href="#faq" className="text-sm font-medium text-secondary-text hover:text-zinc-100 transition-colors duration-200">
              FAQ
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-zinc-100 hover:text-accent-orange transition-colors duration-200 px-3 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded-md transition-all duration-200 active:scale-[0.98] shadow-lg shadow-accent-orange/10 border border-accent-orange"
            >
              Buat Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-text hover:text-zinc-100 hover:bg-secondary-panel transition-colors duration-200 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-screen opacity-100 border-b border-secondary-border" : "max-h-0 opacity-0 overflow-hidden"}`}>
        <div className="px-2 pt-2 pb-4 space-y-1 bg-primary-base sm:px-3">
          <Link
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-secondary-text hover:text-zinc-100 hover:bg-secondary-panel transition-colors"
          >
            Fitur
          </Link>
          <Link
            href="#about"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-secondary-text hover:text-zinc-100 hover:bg-secondary-panel transition-colors"
          >
            Tentang Aplikasi
          </Link>
          <Link
            href="#pricing"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-secondary-text hover:text-zinc-100 hover:bg-secondary-panel transition-colors"
          >
            Harga
          </Link>
          <Link
            href="#faq"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-secondary-text hover:text-zinc-100 hover:bg-secondary-panel transition-colors"
          >
            FAQ
          </Link>
          <div className="pt-4 pb-2 border-t border-secondary-border flex flex-col gap-2 px-3">
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="flex justify-center w-full py-2.5 text-center text-base font-medium text-zinc-100 border border-secondary-border rounded-md hover:bg-secondary-panel transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setIsOpen(false)}
              className="flex justify-center w-full py-2.5 text-center text-base font-semibold text-primary-base bg-accent-orange rounded-md hover:bg-accent-orange-hover transition-colors"
            >
              Buat Workspace
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
