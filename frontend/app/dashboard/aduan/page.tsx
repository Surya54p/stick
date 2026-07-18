"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { 
  Layers, 
  Plus, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  CircleDot, 
  Power, 
  AlertCircle,
  X,
  FileText
} from "lucide-react";

interface ComplaintService {
  id: string;
  name: string;
  slug: string;
  description: string;
  isOpen: boolean;
  complaintCount: number;
}

export default function AduanManagementPage() {
  const [services, setServices] = useState<ComplaintService[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchServices = async (workspaceSlug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/workspaces/${workspaceSlug}/aduan-services`);
      const mapped: ComplaintService[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description || "",
        isOpen: item.is_open,
        complaintCount: item.complaint_count || 0
      }));
      setServices(mapped);
    } catch (err: any) {
      setError(err.message || "Akses ditolak ke workspace ini.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaultWorkspace = () => {
    if (typeof window !== "undefined") {
      const workspacesStr = localStorage.getItem("workspaces");
      if (workspacesStr) {
        const workspaces = JSON.parse(workspacesStr);
        if (workspaces.length > 0) {
          localStorage.setItem("current_workspace", JSON.stringify(workspaces[0]));
          window.location.reload();
        }
      }
    }
  };

  useEffect(() => {
    const ws = localStorage.getItem("current_workspace");
    if (ws) {
      const parsedWs = JSON.parse(ws);
      setCurrentWorkspace(parsedWs);
      fetchServices(parsedWs.slug);
    }
  }, []);

  const handleCopyLink = (slug: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = `${origin}/aduan/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (id: string) => {
    if (!currentWorkspace) return;
    const service = services.find(s => s.id === id);
    if (!service) return;

    // Optimistic UI update
    setServices(services.map(s => s.id === id ? { ...s, isOpen: !s.isOpen } : s));

    try {
      await apiRequest(`/workspaces/${currentWorkspace.slug}/aduan-services/${id}`, "PUT", {
        is_open: !service.isOpen
      });
    } catch (err: any) {
      alert("Gagal mengubah status layanan: " + err.message);
      fetchServices(currentWorkspace.slug);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim() || !currentWorkspace) return;

    setIsSubmitting(true);
    try {
      const created = await apiRequest(`/workspaces/${currentWorkspace.slug}/aduan-services`, "POST", {
        name: newName,
        slug: newSlug.toLowerCase().trim().replace(/\s+/g, "-"),
        description: newDesc
      });

      const newService: ComplaintService = {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description || "",
        isOpen: created.is_open,
        complaintCount: 0
      };

      setServices([...services, newService]);
      setNewName("");
      setNewSlug("");
      setNewDesc("");
      setIsCreateOpen(false);
    } catch (err: any) {
      alert("Gagal membuat layanan aduan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left font-sans text-zinc-300">
      
      {error ? (
        <div className="bg-secondary-panel rounded-lg border border-red-500/20 p-8 shadow-2xl flex flex-col items-center gap-5 text-center my-12 max-w-xl mx-auto w-full animate-in fade-in duration-200">
          <div className="p-3 bg-red-500/10 rounded-full text-red-500 border border-red-500/20">
            <AlertCircle className="h-8 w-8" />
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Layers className="h-5.5 w-5.5 text-accent-orange" />
            Manajemen Layanan Aduan
          </h1>
          <p className="text-xs text-secondary-text">
            Buka saluran pengaduan publik. Orang lain (anonim/publik) dapat mengirimkan tiket langsung ke workspace Anda melalui tautan khusus.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded shadow-lg shadow-accent-orange/10 transition-all duration-200 active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Buat Layanan Baru
        </button>
      </div>

      {/* Services Grid / Loading State / Empty State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-secondary-text gap-3">
          <span className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Memuat daftar layanan aduan...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-secondary-border rounded-lg text-secondary-text gap-3 bg-secondary-panel/20">
          <Layers className="h-8 w-8 text-zinc-600" />
          <span className="text-xs font-semibold text-zinc-400">Belum ada layanan aduan</span>
          <span className="text-[10px] text-zinc-500">Klik "Buat Layanan Baru" untuk membuka saluran pengaduan publik.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
            const publicUrl = `${origin}/aduan/${service.slug}`;

            return (
              <div 
                key={service.id} 
                className={`bg-secondary-panel rounded-lg border flex flex-col justify-between p-6 transition-all duration-200 ${
                  service.isOpen ? "border-secondary-border hover:border-zinc-700" : "border-red-500/10 opacity-70"
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Banner Header: Name and Status */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-zinc-100 line-clamp-1 leading-snug" title={service.name}>
                      {service.name}
                    </h3>
                    
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                      service.isOpen 
                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                        : "text-red-500 bg-red-500/10 border-red-500/20"
                    }`}>
                      {service.isOpen ? "BUKA" : "TUTUP"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-secondary-text leading-relaxed line-clamp-3">
                    {service.description || "Tidak ada deskripsi layanan."}
                  </p>

                  {/* Complaint count & Stats */}
                  <div className="flex items-center gap-4 bg-primary-base/40 border border-secondary-border/50 rounded p-2.5 mt-1 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Jumlah Aduan</span>
                      <span className="text-sm font-mono font-bold text-zinc-200 mt-0.5">{service.complaintCount} Tiket</span>
                    </div>
                  </div>
                </div>

                {/* Action and URL copy section */}
                <div className="flex flex-col gap-3 border-t border-secondary-border/50 pt-4 mt-6">
                  
                  {/* URL section */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Tautan Aduan Publik</span>
                    <div className="flex items-center bg-primary-base border border-secondary-border rounded p-1.5 font-mono text-[10px] text-zinc-400">
                      <span className="truncate flex-1 pr-2">{publicUrl}</span>
                      <button
                        onClick={() => handleCopyLink(service.slug, service.id)}
                        className="p-1 rounded bg-secondary-panel hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
                        title="Salin Tautan"
                      >
                        {copiedId === service.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex gap-2 justify-between items-center mt-1">
                    <button
                      onClick={() => handleToggleStatus(service.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold border transition-colors ${
                        service.isOpen 
                          ? "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-500/20" 
                          : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                      }`}
                    >
                      <Power className="h-3 w-3" />
                      {service.isOpen ? "Tutup Layanan" : "Buka Layanan"}
                    </button>
                    
                    <a
                      href={`/aduan/${service.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-accent-orange hover:underline font-semibold"
                    >
                      Pratinjau Form
                      <LinkIcon className="h-3 w-3" />
                    </a>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE SERVICE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-secondary-panel rounded-lg border border-secondary-border p-6 shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 rounded text-secondary-text hover:text-zinc-100 hover:bg-primary-base"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider border-b border-secondary-border pb-3">
              Buat Layanan Aduan Baru
            </h3>

            <form onSubmit={handleCreateService} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Nama Layanan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Keluhan IT Support Utama"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    // auto generate slug
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-"));
                  }}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 focus:outline-none focus:border-accent-orange w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Slug URL (Subpath)</label>
                <div className="flex items-center text-xs bg-primary-base border border-secondary-border rounded p-2.5 text-zinc-500 font-mono focus-within:border-accent-orange">
                  <span>/aduan/</span>
                  <input
                    type="text"
                    required
                    placeholder="slug-url"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    className="bg-transparent text-xs text-zinc-100 focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Deskripsi Layanan</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan kepada pengadu tentang tujuan form aduan ini..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 focus:outline-none focus:border-accent-orange w-full resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-secondary-border/50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs border border-secondary-border text-secondary-text rounded hover:bg-primary-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs bg-accent-orange text-primary-base font-bold rounded hover:bg-accent-orange-hover disabled:bg-accent-orange/50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />}
                  Buat Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
}
