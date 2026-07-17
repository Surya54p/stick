"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Ticket, 
  Layers, 
  Users, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  KanbanSquare
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      name: "Daftar Tiket",
      href: "/dashboard/tickets",
      icon: <KanbanSquare className="h-4 w-4" />
    },
    {
      name: "Anggota Tim",
      href: "/dashboard/members",
      icon: <Users className="h-4 w-4" />
    },
    {
      name: "Pengaturan",
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-64px)] w-64 border-r border-secondary-border bg-secondary-panel transition-transform duration-200 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col justify-between h-full p-4">
          
          {/* Menu Items */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all duration-150 ${isActive ? "bg-primary-base border-l-2 border-accent-orange text-accent-orange" : "text-secondary-text hover:text-zinc-100 hover:bg-primary-base/50"}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Actions: Logout */}
          <div className="border-t border-secondary-border/50 pt-4">
            <Link
              href="/auth/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar Akun</span>
            </Link>
          </div>

        </div>
      </aside>
    </>
  );
}
