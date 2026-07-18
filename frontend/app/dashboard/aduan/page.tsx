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
  FileText,
  GripVertical,
  Type,
  AlignLeft,
  CheckSquare,
  Image,
  MoreVertical,
  Edit
} from "lucide-react";

interface FormField {
  id: string;
  label: string;
  type: "text" | "paragraph" | "dropdown" | "checkbox" | "file";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface ComplaintService {
  id: string;
  name: string;
  slug: string;
  description: string;
  isOpen: boolean;
  complaintCount: number;
  fieldsSchema: FormField[];
  requireLogin: boolean;
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
  const [newRequireLogin, setNewRequireLogin] = useState(false);

  // Edit Service Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingService, setEditingService] = useState<ComplaintService | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editRequireLogin, setEditRequireLogin] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Active Card Menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form Builder Modal State
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isSavingFields, setIsSavingFields] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);
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
        complaintCount: item.complaint_count || 0,
        fieldsSchema: item.fields_schema || [],
        requireLogin: item.require_login || false
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
        description: newDesc,
        require_login: newRequireLogin
      });

      const newService: ComplaintService = {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: created.description || "",
        isOpen: created.is_open,
        complaintCount: 0,
        fieldsSchema: created.fields_schema || [],
        requireLogin: created.require_login || false
      };

      setServices([...services, newService]);
      setNewName("");
      setNewSlug("");
      setNewDesc("");
      setNewRequireLogin(false);
      setIsCreateOpen(false);
    } catch (err: any) {
      alert("Gagal membuat layanan aduan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Builder Functions
  const handleOpenFormBuilder = (service: ComplaintService) => {
    setEditingServiceId(service.id);
    setFormFields(service.fieldsSchema ? [...service.fieldsSchema] : []);
    setIsFormBuilderOpen(true);
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "",
      type: "text",
      required: false,
      placeholder: "",
      options: []
    };
    setFormFields([...formFields, newField]);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const handleRemoveField = (fieldId: string) => {
    setFormFields(formFields.filter(f => f.id !== fieldId));
  };

  const handleAddOption = (fieldId: string) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId) {
        return { ...f, options: [...(f.options || []), ""] };
      }
      return f;
    }));
  };

  const handleUpdateOption = (fieldId: string, index: number, value: string) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId) {
        const newOpts = [...(f.options || [])];
        newOpts[index] = value;
        return { ...f, options: newOpts };
      }
      return f;
    }));
  };

  const handleRemoveOption = (fieldId: string, index: number) => {
    setFormFields(formFields.map(f => {
      if (f.id === fieldId) {
        const newOpts = [...(f.options || [])];
        newOpts.splice(index, 1);
        return { ...f, options: newOpts };
      }
      return f;
    }));
  };

  const handleSaveFormFields = async () => {
    if (!currentWorkspace || !editingServiceId) return;

    const hasEmptyLabel = formFields.some(field => !field.label.trim());
    if (hasEmptyLabel) {
      alert("Semua teks pertanyaan wajib diisi sebelum menyimpan formulir!");
      return;
    }

    setIsSavingFields(true);
    try {
      await apiRequest(`/workspaces/${currentWorkspace.slug}/aduan-services/${editingServiceId}`, "PUT", {
        fields_schema: formFields
      });
      setServices(services.map(s => s.id === editingServiceId ? { ...s, fieldsSchema: formFields } : s));
      setIsFormBuilderOpen(false);
      setEditingServiceId(null);
    } catch (err: any) {
      alert("Gagal menyimpan skema formulir: " + err.message);
    } finally {
      setIsSavingFields(false);
    }
  };

  const handleDragStartField = (e: React.DragEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.tagName === "BUTTON") {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/field-id", id);
    setDraggedFieldId(id);
  };

  const handleDragOverField = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedFieldId && draggedFieldId !== id) {
      setDragOverFieldId(id);
    }
  };

  const handleDragLeaveField = () => {
    setDragOverFieldId(null);
  };

  const handleDropField = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/field-id") || draggedFieldId;
    if (sourceId && sourceId !== targetId) {
      setFormFields(prev => {
        const sourceIdx = prev.findIndex(f => f.id === sourceId);
        const targetIdx = prev.findIndex(f => f.id === targetId);
        if (sourceIdx !== -1 && targetIdx !== -1) {
          const result = [...prev];
          const [removed] = result.splice(sourceIdx, 1);
          result.splice(targetIdx, 0, removed);
          return result;
        }
        return prev;
      });
    }
    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  const handleOpenEdit = (service: ComplaintService) => {
    setEditingService(service);
    setEditName(service.name);
    setEditSlug(service.slug);
    setEditDesc(service.description);
    setEditRequireLogin(service.requireLogin || false);
    setIsEditOpen(true);
    setActiveMenuId(null);
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editSlug.trim() || !currentWorkspace || !editingService) return;

    setIsSubmittingEdit(true);
    try {
      const updated = await apiRequest(`/workspaces/${currentWorkspace.slug}/aduan-services/${editingService.id}`, "PUT", {
        name: editName,
        slug: editSlug.toLowerCase().trim().replace(/\s+/g, "-"),
        description: editDesc,
        require_login: editRequireLogin
      });

      setServices(services.map(s => s.id === editingService.id ? {
        ...s,
        name: updated.name,
        slug: updated.slug,
        description: updated.description || "",
        requireLogin: updated.require_login || false
      } : s));

      setIsEditOpen(false);
      setEditingService(null);
    } catch (err: any) {
      alert("Gagal memperbarui layanan aduan: " + err.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const getFieldTypeLabel = (type: FormField["type"]) => {
    switch (type) {
      case "text": return "Teks Singkat";
      case "paragraph": return "Teks Panjang";
      case "dropdown": return "Pilihan Dropdown";
      case "checkbox": return "Kotak Centang";
      case "file": return "Unggah Gambar";
      default: return type;
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
                    
                    <div className="flex items-center gap-1.5 shrink-0 relative">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                        service.isOpen 
                          ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                          : "text-red-500 bg-red-500/10 border-red-500/20"
                      }`}>
                        {service.isOpen ? "BUKA" : "TUTUP"}
                      </span>

                      {service.requireLogin && (
                        <span 
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border border-amber-500/20 text-amber-500 bg-amber-500/10"
                          title="Mewajibkan pelapor masuk / login"
                        >
                         WAJIB LOGIN
                        </span>
                      )}
                      
                      {/* Hamburger Settings Button */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === service.id ? null : service.id)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                          title="Setelan Layanan"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {activeMenuId === service.id && (
                          <>
                            {/* Backdrop to close menu */}
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1.5 w-36 bg-zinc-900 border border-secondary-border rounded shadow-xl z-50 py-1 text-left font-sans text-xs">
                              <button
                                onClick={() => handleOpenEdit(service)}
                                className="w-full text-left px-3 py-2 hover:bg-primary-base/50 text-zinc-300 hover:text-zinc-100 flex items-center gap-2"
                              >
                                <Edit className="h-3.5 w-3.5 text-zinc-500" />
                                Edit Layanan
                              </button>
                              <button
                                onClick={() => {
                                  handleOpenFormBuilder(service);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-primary-base/50 text-zinc-300 hover:text-zinc-100 flex items-center gap-2"
                              >
                                <FileText className="h-3.5 w-3.5 text-zinc-500" />
                                Kelola Form
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
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

            <div>
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Buat Layanan Aduan Baru
              </h3>
              <p className="text-[11px] text-secondary-text leading-relaxed mt-1.5 border-b border-secondary-border pb-3">
                Buat saluran aduan baru. Nama layanan hanya diperbolehkan mengandung huruf, angka, spasi, serta simbol tanda hubung (-) dan garis bawah (_).
              </p>
            </div>

            <form onSubmit={handleCreateService} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Nama Layanan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Keluhan IT Support Utama"
                  value={newName}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cleanedName = val.replace(/[^a-zA-Z0-9\s\-_]/g, "");
                    setNewName(cleanedName);
                    // auto generate slug (convert spaces/underscores to hyphens)
                    setNewSlug(cleanedName.toLowerCase().replace(/[\s_]+/g, "-").replace(/-+/g, "-"));
                  }}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 focus:outline-none focus:border-accent-orange w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5 opacity-60 cursor-not-allowed select-none">
                <label className="text-xs font-semibold text-zinc-400">Slug URL (Subpath)</label>
                <div className="flex items-center text-xs bg-zinc-900 border border-secondary-border/50 rounded p-2.5 text-zinc-600 font-mono">
                  <span>/aduan/</span>
                  <input
                    type="text"
                    disabled
                    value={newSlug}
                    placeholder="slug-url"
                    className="bg-transparent text-xs text-zinc-500 focus:outline-none w-full cursor-not-allowed"
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

              {/* Require Login Checkbox */}
              <label className="flex items-center gap-2 py-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newRequireLogin}
                  onChange={(e) => setNewRequireLogin(e.target.checked)}
                  className="accent-accent-orange h-4 w-4 rounded border-secondary-border text-accent-orange focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-zinc-300">Wajibkan identitas pelapor (harus login/buat akun)</span>
              </label>

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

      {/* EDIT SERVICE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-secondary-panel rounded-lg border border-secondary-border p-6 shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => { setIsEditOpen(false); setEditingService(null); }}
              className="absolute top-4 right-4 p-1 rounded text-secondary-text hover:text-zinc-100 hover:bg-primary-base"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider border-b border-secondary-border pb-3">
              Edit Layanan Aduan
            </h3>

            <form onSubmit={handleUpdateService} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Nama Layanan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Keluhan IT Support Utama"
                  value={editName}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cleanedName = val.replace(/[^a-zA-Z0-9\s\-_]/g, "");
                    setEditName(cleanedName);
                    // auto generate slug (convert spaces/underscores to hyphens)
                    setEditSlug(cleanedName.toLowerCase().replace(/[\s_]+/g, "-").replace(/-+/g, "-"));
                  }}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 focus:outline-none focus:border-accent-orange w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5 opacity-60 cursor-not-allowed">
                <label className="text-xs font-semibold text-zinc-400">Slug URL (Subpath)</label>
                <div className="flex items-center text-xs bg-zinc-900 border border-secondary-border/50 rounded p-2.5 text-zinc-600 font-mono">
                  <span>/aduan/</span>
                  <input
                    type="text"
                    disabled
                    value={editSlug}
                    className="bg-transparent text-xs text-zinc-500 focus:outline-none w-full cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Deskripsi Layanan</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan kepada pengadu tentang tujuan form aduan ini..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 focus:outline-none focus:border-accent-orange w-full resize-none"
                />
              </div>

              {/* Require Login Checkbox */}
              <label className="flex items-center gap-2 py-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editRequireLogin}
                  onChange={(e) => setEditRequireLogin(e.target.checked)}
                  className="accent-accent-orange h-4 w-4 rounded border-secondary-border text-accent-orange focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-zinc-300">Wajibkan identitas pelapor (harus login/buat akun)</span>
              </label>

              <div className="flex gap-3 justify-end border-t border-secondary-border/50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setEditingService(null); }}
                  className="px-4 py-2 text-xs border border-secondary-border text-secondary-text rounded hover:bg-primary-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 text-xs bg-accent-orange text-primary-base font-bold rounded hover:bg-accent-orange-hover disabled:bg-accent-orange/50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmittingEdit && <span className="w-3.5 h-3.5 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FORM BUILDER MODAL */}
      {isFormBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] bg-secondary-panel rounded-lg border border-secondary-border shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-border shrink-0">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Pembangun Formulir Kustom</h3>
                <p className="text-[10px] text-zinc-500">Rancang pertanyaan dan input yang akan tampil pada form pengaduan publik.</p>
              </div>
              <button
                onClick={() => { setIsFormBuilderOpen(false); setEditingServiceId(null); }}
                className="p-1 rounded text-secondary-text hover:text-zinc-100 hover:bg-primary-base"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Fields List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {formFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
                  <FileText className="h-8 w-8 text-zinc-600" />
                  <span className="text-xs font-semibold">Belum ada pertanyaan kustom</span>
                  <span className="text-[10px] text-zinc-600">Form hanya akan menampilkan field bawaan (Email, Judul, Prioritas, Deskripsi).</span>
                </div>
              ) : (
                formFields.map((field, idx) => (
                  <div 
                    key={field.id} 
                    draggable
                    onDragStart={(e) => handleDragStartField(e, field.id)}
                    onDragOver={(e) => handleDragOverField(e, field.id)}
                    onDragLeave={handleDragLeaveField}
                    onDrop={(e) => handleDropField(e, field.id)}
                    className={`bg-primary-base border rounded-lg p-4 flex flex-col gap-3 relative group transition-all duration-150 ${
                      dragOverFieldId === field.id ? "border-accent-orange border-t-4 pt-3" : "border-secondary-border"
                    } ${draggedFieldId === field.id ? "opacity-40" : ""}`}
                  >
                    {/* Field Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <GripVertical className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors cursor-grab" />
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-800 text-zinc-500 text-[10px] font-bold font-mono">
                          {idx + 1}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                        placeholder="Tuliskan pertanyaan di sini..."
                        className="flex-1 bg-transparent text-sm font-semibold text-zinc-100 placeholder-zinc-600 focus:outline-none border-b border-transparent focus:border-accent-orange pb-1 transition-colors"
                      />
                      <button
                        onClick={() => handleRemoveField(field.id)}
                        className="p-1 rounded text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Hapus pertanyaan"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Field Config Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        value={field.type}
                        onChange={(e) => handleUpdateField(field.id, { type: e.target.value as FormField["type"], options: (e.target.value === "dropdown" || e.target.value === "checkbox") ? (field.options?.length ? field.options : [""]) : [] })}
                        className="bg-zinc-800 border border-secondary-border text-[11px] rounded px-2 py-1.5 text-zinc-200 focus:outline-none focus:border-accent-orange cursor-pointer"
                      >
                        <option value="text">📝 Teks Singkat</option>
                        <option value="paragraph">📄 Teks Panjang</option>
                        <option value="dropdown">📋 Pilihan Dropdown</option>
                        <option value="checkbox">☑️ Kotak Centang</option>
                        <option value="file">📎 Unggah Gambar</option>
                      </select>

                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder (opsional)"
                        className="flex-1 min-w-[120px] bg-zinc-800 border border-secondary-border text-[11px] rounded px-2 py-1.5 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-accent-orange"
                      />

                      <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                          className="accent-accent-orange w-3.5 h-3.5 cursor-pointer"
                        />
                        Wajib
                      </label>
                    </div>

                    {/* Options (for dropdown/checkbox) */}
                    {(field.type === "dropdown" || field.type === "checkbox") && (
                      <div className="flex flex-col gap-2 pl-9">
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Daftar Opsi:</span>
                        {(field.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-600 font-mono w-4 text-right shrink-0">{optIdx + 1}.</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(field.id, optIdx, e.target.value)}
                              placeholder={`Opsi ${optIdx + 1}`}
                              className="flex-1 bg-zinc-800 border border-secondary-border text-[11px] rounded px-2 py-1 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-accent-orange"
                            />
                            <button
                              onClick={() => handleRemoveOption(field.id, optIdx)}
                              className="p-0.5 text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => handleAddOption(field.id)}
                          className="self-start text-[10px] text-accent-orange hover:text-accent-orange-hover font-semibold flex items-center gap-1 mt-0.5"
                        >
                          <Plus className="h-3 w-3" />
                          Tambah Opsi
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-secondary-border shrink-0">
              <button
                onClick={handleAddField}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-accent-orange bg-accent-orange/10 border border-accent-orange/20 rounded hover:bg-accent-orange/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Pertanyaan
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsFormBuilderOpen(false); setEditingServiceId(null); }}
                  className="px-4 py-2 text-xs border border-secondary-border text-secondary-text rounded hover:bg-primary-base transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveFormFields}
                  disabled={isSavingFields}
                  className="px-4 py-2 text-xs bg-accent-orange text-primary-base font-bold rounded hover:bg-accent-orange-hover disabled:bg-accent-orange/50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  {isSavingFields && <span className="w-3.5 h-3.5 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />}
                  Simpan Formulir
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
}
