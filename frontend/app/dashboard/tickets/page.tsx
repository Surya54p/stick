"use client";

import { useState } from "react";
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
  BarChart4
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  creator: string;
  assignee: string;
  status: "Todo" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High" | "Urgent";
  number: number;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "STK-104",
    title: "Gagal integrasi payment gateway pada checkout",
    creator: "Budi Santoso",
    assignee: "Alex",
    status: "Todo",
    priority: "Urgent",
    number: 4
  },
  {
    id: "STK-103",
    title: "Gambar profil pengguna tidak termuat dari CDN",
    creator: "Siti Rahma",
    assignee: "Sarah",
    status: "In Progress",
    priority: "High",
    number: 3
  },
  {
    id: "STK-102",
    title: "Tombol cetak invoice bergeser ke bawah pada mobile",
    creator: "Andi Wijaya",
    assignee: "Rian",
    status: "In Progress",
    priority: "Medium",
    number: 2
  },
  {
    id: "STK-101",
    title: "debugging almukhtar",
    creator: "cayrus",
    assignee: "Rian",
    status: "Done",
    priority: "Low",
    number: 1
  }
];

export default function TicketsKanbanPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("View 2"); // View 2 is Board
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Interactive column ticket creators
  const [showAddInColumn, setShowAddInColumn] = useState<string | null>(null);
  const [columnNewTitle, setColumnNewTitle] = useState("");

  // Drag and Drop States
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Ticket["status"]) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: targetStatus } : t));
  };

  // Add Ticket inside a Column
  const handleAddTicketInColumn = (status: Ticket["status"]) => {
    if (!columnNewTitle.trim()) return;
    
    const newNumber = tickets.length + 1;
    const newTicket: Ticket = {
      id: `STK-${104 + newNumber}`,
      title: columnNewTitle,
      creator: "Rian Adiputra",
      assignee: "Rian",
      status: status,
      priority: "Medium",
      number: newNumber
    };

    setTickets([...tickets, newTicket]);
    setColumnNewTitle("");
    setShowAddInColumn(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus tiket ini?")) {
      setTickets(prev => prev.filter(t => t.id !== id));
      setSelectedTicket(null);
    }
  };

  const handleStatusChange = (id: string, newStatus: Ticket["status"]) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handlePriorityChange = (id: string, newPriority: Ticket["priority"]) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, priority: newPriority } : t));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(prev => prev ? { ...prev, priority: newPriority } : null);
    }
  };

  // Columns definition
  const columns: { status: Ticket["status"]; label: string; desc: string; color: string }[] = [
    { 
      status: "Todo", 
      label: "Todo", 
      desc: "This item hasn't been started", 
      color: "border-zinc-500 text-zinc-400" 
    },
    { 
      status: "In Progress", 
      label: "In Progress", 
      desc: "This is actively being worked on", 
      color: "border-yellow-600 text-yellow-500" 
    },
    { 
      status: "Done", 
      label: "Done", 
      desc: "This has been completed", 
      color: "border-purple-500 text-purple-400" 
    }
  ];

  return (
    <div className="flex flex-col w-full text-left font-sans text-zinc-300">
      
      {/* 1. Github Projects Style Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-secondary-border gap-4">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">🔒</span>
          <span className="text-sm font-bold text-zinc-100">@Surya54p's untitled project</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="px-3 py-1.5 rounded bg-secondary-panel border border-secondary-border hover:bg-zinc-800 text-zinc-200 transition-colors font-medium">
            Add status update
          </button>
          <button className="px-3 py-1.5 rounded bg-secondary-panel border border-secondary-border hover:bg-zinc-800 text-zinc-200 transition-colors font-medium flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Insights
          </button>
          <button className="px-3 py-1.5 rounded bg-secondary-panel border border-secondary-border hover:bg-zinc-800 text-zinc-200 transition-colors font-medium flex items-center gap-1.5">
            <Workflow className="h-3.5 w-3.5" />
            Workflows <span className="bg-zinc-800 px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ml-0.5">6</span>
          </button>
          <button className="p-1.5 rounded bg-secondary-panel border border-secondary-border hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. View Navigation Tabs (View 1, View 2, View 3) */}
      <div className="flex items-center border-b border-secondary-border">
        <div className="flex items-center">
          <button 
            onClick={() => setActiveTab("View 1")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "View 1" ? "border-accent-orange text-zinc-100 bg-secondary-panel/20" : "border-transparent text-secondary-text hover:text-zinc-200"}`}
          >
            <List className="h-3.5 w-3.5" />
            View 1
          </button>
          <button 
            onClick={() => setActiveTab("View 2")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "View 2" ? "border-accent-orange text-zinc-100 bg-secondary-panel/20" : "border-transparent text-secondary-text hover:text-zinc-200"}`}
          >
            <KanbanSquare className="h-3.5 w-3.5 text-accent-orange" />
            View 2
          </button>
          <button 
            onClick={() => setActiveTab("View 3")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "View 3" ? "border-accent-orange text-zinc-100 bg-secondary-panel/20" : "border-transparent text-secondary-text hover:text-zinc-200"}`}
          >
            <BarChart4 className="h-3.5 w-3.5" />
            View 3
          </button>
          <button className="px-4 py-3 text-xs font-semibold text-zinc-500 hover:text-zinc-300">
            + New view
          </button>
        </div>
      </div>

      {/* 3. Search and View Options Row */}
      <div className="py-3 flex items-center justify-between gap-4">
        <div className="relative flex items-center bg-secondary-panel border border-secondary-border rounded px-3 py-1 flex-1 max-w-md focus-within:border-accent-orange transition-all">
          <Search className="h-3.5 w-3.5 text-zinc-500 mr-2" />
          <input
            type="text"
            placeholder="Filter by keyword or by field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none py-1"
          />
        </div>
        <button className="px-3 py-1.5 rounded bg-secondary-panel border border-secondary-border hover:bg-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
          View
        </button>
      </div>

      {/* 4. Kanban Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start mt-2">
        {columns.map(col => {
          const colTickets = tickets.filter(t => t.status === col.status && 
            (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             t.creator.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          return (
            <div 
              key={col.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
              className="w-80 shrink-0 bg-secondary-panel rounded-lg border border-secondary-border p-3 flex flex-col gap-2 min-h-[450px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.color.split(" ")[0]}`} />
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
                  <button className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
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
              <div className="flex flex-col gap-2 mt-2 flex-grow overflow-y-auto">
                {colTickets.length > 0 ? (
                  colTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ticket.id)}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-3 bg-primary-base rounded-md border border-secondary-border hover:border-zinc-600 transition-all duration-150 cursor-grab active:cursor-grabbing text-left flex flex-col gap-2 shadow shadow-black/20 group"
                    >
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
                  ))
                ) : (
                  <div className="py-8 text-center text-[10px] text-zinc-600 border border-dashed border-secondary-border rounded-md">
                    No items in this column
                  </div>
                )}
              </div>

            </div>
          );
        })}

        {/* Add column placeholder */}
        <button className="w-12 h-[450px] shrink-0 bg-secondary-panel/20 hover:bg-secondary-panel/50 border border-dashed border-secondary-border rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors">
          <Plus className="h-5 w-5" />
        </button>
      </div>

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
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as Ticket["status"])}
                  className="col-span-2 bg-primary-base border border-secondary-border text-xs rounded p-2 text-zinc-200 focus:outline-none focus:border-accent-orange cursor-pointer"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
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
                  value={selectedTicket.assignee}
                  onChange={(e) => setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, assignee: e.target.value } : t))}
                  className="col-span-2 bg-primary-base border border-secondary-border text-xs rounded p-2 text-zinc-200 focus:outline-none focus:border-accent-orange cursor-pointer"
                >
                  <option value="Rian">Rian</option>
                  <option value="Sarah">Sarah</option>
                  <option value="Alex">Alex</option>
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

    </div>
  );
}
