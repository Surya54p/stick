"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import ReusableTableComponent from "@/components/dashboard/ReusableTableComponent";

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
  Inbox,
  SlidersHorizontal
} from "lucide-react";

import { 
  PieChart, 
  Pie, 
  Legend,
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";


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

  // States for customizing statistic cards
  const [workspaceStatuses, setWorkspaceStatuses] = useState<string[]>([]);
  const [visibleStats, setVisibleStats] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempVisibleStats, setTempVisibleStats] = useState<string[]>([]);

  const fetchTicketsAndWorkspace = async (slug: string) => {
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
        creator: t.creator_name || t.creator_email || "Anonim",
        assignee: t.assignee_name || "Belum Ditugaskan",
        date: new Date(t.created_at).toLocaleDateString("id-ID"),
        number: t.number
      }));
      setTickets(mapped);

      const wsData = await apiRequest(`/workspaces/${slug}`);
      const wsCols = wsData.status_order || ["Open", "In Progress", "Closed"];
      setWorkspaceStatuses(wsCols);

      const saved = localStorage.getItem(`dashboard_stats_visible_${slug}`);
      if (saved) {
        setVisibleStats(JSON.parse(saved));
      } else {
        setVisibleStats(wsCols);
      }
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
      fetchTicketsAndWorkspace(parsedWs.slug);
    } else {
      router.push("/auth/login");
    }
  }, []);

  const handleOpenSettings = () => {
    setTempVisibleStats([...visibleStats]);
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    if (!currentWorkspace) return;
    setVisibleStats(tempVisibleStats);
    localStorage.setItem(`dashboard_stats_visible_${currentWorkspace.slug}`, JSON.stringify(tempVisibleStats));
    setIsSettingsOpen(false);
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

  // Status Chart Data - keep only counts > 0 for visual beauty in PieChart
  const statusChartData = displayStatuses.map(statusName => ({
    name: statusName,
    count: statusCounts[statusName] || 0
  })).filter(item => item.count > 0);

  // Calculate priority counts dynamically
  const priorityCounts: Record<string, number> = {};
  tickets.forEach(t => {
    priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
  });

  const displayPriorities = ["Low", "Medium", "High", "Urgent"];
  // Priority Chart Data - keep only counts > 0 for visual beauty in PieChart
  const priorityChartData = displayPriorities.map(prioName => ({
    name: prioName,
    count: priorityCounts[prioName] || 0
  })).filter(item => item.count > 0);

  const getPriorityChartColor = (prio: string) => {
    switch (prio) {
      case "Urgent": return "#EF4444"; // red-500
      case "High": return "#F97316"; // orange-500
      case "Medium": return "#EAB308"; // yellow-500
      default: return "#A1A1AA"; // zinc-400
    }
  };

  const getStatusChartColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "todo":
        return "#10B981"; // emerald-500
      case "in progress":
      case "progress":
      case "doing":
        return "#F59E0B"; // amber-500
      case "resolved":
      case "done":
      case "closed":
        return "#3B82F6"; // blue-500
      default:
        return "#8B5CF6"; // purple-500
    }
  };

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-secondary-border p-3 rounded shadow-xl text-left">
          <p className="text-xs font-bold text-zinc-100 uppercase tracking-wider">{payload[0].payload.name}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: payload[0].color || "#FF5722" }} 
            />
            <span className="text-xs text-zinc-300 font-mono font-bold">{payload[0].value} Tiket</span>
          </div>
        </div>
      );
    }
    return null;
  };

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
      
      {/* Title Header with Customization Button */}
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            Ringkasan Dasbor
          </h1>
          <p className="text-xs text-secondary-text">
            Pantau status tiket masuk untuk tim Anda.
          </p>
        </div>
        <button
          onClick={handleOpenSettings}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold text-zinc-300 bg-secondary-panel border border-secondary-border hover:border-zinc-700 hover:text-zinc-100 rounded uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Atur Kartu
        </button>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            
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

            {/* Dynamic Status Cards Selected by User */}
            {visibleStats.map(statusName => {
              const count = statusCounts[statusName] || 0;
              return (
                <div key={statusName} className="p-4 bg-secondary-panel rounded-lg border border-secondary-border flex items-center justify-between animate-in fade-in duration-200">
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


          {/* Top Content: Tickets List (Full Width) */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Tiket Terbaru
              </h3>
            </div>

            {/* Tickets Table Card */}
            <div className="bg-secondary-panel rounded-lg border border-secondary-border shadow-2xl overflow-hidden w-full">
              <ReusableTableComponent tickets={tickets} extraColumn="date" />  
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

          {/* Bottom Content: 2-Column Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
            
            {/* Status Distribution Donut Chart */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Distribusi Status
                </h3>
              </div>

              <div className="bg-secondary-panel rounded-lg border border-secondary-border shadow-2xl p-5 flex flex-col gap-2 w-full h-[320px]">
                <div className="w-full h-full flex items-center justify-center">
                  {tickets.length === 0 ? (
                    <span className="text-xs text-zinc-500 font-mono">Belum ada data tiket</span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getStatusChartColor(entry.name)} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => <span className="text-[10px] text-zinc-400 font-medium">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Priority Distribution Donut Chart */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Distribusi Prioritas
                </h3>
              </div>

              <div className="bg-secondary-panel rounded-lg border border-secondary-border shadow-2xl p-5 flex flex-col gap-2 w-full h-[320px]">
                <div className="w-full h-full flex items-center justify-center">
                  {tickets.length === 0 ? (
                    <span className="text-xs text-zinc-500 font-mono">Belum ada data tiket</span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityChartData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {priorityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getPriorityChartColor(entry.name)} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => <span className="text-[10px] text-zinc-400 font-medium">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Settings Modal for customizing statistic cards */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-secondary-panel border border-secondary-border rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95 duration-200 text-left">
            
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-accent-orange" />
                Kustomisasi Statistik
              </h3>
              <p className="text-[11px] text-secondary-text leading-relaxed">
                Pilih kartu status yang ingin Anda pantau di ringkasan dasbor.
              </p>
            </div>

            <div className="border-t border-secondary-border/50 my-1" />

            {/* Checkboxes List */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {workspaceStatuses.map((statusName) => {
                const isChecked = tempVisibleStats.includes(statusName);
                return (
                  <label 
                    key={statusName}
                    className="flex items-center justify-between p-2.5 rounded bg-primary-base/40 border border-secondary-border/30 hover:border-zinc-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded bg-primary-base border border-secondary-border/50`}>
                        {getStatusIcon(statusName)}
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">{statusName}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setTempVisibleStats(tempVisibleStats.filter(s => s !== statusName));
                        } else {
                          setTempVisibleStats([...tempVisibleStats, statusName]);
                        }
                      }}
                      className="accent-accent-orange h-3.5 w-3.5 rounded border-secondary-border text-accent-orange focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="border-t border-secondary-border/50 my-1" />

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-3.5 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded transition-all active:scale-[0.98] cursor-pointer"
              >
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
