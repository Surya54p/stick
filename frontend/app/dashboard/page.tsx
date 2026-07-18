"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

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
  status: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  creator: string;
  assignee: string;
  date: string;
  number: number;
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
    date: "10 menit yang lalu",
    number: 4
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
    number: 3
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
    number: 2
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
    number: 1
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states for creating a new ticket
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketItem["priority"]>("Medium");
  const [assignee, setAssignee] = useState("Belum Ditugaskan");

  const fetchTickets = async (slug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/workspaces/${slug}/tickets`);
      const mapped = data.map((t: any) => ({
        id: `STK-${t.id.substring(0, 4).toUpperCase()}`,
        title: t.title,
        description: t.description || "",
        status: t.status,
        priority: t.priority,
        creator: "Anggota Workspace",
        assignee: "Belum Ditugaskan",
        date: new Date(t.created_at).toLocaleDateString("id-ID"),
        number: t.number
      }));
      setTickets(mapped);
    } catch (err: any) {
      setError(err.message || "Akses ditolak ke workspace ini.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaultWorkspace = () => {
    const workspacesStr = localStorage.getItem("workspaces");
    if (workspacesStr) {
      const workspaces = JSON.parse(workspacesStr);
      if (workspaces.length > 0) {
        localStorage.setItem("current_workspace", JSON.stringify(workspaces[0]));
        window.location.reload();
      } else {
        router.push("/auth/login");
      }
    } else {
      router.push("/auth/login");
    }
  };

  useEffect(() => {
    const ws = localStorage.getItem("current_workspace");
    if (ws) {
      const parsedWs = JSON.parse(ws);
      setCurrentWorkspace(parsedWs);
      fetchTickets(parsedWs.slug);
    } else {
      router.push("/auth/login");
    }
  }, []);
  
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !currentWorkspace) return;

    setIsLoading(true);
    try {
      await apiRequest(`/workspaces/${currentWorkspace.slug}/tickets`, "POST", {
        title,
        description,
        priority,
        status: "Open"
      });
      
      // Clear inputs
      setTitle("");
      setDescription("");
      setPriority("Medium");
      
      // Refresh list
      await fetchTickets(currentWorkspace.slug);
    } catch (err: any) {
      alert("Gagal membuat tiket: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Stat calculations
  const totalCount = tickets.length;
  
  // Calculate status counts dynamically
  const statusCounts: Record<string, number> = {};
  tickets.forEach(t => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });
  
  // We'll show these 3 default statuses plus any other custom statuses present
  const defaultStatuses = ["Open", "In Progress", "Closed"];
  const displayStatuses = Array.from(new Set([...defaultStatuses, ...Object.keys(statusCounts)]));

  const getPriorityStyle = (prio: TicketItem["priority"]) => {
    switch (prio) {
      case "Urgent": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "High": return "text-accent-orange bg-accent-orange/10 border-accent-orange/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-zinc-400 bg-zinc-400/10 border-zinc-500/20";
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "todo":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "in progress":
      case "progress":
      case "doing":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "resolved":
      case "done":
      case "closed":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "todo":
        return <CircleDot className="h-4 w-4 text-emerald-500" />;
      case "in progress":
      case "progress":
      case "doing":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "resolved":
      case "done":
      case "closed":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      default:
        return <CircleDot className="h-4 w-4 text-purple-500" />;
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

      {error ? (
        <div className="bg-secondary-panel rounded-lg border border-red-500/20 p-8 shadow-2xl flex flex-col items-center gap-5 text-center my-6 max-w-xl mx-auto w-full animate-in fade-in duration-200">
          <div className="p-3 bg-red-500/10 rounded-full text-red-500 border border-red-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Akses Workspace Ditolak</h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              Anda tidak memiliki akses ke workspace **"{currentWorkspace?.name || currentWorkspace?.slug}"** atau saluran ini belum dibuat secara resmi di database.
            </p>
          </div>
          <button
            onClick={handleResetToDefaultWorkspace}
            className="px-4 py-2.5 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded shadow-lg transition-all"
          >
            Kembali ke Workspace Default Anda
          </button>
        </div>
      ) : (
        <>
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

            {/* Dynamic Status Cards */}
            {displayStatuses.map(statusName => {
              const count = statusCounts[statusName] || 0;
              return (
                <div key={statusName} className="p-4 bg-secondary-panel rounded-lg border border-secondary-border flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{statusName}</span>
                    <span className={`text-2xl font-extrabold font-mono ${getStatusColorClass(statusName).split(" ")[0]}`}>{count}</span>
                  </div>
                  <div className={`p-2.5 rounded bg-primary-base border border-secondary-border`}>
                    {getStatusIcon(statusName)}
                  </div>
                </div>
              );
            })}

          </div>


          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Left Column: Tickets List */}
            <div className="xl:col-span-2 flex flex-col gap-4">
              
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Tiket Terbaru
                </h3>
              </div>

              {/* Tickets Table Card */}
              <div className="bg-secondary-panel rounded-lg border border-secondary-border shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-secondary-border/50 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Judul</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Prioritas</th>
                        <th className="py-3 px-4">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-border/50 text-xs">
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-secondary-text font-mono">
                            Belum ada tiket di workspace ini.
                          </td>
                        </tr>
                      ) : (
                        tickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-primary-base/10 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">
                              {ticket.id}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-zinc-200">
                              <div className="flex flex-col gap-0.5">
                                <span>{ticket.title}</span>
                                <span className="text-[10px] text-zinc-500 font-normal">No. {ticket.number}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${getStatusColorClass(ticket.status)}`}>
                                {getStatusIcon(ticket.status)}
                                {ticket.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getPriorityStyle(ticket.priority)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-zinc-500 font-mono text-[10px]">
                              {ticket.date}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {tickets.length > 0 && (
                  <div className="p-3 border-t border-secondary-border/50 bg-primary-base/20 flex justify-end">
                    <Link 
                      href="/dashboard/tickets" 
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-accent-orange hover:text-accent-orange-hover uppercase tracking-wider"
                    >
                      Buka Papan Kanban
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>

            </div>


            {/* Right Column: Quick Create Form */}
            <div className="bg-secondary-panel rounded-lg border border-secondary-border p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-secondary-border/50 pb-3">
                  Buat Tiket Baru
                </h3>
              </div>

              <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ticketTitle" className="text-[11px] font-semibold text-zinc-400">
                    Judul Masalah
                  </label>
                  <input
                    id="ticketTitle"
                    type="text"
                    required
                    placeholder="Misal: Gagal memuat database aduan"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent-orange w-full transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ticketDesc" className="text-[11px] font-semibold text-zinc-400">
                    Deskripsi Detail
                  </label>
                  <textarea
                    id="ticketDesc"
                    required
                    rows={4}
                    placeholder="Jelaskan detail error atau kendala yang dihadapi..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent-orange w-full resize-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  disabled={isLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all duration-200 shadow-md shadow-accent-orange/10 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                      Kirim Tiket
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
