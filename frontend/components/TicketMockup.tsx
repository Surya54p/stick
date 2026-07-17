"use client";

import { useState } from "react";
import { 
  Ticket, 
  CircleDot, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Plus, 
  MessageSquare,
  Search,
  ChevronRight
} from "lucide-react";

interface MockTicket {
  id: string;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved";
  priority: "Low" | "Medium" | "High" | "Urgent";
  creator: string;
  assignee: string;
  date: string;
  commentsCount: number;
}

const INITIAL_TICKETS: MockTicket[] = [
  {
    id: "STK-104",
    title: "Gagal integrasi payment gateway pada checkout",
    description: "Beberapa user melaporkan error 500 saat mencoba melakukan pembayaran menggunakan metode bank transfer lokal. Sandbox mode berjalan lancar, namun error terjadi di production.",
    status: "Open",
    priority: "Urgent",
    creator: "Budi Santoso",
    assignee: "Alex (Lead Engineer)",
    date: "10 menit yang lalu",
    commentsCount: 3
  },
  {
    id: "STK-103",
    title: "Gambar profil pengguna tidak termuat dari CDN",
    description: "Gambar profil di dasbor utama kadang patah-patah atau gagal ter-load sepenuhnya. Kemungkinan ada kesalahan konfigurasi CORS pada AWS S3 bucket kita.",
    status: "In Progress",
    priority: "High",
    creator: "Siti Rahma",
    assignee: "Sarah (DevOps)",
    date: "1 jam yang lalu",
    commentsCount: 5
  },
  {
    id: "STK-102",
    title: "Tombol cetak invoice bergeser ke bawah pada resolusi mobile",
    description: "Saat dibuka menggunakan Google Chrome di Android/iOS, layout tombol download invoice berantakan dan menutupi teks total harga.",
    status: "In Progress",
    priority: "Medium",
    creator: "Andi Wijaya",
    assignee: "Rian (Frontend)",
    date: "4 jam yang lalu",
    commentsCount: 2
  },
  {
    id: "STK-101",
    title: "Perbarui tautan FAQ di halaman kebijakan privasi",
    description: "Link lama yang merujuk ke dokumentasi internal versi v1 masih terpasang. Perlu diperbarui ke tautan versi v2 yang baru dirilis.",
    status: "Resolved",
    priority: "Low",
    creator: "Lina Marlina",
    assignee: "Rian (Frontend)",
    date: "1 hari yang lalu",
    commentsCount: 1
  }
];

export default function TicketMockup() {
  const [tickets, setTickets] = useState<MockTicket[]>(INITIAL_TICKETS);
  const [selectedId, setSelectedId] = useState<string>("STK-104");
  const [newTitle, setNewTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const selectedTicket = tickets.find(t => t.id === selectedId) || tickets[0];

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTicket: MockTicket = {
      id: `STK-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      description: "Ini adalah tiket dummy baru yang berhasil Anda buat melalui simulasi interaktif halaman utama.",
      status: "Open",
      priority: "Medium",
      creator: "Anda (Demo)",
      assignee: "Belum Ditugaskan",
      date: "Baru saja",
      commentsCount: 0
    };

    setTickets([newTicket, ...tickets]);
    setSelectedId(newTicket.id);
    setNewTitle("");
    setShowAddForm(false);
  };

  const getPriorityColor = (priority: MockTicket["priority"]) => {
    switch (priority) {
      case "Urgent": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "High": return "text-accent-orange bg-accent-orange/10 border-accent-orange/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-zinc-400 bg-zinc-400/10 border-zinc-500/20";
    }
  };

  const getStatusIcon = (status: MockTicket["status"]) => {
    switch (status) {
      case "Open": return <CircleDot className="h-4 w-4 text-emerald-500" />;
      case "In Progress": return <Clock className="h-4 w-4 text-amber-500" />;
      case "Resolved": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="w-full bg-secondary-panel rounded-lg border border-secondary-border shadow-2xl overflow-hidden font-sans text-left">
      {/* Mock Header Bar */}
      <div className="bg-primary-base border-b border-secondary-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/30"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/30"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/30"></span>
          </div>
          <span className="text-xs text-secondary-text font-mono">dashboard.stick.co / support-it</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] bg-secondary-panel border border-secondary-border text-accent-orange font-semibold font-mono">Demo Live</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 h-[500px]">
        {/* Left Sidebar: Tickets List */}
        <div className="md:col-span-2 border-r border-secondary-border flex flex-col h-full bg-secondary-panel/50 overflow-hidden">
          <div className="p-3 border-b border-secondary-border flex items-center justify-between bg-secondary-panel">
            <div className="flex items-center gap-2 flex-grow max-w-[200px]">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Cari tiket..." 
                disabled
                className="bg-transparent text-xs w-full focus:outline-none text-zinc-300 placeholder-zinc-600"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="p-1 rounded bg-accent-orange text-primary-base hover:bg-accent-orange-hover transition-colors active:scale-95"
              title="Buat tiket baru"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
            </button>
          </div>

          {/* New Ticket Form (Conditional Modal inside Sidebar) */}
          {showAddForm && (
            <form onSubmit={handleAddTicket} className="p-3 border-b border-secondary-border bg-primary-base flex flex-col gap-2">
              <input
                type="text"
                placeholder="Judul tiket baru..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="bg-secondary-panel border border-secondary-border text-xs rounded p-2 text-zinc-200 focus:outline-none focus:border-accent-orange w-full"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2.5 py-1 text-[10px] border border-secondary-border text-secondary-text rounded hover:bg-secondary-panel"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 text-[10px] bg-accent-orange text-primary-base font-semibold rounded hover:bg-accent-orange-hover"
                >
                  Tambah
                </button>
              </div>
            </form>
          )}

          {/* Ticket Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-secondary-border/50">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedId(ticket.id)}
                className={`w-full text-left p-3.5 flex flex-col gap-1.5 transition-all duration-150 relative ${selectedId === ticket.id ? "bg-primary-base/70 border-l-2 border-accent-orange" : "hover:bg-primary-base/30"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">{ticket.id}</span>
                  <span className="text-[10px] text-zinc-500">{ticket.date}</span>
                </div>
                <h4 className="text-xs font-semibold text-zinc-100 line-clamp-1 group-hover:text-accent-orange">
                  {ticket.title}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(ticket.status)}
                    <span className="text-[10px] text-secondary-text">{ticket.status}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Pane: Ticket Details */}
        <div className="md:col-span-3 flex flex-col h-full bg-primary-base overflow-hidden">
          {selectedTicket ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Detail Header */}
              <div className="p-4 border-b border-secondary-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-secondary-panel/20">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-accent-orange">{selectedTicket.id}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-secondary-text">Dibuat oleh {selectedTicket.creator}</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 mt-1">{selectedTicket.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>

              {/* Detail Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-5">
                <div className="bg-secondary-panel/40 border border-secondary-border rounded p-3 text-xs text-zinc-300 leading-relaxed">
                  {selectedTicket.description}
                </div>

                {/* Assigned Agent Box */}
                <div className="flex items-center justify-between p-3 border border-secondary-border bg-secondary-panel/20 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-orange/10 flex items-center justify-center border border-accent-orange/20 text-accent-orange">
                      <User className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-medium">PETUGAS</span>
                      <span className="text-xs font-semibold text-zinc-200">{selectedTicket.assignee}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-secondary-text">
                    {getStatusIcon(selectedTicket.status)}
                    <span>{selectedTicket.status}</span>
                  </div>
                </div>

                {/* Comments Section Title */}
                <div className="border-b border-secondary-border/60 pb-2">
                  <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-accent-orange" />
                    Percakapan ({selectedTicket.commentsCount})
                  </h4>
                </div>

                {/* Dummy Comment Thread */}
                <div className="space-y-3">
                  {selectedTicket.commentsCount > 0 ? (
                    <>
                      <div className="flex gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold">R</div>
                        <div className="flex-1 bg-secondary-panel/30 p-2.5 rounded border border-secondary-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-zinc-300">{selectedTicket.assignee}</span>
                            <span className="text-[9px] text-zinc-500">30 menit yang lalu</span>
                          </div>
                          <p className="text-zinc-400 text-xs">Kami sedang menganalisis log sistem. Saya akan memperbarui statusnya segera setelah patch diterapkan.</p>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-accent-orange/20 border border-accent-orange/30 text-accent-orange flex items-center justify-center text-[10px] font-bold">U</div>
                        <div className="flex-1 bg-secondary-panel/50 p-2.5 rounded border border-secondary-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-zinc-300">{selectedTicket.creator}</span>
                            <span className="text-[9px] text-zinc-500">10 menit yang lalu</span>
                          </div>
                          <p className="text-zinc-400 text-xs">Baik, terima kasih atas respons cepatnya! Ditunggu perbaikannya.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-xs text-zinc-600">
                      Belum ada tanggapan. Jadilah yang pertama memberikan respons.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Comment Input (Disabled for Demo) */}
              <div className="p-3 border-t border-secondary-border bg-secondary-panel">
                <div className="flex items-center gap-2 bg-primary-base border border-secondary-border rounded px-3 py-1.5">
                  <input
                    type="text"
                    disabled
                    placeholder="Tulis balasan di sini (Demo Mode)..."
                    className="bg-transparent text-xs w-full focus:outline-none text-zinc-300 placeholder-zinc-600"
                  />
                  <button disabled className="text-xs font-semibold text-accent-orange opacity-50 cursor-not-allowed">
                    Kirim
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Ticket className="h-10 w-10 text-zinc-700 stroke-[1.5] mb-2" />
              <p className="text-xs">Pilih tiket untuk melihat detailnya</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
