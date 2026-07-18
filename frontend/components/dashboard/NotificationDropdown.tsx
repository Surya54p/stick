"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Inbox, MessageSquare, UserPlus, AlertCircle } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "comment" | "assignee" | "status";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Komentar Baru",
    description: "Budi Santoso mengomentari tiket STK-104: 'Kami sedang menguji log...'",
    time: "5 menit yang lalu",
    unread: true,
    type: "comment",
  },
  {
    id: "2",
    title: "Penugasan Tiket",
    description: "Anda telah ditugaskan menangani tiket STK-103 oleh Alex (Lead Engineer)",
    time: "1 jam yang lalu",
    unread: true,
    type: "assignee",
  },
  {
    id: "3",
    title: "Status Diperbarui",
    description: "Rian (Frontend) mengubah status tiket STK-102 menjadi 'In Progress'",
    time: "4 jam yang lalu",
    unread: false,
    type: "status",
  },
];

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="h-3.5 w-3.5 text-accent-orange" />;
      case "assignee":
        return <UserPlus className="h-3.5 w-3.5 text-purple-400" />;
      case "status":
        return <AlertCircle className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded text-secondary-text hover:text-zinc-100 hover:bg-primary-base/50 transition-colors relative cursor-pointer"
        aria-label="Notifikasi"
      >
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-orange"></span>
          </span>
        )}
        <Bell className="h-4.5 w-4.5" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-secondary-panel border border-secondary-border rounded-lg shadow-2xl z-50 overflow-hidden font-sans text-left text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-secondary-border/60 flex items-center justify-between bg-secondary-panel/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-200">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-accent-orange/10 border border-accent-orange/20 text-accent-orange font-bold text-[10px] font-mono">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] text-accent-orange hover:text-accent-orange-hover font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Check className="h-3 w-3" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-secondary-border/30">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex gap-3 hover:bg-primary-base/20 transition-colors relative group ${
                    n.unread ? "bg-accent-orange/2" : ""
                  }`}
                >
                  {/* Left: Indicator & Icon */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-7 h-7 rounded bg-zinc-900 border border-secondary-border flex items-center justify-center">
                      {getIcon(n.type)}
                    </div>
                  </div>

                  {/* Center: Info text */}
                  <div className="flex-grow flex flex-col gap-1 pr-6">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${n.unread ? "text-zinc-100" : "text-zinc-400"}`}>
                        {n.title}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-secondary-text text-[11px] leading-relaxed">
                      {n.description}
                    </p>
                  </div>

                  {/* Right: Quick actions (hover triggered) */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-secondary-panel border border-secondary-border rounded p-0.5 shadow-md">
                    <button
                      onClick={() => handleToggleRead(n.id)}
                      className="p-1 rounded text-zinc-400 hover:text-accent-orange hover:bg-zinc-800 transition-all cursor-pointer"
                      title={n.unread ? "Tandai sudah dibaca" : "Tandai belum dibaca"}
                    >
                      <Check className={`h-3.5 w-3.5 ${!n.unread ? "text-accent-orange" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-800 transition-all cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Unread circle badge */}
                  {n.unread && (
                    <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-accent-orange" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500">
                <Inbox className="h-8 w-8 text-zinc-700 stroke-[1.5]" />
                <span className="text-[11px]">Kotak masuk kosong</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
