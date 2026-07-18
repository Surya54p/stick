"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Menu, Bell, User, Search } from "lucide-react";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import { apiRequest } from "@/lib/api";

interface HeadbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Headbar({ sidebarOpen, setSidebarOpen }: HeadbarProps) {
  const router = useRouter();
  const [workspaceSlug, setWorkspaceSlug] = useState("tech-support-acme");
  const [workspaceName, setWorkspaceName] = useState("Tech Support Acme");
  const [currentWorkspaceType, setCurrentWorkspaceType] = useState<"Pribadi" | "Private" | "Publik">("Private");
  const [userName, setUserName] = useState("Rian Adiputra");
  const [userInitials, setUserInitials] = useState("RA");
  const [userRole, setUserRole] = useState("Administrator");
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    const ws = localStorage.getItem("current_workspace");
    const userStr = localStorage.getItem("user");
    
    if (ws) {
      const parsedWs = JSON.parse(ws);
      setWorkspaceSlug(parsedWs.slug);
      setWorkspaceName(parsedWs.name);
      if (parsedWs.role) {
        setUserRole(parsedWs.role);
      }
      const type = parsedWs.slug === "tech-support-acme" ? "Private" :
                   parsedWs.slug === "operations-team" ? "Pribadi" :
                   parsedWs.role === "Admin" ? "Private" : "Publik";
      setCurrentWorkspaceType(type);
    }
    
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUserName(parsedUser.full_name || parsedUser.email);
      const nameParts = (parsedUser.full_name || "").split(" ");
      const initials = nameParts.map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "US";
      setUserInitials(initials);
    }

    const fetchWorkspaces = async () => {
      try {
        const list = await apiRequest("/workspaces");
        setWorkspaces(list);
      } catch (err: any) {
        if (err.message === "User not found" || err.message.includes("credentials") || err.message.includes("authenticated")) {
          localStorage.clear();
          router.push("/auth/login");
        } else {
          console.error("Gagal mengambil daftar workspace:", err.message);
        }
      }
    };
    fetchWorkspaces();
  }, []);

  const handleWorkspaceSelect = (ws: any) => {
    const type = ws.slug === "tech-support-acme" ? "Private" :
                 ws.slug === "operations-team" ? "Pribadi" :
                 ws.role === "Admin" ? "Private" : "Publik";

    localStorage.setItem("current_workspace", JSON.stringify({
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      role: ws.role
    }));
    setWorkspaceSlug(ws.slug);
    setWorkspaceName(ws.name);
    setCurrentWorkspaceType(type);
    setUserRole(ws.role);
    // Reload page to refresh all dashboard context data
    window.location.reload();
  };

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
 
          {/* Workspace Switcher Component */}
          <WorkspaceSwitcher
            workspaceSlug={workspaceSlug}
            workspaceName={workspaceName}
            currentWorkspaceType={currentWorkspaceType}
            workspaces={workspaces}
            onWorkspaceSelect={handleWorkspaceSelect}
          />
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
              {userInitials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[11px] font-bold text-zinc-200">{userName}</span>
              <span className="text-[9px] text-zinc-500 font-mono">{userRole}</span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
