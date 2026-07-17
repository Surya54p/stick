"use client";

import { useState } from "react";
import { 
  Ticket, 
  CircleDot, 
  Clock, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  User,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Inbox
} from "lucide-react";

interface TicketItem {
  id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved";
  priority: "Low" | "Medium" | "High" | "Urgent";
  creator: string;
  assignee: string;
  date: string;
}

const INITIAL_DASHBOARD_TICKETS: TicketItem[] = [
  {
    id: "STK-104",
    title: "Gagal integrasi payment gateway pada checkout",
    description: "Beberapa user melaporkan error 500 saat mencoba melakukan pembayaran menggunakan metode bank transfer lokal. Sandbox mode berjalan lancar, namun error terjadi di production.",
    status: "Open",
    priority: "Urgent",
    creator: "Budi Santoso",
    assignee: "Alex (Lead Engineer)",
    date: "10 menit yang lalu"
  },
  {
    id: "STK-103",
    title: "Gambar profil pengguna tidak termuat dari CDN",
    description: "Gambar profil di dasbor utama kadang patah-patah atau gagal ter-load sepenuhnya. Kemungkinan ada kesalahan konfigurasi CORS pada AWS S3 bucket kita.",
    status: "In Progress",
    priority: "High",
    creator: "Siti Rahma",
    assignee: "Sarah (DevOps)",
    date: "1 jam yang lalu"
  },
  {
    id: "STK-102",
    title: "Tombol cetak invoice bergeser ke bawah pada resolusi mobile",
    description: "Saat dibuka menggunakan Google Chrome di Android/iOS, layout tombol download invoice berantakan dan menutupi teks total harga.",
    status: "In Progress",
    priority: "Medium",
    creator: "Andi Wijaya",
    assignee: "Rian (Frontend)",
    date: "4 jam yang lalu"
  },
  {
    id: "STK-101",
    title: "Perbarui tautan FAQ di halaman kebijakan privasi",
    description: "Link lama yang merujuk ke dokumentasi internal versi v1 masih terpasang. Perlu diperbarui ke tautan versi v2 yang baru dirilis.",
    status: "Resolved",
    priority: "Low",
    creator: "Lina Marlina",
    assignee: "Rian (Frontend)",
    date: "1 hari yang lalu"
  }
];

export default function DashboardPage() {
  const [tickets, setTickets] = useState<TicketItem[]>(INITIAL_DASHBOARD_TICKETS);
  
  // Form states for creating a new ticket
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketItem["priority"]>("Medium");
  const [assignee, setAssignee] = useState("Rian (Frontend)");
  
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newTicket: TicketItem = {
      id: `STK-${Math.floor(105 + Math.random() * 800)}`,
      title,
      description,
      status: "Open",
      priority,
      creator: "Rian Adiputra",
      assignee,
      date: "Baru saja"
    };

    setTickets([newTicket, ...tickets]);
    
    // Clear inputs
    setTitle("");
    setDescription("");
    setPriority("Medium");
  };

  // Stat calculations
  const totalCount = tickets.length + 12; // simulated history
  const openCount = tickets.filter(t => t.status === "Open").length;
  const progressCount = tickets.filter(t => t.status === "In Progress").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved").length + 12;

  const getPriorityStyle = (prio: TicketItem["priority"]) => {
    switch (prio) {
      case "Urgent": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "High": return "text-accent-orange bg-accent-orange/10 border-accent-orange/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-zinc-400 bg-zinc-400/10 border-zinc-500/20";
    }
  };

  const getStatusIcon = (status: TicketItem["status"]) => {
    switch (status) {
      case "Open": return <CircleDot className="h-4 w-4 text-emerald-500" />;
      case "In Progress": return <Clock className="h-4 w-4 text-amber-500" />;
      case "Resolved": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      
      {/* Title Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">
          Ringkasan Dasbor
        </h1>
        <p className="text-xs text-secondary-text">
          Pantau status tiket masuk dan buat tiket support baru untuk tim Anda.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Tickets */}
        <div className="p-4 bg-secondary-panel rounded-lg border border-secondary-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Tiket</span>
            <span className="text-2xl font-extrabold text-zinc-100 font-mono">{totalCount}</span>
          </div>
          <div className="p-2.5 rounded bg-primary-base border border-secondary-border text-zinc-400">
            <Inbox className="h-4 w-4" />
          </div>
        </div>

        {/* Open */}
        <div className="p-4 bg-secondary-panel rounded-lg border border-secondary-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status Terbuka</span>
            <span className="text-2xl font-extrabold text-emerald-500 font-mono">{openCount}</span>
          </div>
          <div className="p-2.5 rounded bg-primary-base border border-secondary-border text-emerald-500/20">
            <CircleDot className="h-4 w-4 text-emerald-500" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 bg-secondary-panel rounded-lg border border-secondary-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sedang Diproses</span>
            <span className="text-2xl font-extrabold text-amber-500 font-mono">{progressCount}</span>
          </div>
          <div className="p-2.5 rounded bg-primary-base border border-secondary-border text-amber-500/20">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 bg-secondary-panel rounded-lg border border-secondary-border flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tiket Selesai</span>
            <span className="text-2xl font-extrabold text-blue-500 font-mono">{resolvedCount}</span>
          </div>
          <div className="p-2.5 rounded bg-primary-base border border-secondary-border text-blue-500/20">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Tickets List */}
        <div className="xl:col-span-2 bg-secondary-panel rounded-lg border border-secondary-border overflow-hidden">
          <div className="px-5 py-4 border-b border-secondary-border flex items-center justify-between bg-secondary-panel/50">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Antrean Tiket Aktif
            </h3>
            <span className="text-[10px] bg-primary-base border border-secondary-border px-2 py-0.5 rounded text-zinc-400 font-mono font-bold">
              {tickets.length} Tiket
            </span>
          </div>

          <div className="divide-y divide-secondary-border/50">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-primary-base/20 transition-all duration-150"
              >
                {/* Info & Title */}
                <div className="flex flex-col gap-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-accent-orange">{ticket.id}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-secondary-text">Dibuat oleh {ticket.creator} • {ticket.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-100 leading-snug">
                    {ticket.title}
                  </h4>
                  <p className="text-[11px] text-secondary-text line-clamp-2 mt-0.5 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Status & Assingee */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                    {getStatusIcon(ticket.status)}
                    <span>{ticket.status}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${getPriorityStyle(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                    <User className="h-3 w-3 text-zinc-600" />
                    {ticket.assignee}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Create Ticket Form */}
        <div className="bg-secondary-panel rounded-lg border border-secondary-border p-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-secondary-border pb-3">
            Buat Tiket Baru
          </h3>

          <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
            
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticketTitle" className="text-[11px] font-semibold text-zinc-400">
                Judul Masalah
              </label>
              <input
                id="ticketTitle"
                type="text"
                required
                placeholder="Misal: Error 404 pada menu profil"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent-orange w-full transition-colors"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticketDesc" className="text-[11px] font-semibold text-zinc-400">
                Deskripsi Detail
              </label>
              <textarea
                id="ticketDesc"
                required
                rows={4}
                placeholder="Jelaskan langkah reproduksi masalah secara detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent-orange w-full transition-colors resize-none"
              />
            </div>

            {/* Priority & Assignee Select */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ticketPriority" className="text-[11px] font-semibold text-zinc-400">
                  Prioritas
                </label>
                <select
                  id="ticketPriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketItem["priority"])}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-200 focus:outline-none focus:border-accent-orange w-full cursor-pointer transition-colors"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="ticketAssignee" className="text-[11px] font-semibold text-zinc-400">
                  Petugas
                </label>
                <select
                  id="ticketAssignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-200 focus:outline-none focus:border-accent-orange w-full cursor-pointer transition-colors"
                >
                  <option value="Rian (Frontend)">Rian (Frontend)</option>
                  <option value="Sarah (DevOps)">Sarah (DevOps)</option>
                  <option value="Alex (Lead Engineer)">Alex (Lead Eng)</option>
                  <option value="Belum Ditugaskan">Belum Ditugaskan</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded transition-all duration-200 shadow-md shadow-accent-orange/10 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Kirim Tiket
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
