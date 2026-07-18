"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import ReusableTableComponent from "@/components/dashboard/ReusableTableComponent";
import { 
  Play, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  X, 
  MoreHorizontal, 
  CheckCircle2, 
  Circle,
  HelpCircle,
  TrendingUp,
  Workflow,
  Eye,
  Trash2,
  Calendar,
  User,
  List,
  KanbanSquare,
  BarChart4,
  AlertTriangle,
  Layers,
  ChevronDown,
  Lock
} from "lucide-react";

interface Ticket {
  id: string;
  rawId: string;
  title: string;
  description: string;
  creator: string;
  assignee: string;
  assigneeId: string | null;
  status: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  number: number;
  aduanServiceId: string | null;
  createdAt: string;
  date: string;
}

export default function TicketsKanbanPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Workspace and views states
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("View 1"); // View 1: List, View 2: Board, View 3: Roadmap
  const [orderedStatuses, setOrderedStatuses] = useState<string[]>([]);
  const [customStatuses, setCustomStatuses] = useState<string[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [dragOverTicketId, setDragOverTicketId] = useState<string | null>(null);
  const [draggedColStatus, setDraggedColStatus] = useState<string | null>(null);
  const [dragOverColStatus, setDragOverColStatus] = useState<string | null>(null);
  const [aduanServices, setAduanServices] = useState<any[]>([]);
  const [selectedAduanId, setSelectedAduanId] = useState<string>("all");
  const [isAduanDropdownOpen, setIsAduanDropdownOpen] = useState(false);
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [dragOverColForCard, setDragOverColForCard] = useState<string | null>(null);
  const [newStatusName, setNewStatusName] = useState("");
  
  // Interactive column ticket creators
  const [showAddInColumn, setShowAddInColumn] = useState<string | null>(null);
  const [columnNewTitle, setColumnNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Custom container editing states
  const [activeColMenu, setActiveColMenu] = useState<string | null>(null);
  const [editingColStatus, setEditingColStatus] = useState<string | null>(null);
  const [editingColName, setEditingColName] = useState("");
  const [editingColDesc, setEditingColDesc] = useState("");
  const [editingColColor, setEditingColColor] = useState("#8B5CF6");
  const [columnsMeta, setColumnsMeta] = useState<Record<string, { label: string; desc: string; color: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const columnsContainerRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async (slug: string) => {
    setError(null);
    try {
      const data = await apiRequest(`/workspaces/${slug}/tickets`);
      const mapped = data.map((t: any) => ({
        id: `STK-${t.id.substring(0, 4).toUpperCase()}`,
        rawId: t.id,
        title: t.title,
        description: t.description || "",
        creator: t.creator_name || t.creator_email || "Anonim",
        assignee: t.assignee_name || "Belum Ditugaskan",
        assigneeId: t.assignee_id || null,
        status: t.status,
        priority: t.priority,
        number: t.number,
        aduanServiceId: t.aduan_service_id || null,
        createdAt: t.created_at,
        date: new Date(t.created_at).toLocaleDateString("id-ID")
      }));
      setTickets(mapped);
    } catch (err: any) {
      setError(err.message || "Akses ditolak ke workspace ini.");
    }
  };

  const fetchAduanServices = async (slug: string) => {
    try {
      const data = await apiRequest(`/workspaces/${slug}/aduan-services`);
      setAduanServices(data);
    } catch (err: any) {
      console.error("Gagal memuat layanan aduan:", err.message);
    }
  };

  const fetchWorkspaceDetail = async (slug: string) => {
    try {
      const data = await apiRequest(`/workspaces/${slug}`);
      if (data.status_order) {
        setOrderedStatuses(data.status_order);
      }
    } catch (err: any) {
      console.error("Gagal memuat detail workspace:", err.message);
    }
  };

  const fetchWorkspaceMembers = async (slug: string) => {
    try {
      const data = await apiRequest(`/workspaces/${slug}/members`);
      setWorkspaceMembers(data);
    } catch (err: any) {
      console.error("Gagal memuat anggota workspace:", err.message);
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
      fetchAduanServices(parsedWs.slug);
      fetchWorkspaceDetail(parsedWs.slug);
      fetchWorkspaceMembers(parsedWs.slug);
    } else {
      router.push("/auth/login");
    }
  }, []);

  // Load custom status column metadata from localStorage
  useEffect(() => {
    if (currentWorkspace) {
      const metaStr = localStorage.getItem(`workspace_status_meta_${currentWorkspace.slug}`);
      if (metaStr) {
        try {
          setColumnsMeta(JSON.parse(metaStr));
        } catch (e) {
          console.error("Gagal memuat metadata kolom:", e);
        }
      }
    }
  }, [currentWorkspace]);

  // Synchronize orderedStatuses with custom and ticket statuses
  useEffect(() => {
    const defaultCols = ["Open", "In Progress", "Closed"];
    const allStatuses = Array.from(new Set([...defaultCols, ...customStatuses, ...tickets.map(t => t.status)]));
    
    setOrderedStatuses(prev => {
      // Add any new statuses that aren't in prev, but DO NOT delete existing columns
      const newStatuses = allStatuses.filter(s => !prev.includes(s));
      
      if (newStatuses.length > 0 || prev.length === 0) {
        return [...prev, ...newStatuses];
      }
      return prev;
    });
  }, [tickets, customStatuses]);

  // Drag and Drop States
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", id);
    setDraggedTicketId(id);
  };

  const handleDragEnd = () => {
    setDraggedTicketId(null);
    setDragOverTicketId(null);
    setDragOverColForCard(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragOverCard = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedTicketId !== id) {
      setDragOverTicketId(id);
    }
  };

  const handleDragLeaveCard = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTicketId(null);
  };

  const handleDropOnColumn = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedTicketId;
    if (!id || !currentWorkspace) return;

    const ticketToUpdate = tickets.find(t => t.id === id);
    if (!ticketToUpdate) return;

    if (dragOverTicketId) {
      handleDropOnCard(e, dragOverTicketId);
      return;
    }

    if (ticketToUpdate.status !== targetStatus) {
      const nextTickets = tickets.map(t => t.id === id ? { ...t, status: targetStatus } : t);
      setTickets(nextTickets);
      
      const targetStatusTickets = nextTickets.filter(t => t.status === targetStatus);
      const ticketIds = targetStatusTickets.map(t => t.rawId);

      try {
        await apiRequest(`/workspaces/${currentWorkspace.slug}/tickets/reorder`, "PUT", {
          status: targetStatus,
          ticket_ids: ticketIds
        });
      } catch (err: any) {
        alert("Gagal memindahkan tiket: " + err.message);
        fetchTickets(currentWorkspace.slug);
      }
    }

    setDraggedTicketId(null);
    setDragOverTicketId(null);
    setDragOverColForCard(null);
  };

  const handleDropOnCard = async (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain") || draggedTicketId;
    if (!id || id === targetCardId || !currentWorkspace) return;

    const draggedTicket = tickets.find(t => t.id === id);
    const targetTicket = tickets.find(t => t.id === targetCardId);
    if (!draggedTicket || !targetTicket) return;

    const targetStatus = targetTicket.status;

    const nextTickets = [...tickets.filter(t => t.id !== id)];
    const targetIdx = nextTickets.findIndex(t => t.id === targetCardId);
    const updatedDragged = { ...draggedTicket, status: targetStatus };
    nextTickets.splice(targetIdx, 0, updatedDragged);
    
    setTickets(nextTickets);

    const targetStatusTickets = nextTickets.filter(t => t.status === targetStatus);
    const ticketIds = targetStatusTickets.map(t => t.rawId);

    try {
      await apiRequest(`/workspaces/${currentWorkspace.slug}/tickets/reorder`, "PUT", {
        status: targetStatus,
        ticket_ids: ticketIds
      });
    } catch (err: any) {
      alert("Gagal memindahkan tiket: " + err.message);
      fetchTickets(currentWorkspace.slug);
    }

    setDraggedTicketId(null);
    setDragOverTicketId(null);
    setDragOverColForCard(null);
  };

  const handleOpenAddContainer = () => {
    setActiveTab("View 2");
    setIsAddingStatus(true);
    setTimeout(() => {
      if (columnsContainerRef.current) {
        columnsContainerRef.current.scrollTo({
          left: columnsContainerRef.current.scrollWidth,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  // Column Drag and Drop Handlers
  const handleDragStartCol = (e: React.DragEvent, status: string) => {
    e.dataTransfer.setData("text/column", status);
    setDraggedColStatus(status);
  };

  const handleDragEndCol = () => {
    setDraggedColStatus(null);
    setDragOverColStatus(null);
  };

  const handleDragOverCol = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedColStatus && draggedColStatus !== status) {
      setDragOverColStatus(status);
    }
  };

  const handleDragLeaveCol = () => {
    setDragOverColStatus(null);
  };

  const handleDropCol = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const sourceStatus = e.dataTransfer.getData("text/column") || draggedColStatus;

    if (draggedTicketId) {
      handleDropOnColumn(e, targetStatus);
      return;
    }

    if (sourceStatus && sourceStatus !== targetStatus) {
      const nextOrdered = [...orderedStatuses].filter(s => s !== sourceStatus);
      const tgtIdx = orderedStatuses.indexOf(targetStatus);
      nextOrdered.splice(tgtIdx, 0, sourceStatus);
      
      setOrderedStatuses(nextOrdered);

      if (currentWorkspace) {
        apiRequest(`/workspaces/${currentWorkspace.slug}/status-order`, "PUT", {
          status_order: nextOrdered
        }).catch(err => console.error("Gagal menyimpan urutan kolom:", err));
      }
    }

    setDraggedColStatus(null);
    setDragOverColStatus(null);
  };

  // Add Ticket inside a Column
  const handleAddTicketInColumn = async (status: string) => {
    if (!columnNewTitle.trim() || !currentWorkspace) return;
    
    try {
      await apiRequest(`/workspaces/${currentWorkspace.slug}/tickets`, "POST", {
        title: columnNewTitle,
        description: "",
        priority: "Medium",
        status: status
      });
      setColumnNewTitle("");
      setShowAddInColumn(null);
      await fetchTickets(currentWorkspace.slug);
    } catch (err: any) {
      alert("Gagal menambahkan tiket: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket || !currentWorkspace) return;

    if (confirm("Apakah Anda yakin ingin menghapus tiket ini?")) {
      try {
        await apiRequest(`/workspaces/${currentWorkspace.slug}/tickets/${ticket.rawId}`, "DELETE");
        setTickets(prev => prev.filter(t => t.id !== id));
        setSelectedTicket(null);
      } catch (err: any) {
        alert("Gagal menghapus tiket: " + err.message);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket || !currentWorkspace) return;

    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      await apiRequest(`/workspaces/${currentWorkspace.slug}/tickets/${ticket.rawId}`, "PUT", {
        status: newStatus
      });
    } catch (err: any) {
      alert("Gagal mengubah status tiket: " + err.message);
      fetchTickets(currentWorkspace.slug);
    }
  };

  const handlePriorityChange = async (id: string, newPriority: Ticket["priority"]) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket || !currentWorkspace) return;

    setTickets(prev => prev.map(t => t.id === id ? { ...t, priority: newPriority } : t));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, priority: newPriority } : null);
    }

    try {
      await apiRequest(`/workspaces/${currentWorkspace.slug}/tickets/${ticket.rawId}`, "PUT", {
        priority: newPriority
      });
    } catch (err: any) {
      alert("Gagal mengubah prioritas tiket: " + err.message);
      fetchTickets(currentWorkspace.slug);
    }
  };

  const handleAddStatusColumn = () => {
    if (!newStatusName.trim() || !currentWorkspace) return;
    const name = newStatusName.trim();

    if (orderedStatuses.includes(name)) {
      alert("Status ini sudah ada.");
      return;
    }

    const nextOrdered = [...orderedStatuses, name];
    setCustomStatuses(prev => Array.from(new Set([...prev, name])));
    setNewStatusName("");
    setIsAddingStatus(false);

    apiRequest(`/workspaces/${currentWorkspace.slug}/status-order`, "PUT", {
      status_order: nextOrdered
    }).catch(err => {
      console.error("Gagal menyimpan status kolom baru:", err.message);
      alert("Gagal menyimpan kolom status baru ke database: " + err.message);
    });
  };

  // Columns definition (Dynamic based on drag-and-drop order)
  const columns = orderedStatuses.map(status => {
    let label = status;
    let desc = `Tiket dengan status ${status}`;
    let color = "#A855F7"; // Default purple hex
    
    if (status === "Open" || status === "Todo") {
      label = "Open";
      desc = "Tiket belum dikerjakan";
      color = "#71717A"; // Default zinc grey hex
    } else if (status === "In Progress") {
      label = "In Progress";
      desc = "Sedang dikerjakan oleh tim";
      color = "#EAB308"; // Default yellow hex
    } else if (status === "Closed" || status === "Resolved" || status === "Done") {
      label = "Closed";
      desc = "Tiket selesai dikerjakan";
      color = "#10B981"; // Default emerald green hex
    }

    // Override with custom metadata from localStorage if present
    const meta = columnsMeta[status];
    if (meta) {
      if (meta.label) label = meta.label;
      if (meta.desc) desc = meta.desc;
      if (meta.color) color = meta.color;
    }
    
    return { status, label, desc, color };
  });

  const getSelectedAduanLabel = () => {
    if (selectedAduanId === "all") return "Semua Saluran Aduan";
    if (selectedAduanId === "none") return "Tiket Internal / Tanpa Saluran";
    const found = aduanServices.find(s => s.id === selectedAduanId);
    return found ? found.name : "Saluran Aduan";
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.creator.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (selectedAduanId === "all") return true;
    if (selectedAduanId === "none") return t.aduanServiceId === null;
    return t.aduanServiceId === selectedAduanId;
  });


  return (
    <div className="flex flex-col w-full h-[calc(100vh-96px)] md:h-[calc(100vh-128px)] text-left font-sans text-zinc-300">
      
      {error ? (
        <div className="bg-secondary-panel rounded-lg border border-red-500/20 p-8 shadow-2xl flex flex-col items-center gap-5 text-center my-12 max-w-xl mx-auto w-full animate-in fade-in duration-200">
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
          {/* 1. Github Projects Style Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-secondary-border gap-4">
            <div className="flex items-center gap-2 select-none">
              <Lock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span className="text-sm font-bold text-zinc-100">{currentWorkspace?.name || "Workspace"}</span>
            </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="p-1.5 rounded bg-secondary-panel border border-secondary-border hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Unified Tab + Filter + Action Row */}
      <div className="flex items-center border-b border-secondary-border bg-secondary-panel/10 gap-0 pr-2">
        
        {/* View Tabs */}
        <div className="flex items-center shrink-0">
          <button 
            onClick={() => setActiveTab("View 1")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "View 1" ? "border-accent-orange text-zinc-100 bg-secondary-panel/20" : "border-transparent text-secondary-text hover:text-zinc-200"}`}
          >
            <List className={`h-3.5 w-3.5 transition-colors ${activeTab === "View 1" ? "text-accent-orange" : "text-zinc-500"}`} />
            List
          </button>
          <button 
            onClick={() => setActiveTab("View 2")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "View 2" ? "border-accent-orange text-zinc-100 bg-secondary-panel/20" : "border-transparent text-secondary-text hover:text-zinc-200"}`}
          >
            <KanbanSquare className={`h-3.5 w-3.5 transition-colors ${activeTab === "View 2" ? "text-accent-orange" : "text-zinc-500"}`} />
            Board
          </button>
          <button 
            onClick={() => setActiveTab("View 3")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "View 3" ? "border-accent-orange text-zinc-100 bg-secondary-panel/20" : "border-transparent text-secondary-text hover:text-zinc-200"}`}
          >
            <BarChart4 className={`h-3.5 w-3.5 transition-colors ${activeTab === "View 3" ? "text-accent-orange" : "text-zinc-500"}`} />
            Roadmap
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-4 bg-secondary-border/60 mx-3 shrink-0" />

        {/* Search Input */}
        <div className="relative flex items-center bg-secondary-panel border border-secondary-border rounded px-3 py-1 flex-1 min-w-0 max-w-xs focus-within:border-accent-orange transition-all my-2">
          <Search className="h-3.5 w-3.5 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Filter by keyword or by field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none py-0.5"
          />
        </div>

        {/* Aduan Channel Dropdown */}
        <div className="relative ml-2 shrink-0">
          <button
            onClick={() => setIsAduanDropdownOpen(!isAduanDropdownOpen)}
            className="px-3 py-1.5 rounded bg-secondary-panel border border-secondary-border hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Layers className="h-3.5 w-3.5 text-accent-orange" />
            <span>{getSelectedAduanLabel()}</span>
            <ChevronDown className="h-3 w-3 text-zinc-500" />
          </button>
          {isAduanDropdownOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-64 bg-secondary-panel border border-secondary-border rounded shadow-xl z-50 py-1 font-sans text-xs">
              <button
                onClick={() => {
                  setSelectedAduanId("all");
                  setIsAduanDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-primary-base/50 flex items-center justify-between cursor-pointer ${selectedAduanId === "all" ? "text-accent-orange font-bold" : "text-zinc-300"}`}
              >
                Semua Saluran Aduan
              </button>
              <button
                onClick={() => {
                  setSelectedAduanId("none");
                  setIsAduanDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-primary-base/50 flex items-center justify-between cursor-pointer ${selectedAduanId === "none" ? "text-accent-orange font-bold" : "text-zinc-300"}`}
              >
                Tiket Internal / Tanpa Saluran
              </button>
              <div className="border-t border-secondary-border/50 my-1" />
              {aduanServices.length === 0 ? (
                <div className="px-3 py-2 text-zinc-500 italic text-center">Tidak ada saluran aduan aktif</div>
              ) : (
                aduanServices.map(service => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedAduanId(service.id);
                      setIsAduanDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-primary-base/50 flex flex-col gap-0.5 cursor-pointer ${selectedAduanId === service.id ? "text-accent-orange font-bold" : "text-zinc-300"}`}
                  >
                    <span className="truncate">{service.name}</span>
                    <span className="text-[9px] text-zinc-500 font-normal truncate">{service.description || "Tidak ada deskripsi"}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Tambah Kontainer Button */}
        <button 
          onClick={handleOpenAddContainer}
          className="px-3 py-1.5 rounded bg-secondary-panel border border-secondary-border hover:border-zinc-700 hover:text-zinc-100 text-zinc-200 text-xs font-medium flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-[0.98] transition-all"
        >
          <Plus className="h-3.5 w-3.5 text-accent-orange" />
          Tambah Kontainer
        </button>
      </div>


      {/* 4. Kanban Columns Container */}
      {activeTab === "View 2" && (
        <div 
          ref={columnsContainerRef}
          className={`flex-1 min-h-0 flex gap-4 overflow-x-auto pb-2 items-stretch mt-2 transition-all duration-300 ${
            draggedColStatus ? "pr-[340px]" : "pr-4"
          }`}
        >
          {columns.map((col, colIdx) => {
            const colTickets = filteredTickets.filter(t => t.status === col.status);
            const hoverIndex = colTickets.findIndex(t => t.id === dragOverTicketId);
            const hoverColIndex = orderedStatuses.indexOf(dragOverColStatus || "");
            const shouldTranslateCol = draggedColStatus && hoverColIndex !== -1 && colIdx >= hoverColIndex && col.status !== draggedColStatus;

            return (
              <div
                key={col.status}
                onDragOver={(e) => handleDragOverCol(e, col.status)}
                onDragLeave={handleDragLeaveCol}
                onDrop={(e) => handleDropCol(e, col.status)}
                className="relative shrink-0 h-full"
              >
                {/* Visual column placeholder */}
                {dragOverColStatus === col.status && (
                  <div 
                    className="absolute top-0 bottom-0 left-0 border-2 border-dashed border-accent-orange/40 rounded-lg bg-accent-orange/5 pointer-events-none animate-in fade-in duration-200"
                    style={{ width: "320px" }}
                  />
                )}

                <div 
                  draggable
                  onDragStart={(e) => handleDragStartCol(e, col.status)}
                  onDragEnd={handleDragEndCol}
                  style={{
                    transform: shouldTranslateCol ? "translateX(336px)" : "translateX(0px)",
                    transition: "transform 0.3s ease-in-out",
                  }}
                  className={`w-80 bg-secondary-panel rounded-lg border p-3 flex flex-col gap-2 h-full min-h-[350px] ${
                    draggedColStatus === col.status
                      ? "border-dashed border-zinc-800 bg-secondary-panel/30 opacity-35 scale-[0.98] select-none shadow-none cursor-grabbing"
                      : "border-secondary-border"
                  }`}
                >
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full border-2" 
                    style={{ borderColor: col.color }} 
                  />
                  <h3 className="text-xs font-bold text-zinc-100">{col.label}</h3>
                  <span className="bg-zinc-800/80 px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                    {colTickets.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setShowAddInColumn(col.status)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200"
                    title="Add item"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveColMenu(activeColMenu === col.status ? null : col.status)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                    
                    {activeColMenu === col.status && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveColMenu(null)}
                        />
                        <div className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-secondary-border rounded shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                          <button
                            onClick={() => {
                              setEditingColStatus(col.status);
                              setEditingColName(col.status);
                              setEditingColDesc(col.desc);
                              setEditingColColor(col.color);
                              setActiveColMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Edit Kontainer</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Column Subheader Description */}
              <span className="text-[10px] text-zinc-500 text-left font-medium block">
                {col.desc}
              </span>

              {/* Column Inline Item Form */}
              {showAddInColumn === col.status && (
                <div className="p-2 border border-accent-orange bg-primary-base rounded flex flex-col gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Judul tiket..."
                    value={columnNewTitle}
                    onChange={(e) => setColumnNewTitle(e.target.value)}
                    autoFocus
                    className="bg-transparent text-xs text-zinc-100 placeholder-zinc-700 w-full focus:outline-none"
                  />
                  <div className="flex gap-1.5 justify-end">
                    <button
                      onClick={() => setShowAddInColumn(null)}
                      className="px-2 py-0.5 text-[9px] border border-secondary-border text-zinc-400 rounded hover:bg-secondary-panel"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleAddTicketInColumn(col.status)}
                      className="px-2 py-0.5 text-[9px] bg-accent-orange text-primary-base font-bold rounded hover:bg-accent-orange-hover"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              )}

              {/* Ticket Cards List */}
              <div 
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedTicketId) {
                    setDragOverColForCard(col.status);
                  }
                }}
                onDragLeave={() => {
                  setDragOverColForCard(null);
                }}
                onDrop={(e) => {
                  handleDropOnColumn(e, col.status);
                  setDragOverColForCard(null);
                }}
                className={`flex flex-col gap-2 mt-2 flex-grow overflow-y-auto min-h-[150px] relative transition-all duration-300 ${
                  draggedTicketId && dragOverColForCard === col.status ? "pb-[130px]" : "pb-2"
                }`}
              >
                {colTickets.length > 0 ? (
                  colTickets.map((ticket, index) => {
                    const shouldTranslate = draggedTicketId && hoverIndex !== -1 && index >= hoverIndex && ticket.id !== draggedTicketId;
                    return (
                      <div
                        key={ticket.id}
                        onDragOver={(e) => handleDragOverCard(e, ticket.id)}
                        onDragLeave={handleDragLeaveCard}
                        onDrop={(e) => handleDropOnCard(e, ticket.id)}
                        className="relative"
                      >
                        {/* Visual placeholder inside the opened space */}
                        {dragOverTicketId === ticket.id && (
                          <div 
                            className="absolute top-0 left-0 right-0 border-2 border-dashed border-accent-orange/40 rounded-md bg-accent-orange/5 pointer-events-none animate-in fade-in duration-200"
                            style={{ height: "108px" }}
                          />
                        )}
                        
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, ticket.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedTicket(ticket)}
                          style={{
                            transform: shouldTranslate ? "translateY(116px)" : "translateY(0px)",
                            transition: "transform 0.3s ease-in-out",
                          }}
                          className={`p-3 rounded-md border text-left flex flex-col gap-2 resize overflow-auto min-h-[100px] min-w-[200px] max-w-full ${
                            draggedTicketId === ticket.id
                              ? "border-dashed border-zinc-800 bg-secondary-panel/30 opacity-35 scale-[0.98] select-none shadow-none cursor-grabbing"
                              : "bg-primary-base border-secondary-border hover:border-zinc-600 cursor-grab active:cursor-grabbing shadow shadow-black/20 group"
                          }`}
                        >
                          <div className={`flex flex-col gap-2 h-full w-full ${draggedTicketId ? "pointer-events-none" : ""}`}>
                            {/* Check icon & Creator tag */}
                            <div className="flex items-center gap-1.5">
                              {ticket.status === "Done" ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                              )}
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {ticket.creator} #{ticket.number}
                              </span>
                            </div>
                            
                            {/* Title */}
                            <h4 className="text-xs font-semibold text-zinc-200 leading-snug line-clamp-2 group-hover:text-accent-orange transition-colors">
                              {ticket.title}
                            </h4>

                            {/* Bottom row: Priority & Assignee Initials */}
                            <div className="flex justify-between items-center mt-1 border-t border-secondary-border/30 pt-2">
                              <span className={`text-[8px] px-1 rounded font-mono font-bold border ${
                                ticket.priority === "Urgent" ? "text-red-500 bg-red-500/10 border-red-500/20" :
                                ticket.priority === "High" ? "text-accent-orange bg-accent-orange/10 border-accent-orange/20" :
                                ticket.priority === "Medium" ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" :
                                "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"
                              }`}>
                                {ticket.priority}
                              </span>
                              
                              <div className="w-5 h-5 rounded-full bg-secondary-panel border border-secondary-border flex items-center justify-center text-[9px] font-bold text-zinc-400" title={`Petugas: ${ticket.assignee}`}>
                                {ticket.assignee.substring(0, 1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  dragOverColForCard !== col.status && (
                    <div className="py-8 text-center text-[10px] text-zinc-600 border border-dashed border-secondary-border rounded-md">
                      No items in this column
                    </div>
                  )
                )}

                {/* Visual placeholder at the bottom if dragging over column background/empty area */}
                {dragOverColForCard === col.status && !dragOverTicketId && (
                  <div className="relative transition-all duration-300 ease-in-out h-[116px] w-full shrink-0">
                    <div 
                      className="border-2 border-dashed border-accent-orange/40 rounded-md bg-accent-orange/5 pointer-events-none animate-in fade-in duration-200"
                      style={{ height: "108px" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

        {isAddingStatus ? (
          <div className="w-64 shrink-0 bg-secondary-panel rounded-lg border border-secondary-border p-3 flex flex-col gap-2">
            <h3 className="text-xs font-bold text-zinc-100">Status Baru</h3>
            <input
              type="text"
              placeholder="Nama status..."
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-750 w-full focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsAddingStatus(false)}
                className="px-2 py-1 text-[10px] border border-secondary-border text-zinc-400 rounded hover:bg-zinc-850"
              >
                Batal
              </button>
              <button
                onClick={handleAddStatusColumn}
                className="px-2 py-1 text-[10px] bg-accent-orange text-primary-base font-bold rounded hover:bg-accent-orange-hover"
              >
                Tambah
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingStatus(true)}
            className="w-12 h-[450px] shrink-0 bg-secondary-panel/20 hover:bg-secondary-panel/50 border border-dashed border-secondary-border rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors"
            title="Tambah Kolom Status Baru"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>
      )}

      {/* 4.5. List View Table */}
      {activeTab === "View 1" && (
        <div className="bg-secondary-panel border border-secondary-border rounded-lg overflow-hidden shadow-2xl mt-2 animate-in fade-in-50 duration-150 text-left">
          <ReusableTableComponent 
            tickets={filteredTickets} 
            onRowClick={(ticket) => setSelectedTicket(ticket as any)} 
            extraColumn="reporter" 
          />
        </div>
      )}

      {/* 4.6. Roadmap View (Gantt Chart Timeline) */}
      {activeTab === "View 3" && (() => {
        const startTimelineDate = new Date(2026, 5, 29); // June 29
        const totalTimelineDays = 39;
        const timelineDays = Array.from({ length: totalTimelineDays }, (_, i) => {
          const d = new Date(startTimelineDate);
          d.setDate(startTimelineDate.getDate() + i);
          return d;
        });

        return (
          <div className="flex rounded-lg border border-secondary-border bg-secondary-panel overflow-hidden shadow-2xl mt-2 animate-in fade-in-50 duration-150 text-left">
            
            {/* Panel Kiri: Daftar Tiket */}
            <div className="w-80 border-r border-secondary-border bg-secondary-panel shrink-0 flex flex-col">
              <div className="h-16 border-b border-secondary-border flex items-center px-4 font-bold text-[10px] text-zinc-500 uppercase tracking-wider bg-primary-base/10 shrink-0">
                Judul Tiket
              </div>
              <div className="flex flex-col divide-y divide-secondary-border/40 overflow-y-auto max-h-[450px]">
                {filteredTickets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 italic">Tidak ada tiket</div>
                ) : (
                  filteredTickets.map((ticket, idx) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="h-10 hover:bg-primary-base/10 flex items-center px-4 cursor-pointer transition-colors text-xs font-semibold text-zinc-200 select-none truncate"
                    >
                      <span className="w-4.5 h-4.5 rounded-full border border-secondary-border bg-zinc-900/50 flex items-center justify-center mr-2 shrink-0 font-mono text-[8px] text-zinc-400 font-bold">
                        {idx + 1}
                      </span>
                      <span className="truncate flex-grow">{ticket.title}</span>
                      <span className="text-[9px] font-mono text-zinc-500 shrink-0 ml-1">#{ticket.number}</span>
                    </div>
                  ))
                )}
                {/* Add item button */}
                <button 
                  onClick={() => {
                    const title = prompt("Masukkan judul tiket baru:");
                    if (title && title.trim() && currentWorkspace) {
                      apiRequest(`/workspaces/${currentWorkspace.slug}/tickets`, "POST", {
                        title: title.trim(),
                        description: "",
                        priority: "Medium",
                        status: "Open"
                      }).then(() => fetchTickets(currentWorkspace.slug));
                    }
                  }}
                  className="h-10 hover:bg-primary-base/10 flex items-center px-4 cursor-pointer text-zinc-500 hover:text-accent-orange transition-colors text-xs font-semibold select-none border-t border-secondary-border/40 text-left shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-2 shrink-0" />
                  Add item
                </button>
              </div>
            </div>

            {/* Panel Kanan: Scrollable Timeline */}
            <div className="flex-1 overflow-x-auto select-none bg-primary-base/5 scrollbar-thin max-h-[506px]">
              <div className="w-[1248px] flex flex-col relative">
                
                {/* Header: Months */}
                <div className="h-8 border-b border-secondary-border flex items-center text-[9px] font-bold text-zinc-500 uppercase tracking-wider relative bg-primary-base/10 shrink-0 select-none">
                  <span className="absolute left-[8px]">June 2026</span>
                  <span className="absolute left-[72px]">July 2026</span>
                  <span className="absolute left-[1064px]">August 2026</span>
                </div>

                {/* Header: Day Numbers */}
                <div 
                  className="h-8 border-b border-secondary-border grid text-[9px] font-bold text-zinc-500 shrink-0 select-none bg-primary-base/10"
                  style={{ gridTemplateColumns: "repeat(39, minmax(0, 1fr))" }}
                >
                  {timelineDays.map((day, idx) => {
                    const isToday = day.getDate() === 18 && day.getMonth() === 6; // July 18
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-center border-r border-secondary-border/20 h-full ${
                          isToday ? "text-red-400 bg-red-500/5 font-black border-r-red-500/20" : ""
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    );
                  })}
                </div>

                {/* Grid Rows Container */}
                <div className="relative flex flex-col divide-y divide-secondary-border/40">
                  
                  {/* Vertical Red Today Line */}
                  <div 
                    className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
                    style={{ left: `${(19.5 / 39) * 100}%` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute -top-1" />
                    <div className="w-[1.5px] bg-red-500/60 h-full border-dashed" />
                  </div>

                  {/* Rows mapping tickets */}
                  {filteredTickets.map((ticket, idx) => {
                    const startTimelineDate = new Date(2026, 5, 29); // June 29
                    const ticketDate = new Date(ticket.createdAt);
                    const diffTime = ticketDate.getTime() - startTimelineDate.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    let startIndex = diffDays >= 0 ? diffDays : 0;
                    startIndex = Math.min(Math.max(0, startIndex), 37);
                    
                    let duration = 7;
                    if (ticket.priority === "Urgent") duration = 2;
                    else if (ticket.priority === "High") duration = 4;
                    else if (ticket.priority === "Medium") duration = 7;
                    else if (ticket.priority === "Low") duration = 10;
                    
                    duration = Math.min(duration, 39 - startIndex);

                    const barLeft = (startIndex / 39) * 100;
                    const barWidth = (duration / 39) * 100;

                    return (
                      <div key={ticket.id} className="h-10 relative flex items-center w-full">
                        {/* Grid cells background divider lines */}
                        <div 
                          className="absolute inset-0 grid pointer-events-none" 
                          style={{ gridTemplateColumns: "repeat(39, minmax(0, 1fr))" }}
                        >
                          {Array.from({ length: 39 }).map((_, cIdx) => (
                            <div key={cIdx} className="border-r border-secondary-border/10 h-full" />
                          ))}
                        </div>

                        {/* Timeline Bar item */}
                        <div
                          onClick={() => setSelectedTicket(ticket)}
                          style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                          className={`absolute h-6 rounded-md flex items-center justify-between text-[10px] font-bold px-2.5 select-none shadow-md shadow-black/30 cursor-pointer hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all border ${
                            ticket.priority === "Urgent" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                            ticket.priority === "High" ? "bg-accent-orange/10 border-accent-orange/30 text-accent-orange" :
                            ticket.priority === "Medium" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                            "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                          }`}
                        >
                          <span className="truncate">{ticket.title}</span>
                          <span className="text-[8px] font-mono opacity-80 shrink-0 ml-1">#{ticket.number}</span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Empty bottom row to align with Left Panel Add Item button */}
                  <div className="h-10 relative flex items-center w-full">
                    <div 
                      className="absolute inset-0 grid pointer-events-none bg-primary-base/5"
                      style={{ gridTemplateColumns: "repeat(39, minmax(0, 1fr))" }}
                    >
                      {Array.from({ length: 39 }).map((_, cIdx) => (
                        <div key={cIdx} className="border-r border-secondary-border/10 h-full" />
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        );
      })()}

      {/* 5. GITHUB-STYLE SIDE DETAIL PANEL (Opens when a ticket card is clicked) */}
      {selectedTicket && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-secondary-panel border-l border-secondary-border shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          
          <div className="flex flex-col gap-5">
            {/* Panel Close Button */}
            <div className="flex justify-between items-center border-b border-secondary-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded font-bold text-zinc-400">
                  {selectedTicket.id}
                </span>
                <span className="text-xs text-secondary-text">
                  #{selectedTicket.number}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded text-zinc-500 hover:text-zinc-100 hover:bg-primary-base transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Judul Item</span>
              <h2 className="text-sm font-bold text-zinc-100 leading-snug">{selectedTicket.title}</h2>
            </div>

            {/* Fields grid */}
            <div className="flex flex-col gap-4 border-t border-b border-secondary-border/50 py-4 my-2 text-xs">
              
              {/* Status */}
              <div className="grid grid-cols-3 items-center">
                <span className="text-zinc-500 font-medium">Status</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                  className="col-span-2 bg-primary-base border border-secondary-border text-xs rounded p-2 text-zinc-200 focus:outline-none focus:border-accent-orange cursor-pointer"
                >
                  {orderedStatuses.map(statusName => (
                    <option key={statusName} value={statusName}>{statusName}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="grid grid-cols-3 items-center">
                <span className="text-zinc-500 font-medium">Priority</span>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => handlePriorityChange(selectedTicket.id, e.target.value as Ticket["priority"])}
                  className="col-span-2 bg-primary-base border border-secondary-border text-xs rounded p-2 text-zinc-200 focus:outline-none focus:border-accent-orange cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* Reporter */}
              <div className="grid grid-cols-3 items-center">
                <span className="text-zinc-500 font-medium">Reporter</span>
                <span className="col-span-2 text-zinc-300 font-mono text-[11px]">{selectedTicket.creator}</span>
              </div>

              {/* Assignee */}
              <div className="grid grid-cols-3 items-center">
                <span className="text-zinc-500 font-medium">Assignee</span>
                <select
                  value={selectedTicket.assigneeId || ""}
                  onChange={async (e) => {
                    const val = e.target.value || null;
                    const member = workspaceMembers.find(m => m.id === val);
                    const name = member ? member.name : "Belum Ditugaskan";
                    
                    // Optimistic update
                    setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, assigneeId: val, assignee: name } : t));
                    setSelectedTicket(prev => prev ? { ...prev, assigneeId: val, assignee: name } : null);
                    
                    try {
                      await apiRequest(`/workspaces/${currentWorkspace.slug}/tickets/${selectedTicket.rawId}`, "PUT", {
                        assignee_id: val
                      });
                    } catch (err: any) {
                      alert("Gagal memperbarui petugas: " + err.message);
                      fetchTickets(currentWorkspace.slug);
                    }
                  }}
                  className="col-span-2 bg-primary-base border border-secondary-border text-xs rounded p-2 text-zinc-200 focus:outline-none focus:border-accent-orange cursor-pointer"
                >
                  <option value="">Belum Ditugaskan</option>
                  {workspaceMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Delete Action button */}
          <div className="border-t border-secondary-border/50 pt-4 flex gap-3">
            <button
              onClick={() => handleDelete(selectedTicket.id)}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Item
            </button>
            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2 px-3 text-xs bg-primary-base border border-secondary-border text-zinc-300 hover:bg-secondary-border rounded font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>

        </div>
      )}
        </>
      )}

      {/* Edit Container (Status Column) Modal */}
      {editingColStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-secondary-panel border border-secondary-border rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 animate-in zoom-in-95 duration-200 text-left">
            
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                Edit Kontainer
              </h3>
              <p className="text-[11px] text-secondary-text leading-relaxed">
                Ubah nama kolom, deskripsi, dan warna indikator status kartu ini pada papan Kanban.
              </p>
            </div>

            <div className="border-t border-secondary-border/50 my-1" />

            {/* Container Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="colNameInput" className="text-[11px] font-semibold text-zinc-400">
                Nama Kontainer
              </label>
              <input
                id="colNameInput"
                type="text"
                required
                value={editingColName}
                onChange={(e) => setEditingColName(e.target.value)}
                placeholder="Misal: Review"
                className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-accent-orange w-full"
                autoFocus
              />
            </div>

            {/* Container Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="colDescInput" className="text-[11px] font-semibold text-zinc-400">
                Deskripsi Kontainer
              </label>
              <textarea
                id="colDescInput"
                value={editingColDesc}
                onChange={(e) => setEditingColDesc(e.target.value)}
                placeholder="Deskripsi tugas kolom ini..."
                rows={2}
                className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-accent-orange w-full resize-none"
              />
            </div>

            {/* Indicator Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-zinc-400">
                Warna Indikator
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={editingColColor}
                  onChange={(e) => setEditingColColor(e.target.value)}
                  className="w-9 h-9 rounded border border-secondary-border cursor-pointer bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={editingColColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith("#") && val.length <= 7) {
                      setEditingColColor(val);
                    } else if (!val.startsWith("#") && val.length <= 6) {
                      setEditingColColor("#" + val);
                    }
                  }}
                  placeholder="#Hex"
                  maxLength={7}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-700 w-28 text-center font-mono focus:outline-none focus:border-accent-orange"
                />
              </div>
            </div>

            <div className="border-t border-secondary-border/50 my-1" />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingColStatus(null)}
                className="px-3.5 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const newName = editingColName.trim();
                  if (!newName) return;

                  setIsLoading(true);
                  try {
                    const nextMeta = { ...columnsMeta };

                    if (newName !== editingColStatus) {
                      // Name changed: rename status column
                      if (orderedStatuses.includes(newName)) {
                        alert("Nama status ini sudah digunakan oleh kolom lain.");
                        setIsLoading(false);
                        return;
                      }

                      const ticketsToUpdate = tickets.filter(t => t.status === editingColStatus);
                      
                      // 1. Update status order on backend
                      const nextOrdered = orderedStatuses.map(s => s === editingColStatus ? newName : s);
                      await apiRequest(`/workspaces/${currentWorkspace.slug}/status-order`, "PUT", {
                        status_order: nextOrdered
                      });

                      // 2. Migrate tickets concurrently if there are any
                      if (ticketsToUpdate.length > 0) {
                        await Promise.all(
                          ticketsToUpdate.map(t => 
                            apiRequest(`/workspaces/${currentWorkspace.slug}/tickets/${t.rawId}`, "PUT", {
                              status: newName
                            })
                          )
                        );
                      }

                      // Clean up old meta key
                      delete nextMeta[editingColStatus];
                    }

                    // Save new metadata
                    nextMeta[newName] = {
                      label: newName,
                      desc: editingColDesc.trim(),
                      color: editingColColor
                    };

                    localStorage.setItem(
                      `workspace_status_meta_${currentWorkspace.slug}`, 
                      JSON.stringify(nextMeta)
                    );

                    // 3. Refresh state in-place without page reload
                    await fetchTickets(currentWorkspace.slug);
                    await fetchWorkspaceDetail(currentWorkspace.slug);
                    const metaStr = localStorage.getItem(`workspace_status_meta_${currentWorkspace.slug}`);
                    if (metaStr) {
                      setColumnsMeta(JSON.parse(metaStr));
                    }
                  } catch (err: any) {
                    alert("Gagal memperbarui kontainer: " + err.message);
                  } finally {
                    setIsLoading(false);
                    setEditingColStatus(null);
                  }
                }}
                disabled={isLoading || !editingColName.trim()}
                className="px-4 py-2 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded disabled:opacity-50 transition-all active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Simpan"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

