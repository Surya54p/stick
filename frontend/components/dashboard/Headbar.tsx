"use client";

import Link from "next/link";
import { Ticket, Menu, Bell, User, ChevronDown, Search } from "lucide-react";

interface HeadbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Headbar({ sidebarOpen, setSidebarOpen }: HeadbarProps) {
  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-secondary-panel border-b border-secondary-border backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center justify-between h-full">
        
        {/* Left Side: Logo & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded text-secondary-text hover:text-zinc-100 hover:bg-primary-base/50 md:hidden focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="p-1 rounded bg-accent-orange text-primary-base">
              <Ticket className="h-4.5 w-4.5 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-100">
              stick<span className="text-accent-orange font-bold">.</span>
            </span>
          </Link>

          {/* Workspace Switcher / Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-base border border-secondary-border text-[11px] font-semibold text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono">tech-support-acme</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Center: Search (optional mockup) */}
        <div className="hidden md:flex items-center gap-2 bg-primary-base border border-secondary-border rounded px-3 py-1.5 w-80">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari tiket, anggota..."
            disabled
            className="bg-transparent text-xs w-full focus:outline-none text-zinc-200 placeholder-zinc-600"
          />
        </div>

        {/* Right Side: Profile & Notifications */}
        <div className="flex items-center gap-4">
          
          {/* Notifications */}
          <button className="p-1.5 rounded text-secondary-text hover:text-zinc-100 hover:bg-primary-base/50 transition-colors relative">
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-orange" />
            <Bell className="h-4.5 w-4.5" />
          </button>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-2.5 border-l border-secondary-border pl-4">
            <div className="w-7 h-7 rounded bg-accent-orange/10 border border-accent-orange/30 text-accent-orange flex items-center justify-center font-bold text-xs">
              RA
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[11px] font-bold text-zinc-200">Rian Adiputra</span>
              <span className="text-[9px] text-zinc-500 font-mono">Administrator</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
