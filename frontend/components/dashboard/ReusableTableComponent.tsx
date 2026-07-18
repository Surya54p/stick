"use client";

import { useState, useEffect } from "react";
import { CircleDot, Clock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

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

interface ReusableTableComponentProps {
  tickets: TicketItem[];
  onRowClick?: (ticket: TicketItem) => void;
  extraColumn?: "reporter" | "date";
  itemsPerPage?: number;
}

export default function ReusableTableComponent({
  tickets,
  onRowClick,
  extraColumn = "date",
  itemsPerPage = 10,
}: ReusableTableComponentProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page whenever tickets list changes (due to filtering or search)
  useEffect(() => {
    setCurrentPage(1);
  }, [tickets]);

  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "todo":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      case "in progress":
      case "progress":
      case "doing":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "resolved":
      case "done":
      case "closed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "todo":
        return <CircleDot className="h-3.5 w-3.5 text-zinc-500 shrink-0" />;
      case "in progress":
      case "progress":
      case "doing":
        return <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
      case "resolved":
      case "done":
      case "closed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
      default:
        return <CircleDot className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "High":
        return "text-accent-orange bg-accent-orange/10 border-accent-orange/20";
      case "Medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  // Pagination Calculations
  const totalItems = tickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedTickets = tickets.slice(startIndex, endIndex);

  return (
    <div className="w-full text-left">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-secondary-border/50 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-primary-base/20">
              <th className="py-3 px-4 w-28">ID</th>
              <th className="py-3 px-4">Judul</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th className="py-3 px-4 w-32">Prioritas</th>
              <th className="py-3 px-4 w-40">
                {extraColumn === "reporter" ? "Reporter" : "Tanggal"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-border/50 text-xs">
            {paginatedTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                  Tidak ada tiket yang ditemukan
                </td>
              </tr>
            ) : (
              paginatedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onRowClick?.(ticket)}
                  className={`hover:bg-primary-base/10 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">
                    {ticket.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-zinc-200">
                    <div className="flex flex-col gap-0.5">
                      <span>{ticket.title}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        No. {ticket.number}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStatusColorClass(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getPriorityStyle(
                        ticket.priority
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-500 font-mono text-[10px]">
                    {extraColumn === "reporter" ? ticket.creator : ticket.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-secondary-border/50 bg-primary-base/10 text-zinc-400">
          <span className="text-[11px] font-mono">
            Menampilkan <strong className="text-zinc-200">{totalItems > 0 ? startIndex + 1 : 0}</strong> - <strong className="text-zinc-200">{endIndex}</strong> dari <strong className="text-zinc-200">{totalItems}</strong> tiket
          </span>
          
          <div className="flex items-center gap-1.5">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-secondary-border bg-secondary-panel hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded border transition-all cursor-pointer ${
                  currentPage === page
                    ? "border-accent-orange bg-accent-orange/10 text-accent-orange"
                    : "border-secondary-border bg-secondary-panel hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-secondary-border bg-secondary-panel hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
