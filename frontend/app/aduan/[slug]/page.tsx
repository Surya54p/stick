"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { 
  Ticket as TicketIcon, 
  Mail, 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  Upload,
  X,
  CheckSquare
} from "lucide-react";

interface FormField {
  id: string;
  label: string;
  type: "text" | "paragraph" | "dropdown" | "checkbox" | "file";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PublicComplaintPage({ params }: PageProps) {
  const { slug } = use(params);
  
  const [service, setService] = useState<{ 
    name: string; 
    description: string; 
    isOpen: boolean; 
    fieldsSchema: FormField[];
    requireLogin: boolean;
  } | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});

  // Image Upload states
  const [attachmentBase64, setAttachmentBase64] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAttachmentError("Ukuran file maksimal adalah 2 MB.");
      return;
    }

    // Validate type (png, jpeg, jpg)
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setAttachmentError("Format file harus PNG, JPEG, atau JPG.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentBase64(reader.result as string);
      setAttachmentName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachmentBase64(null);
    setAttachmentName(null);
    setAttachmentError(null);
  };

  const fetchServiceDetails = async () => {
    setIsLoadingDetails(true);
    try {
      const data = await apiRequest(`/public/aduan-services/${slug}`);
      setService({
        name: data.name,
        description: data.description || "Tidak ada deskripsi layanan.",
        isOpen: data.is_open,
        fieldsSchema: data.fields_schema || [],
        requireLogin: data.require_login || false
      });
    } catch (err: any) {
      if (err.message.includes("not found") || err.message.includes("404")) {
        setIsNotFound(true);
      } else {
        console.error("Gagal mengambil detail layanan:", err.message);
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();

    // Check authentication status on mount or slug change
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          setUserEmail(u.email || "");
          setEmail(u.email || ""); // Auto-fill the email state
        } catch (e) {
          console.error("Gagal parse data user:", e);
        }
      }
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const res = await apiRequest(`/public/aduan-services/${slug}/submit`, "POST", {
        custom_responses: Object.keys(customResponses).length > 0 ? customResponses : null
      });
      setIsSubmitted(true);
      setTicketId(`STK-${res.id.substring(0, 4).toUpperCase()}`);
    } catch (err: any) {
      alert("Gagal mengirim aduan: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Loading details screen
  if (isLoadingDetails) {
    return (
      <div className="min-h-screen bg-primary-base flex items-center justify-center px-4 font-sans text-zinc-300">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Memuat formulir pengaduan...</span>
        </div>
      </div>
    );
  }

  // 2. Not found screen
  if (isNotFound || !service) {
    return (
      <div className="min-h-screen bg-primary-base flex items-center justify-center px-4 font-sans text-zinc-300">
        <div className="w-full max-w-md bg-secondary-panel rounded-lg border border-red-500/20 p-8 shadow-2xl flex flex-col items-center gap-5 text-center">
          <div className="p-3 bg-red-500/10 rounded-full text-red-500 border border-red-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-zinc-100">Layanan Tidak Ditemukan</h2>
          <p className="text-xs text-secondary-text leading-relaxed">
            Maaf, formulir aduan publik dengan alamat ini tidak dapat ditemukan. Tautan mungkin salah atau layanan telah dihapus.
          </p>
          <Link 
            href="/"
            className="mt-2 w-full py-2.5 text-xs font-bold text-zinc-300 bg-primary-base hover:bg-zinc-950 border border-secondary-border rounded transition-all text-center"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 3. If service is closed, show warning banner
  if (!service.isOpen) {
    return (
      <div className="min-h-screen bg-primary-base flex items-center justify-center px-4 font-sans text-zinc-300">
        <div className="w-full max-w-md bg-secondary-panel rounded-lg border border-red-500/20 p-8 shadow-2xl flex flex-col items-center gap-5 text-center">
          <div className="p-3 bg-red-500/10 rounded-full text-red-500 border border-red-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-zinc-100">Layanan Aduan Ditutup</h2>
          <p className="text-xs text-secondary-text leading-relaxed">
            Maaf, layanan pengaduan untuk saluran **"{service.name}"** sedang ditutup sementara oleh administrator. Silakan kembali beberapa saat lagi.
          </p>
          <Link 
            href="/"
            className="mt-2 w-full py-2.5 text-xs font-bold text-zinc-300 bg-primary-base hover:bg-zinc-950 border border-secondary-border rounded transition-all text-center"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 4. Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-primary-base flex items-center justify-center px-4 font-sans text-zinc-300">
        <div className="w-full max-w-md bg-secondary-panel rounded-lg border border-secondary-border p-8 shadow-2xl flex flex-col items-center gap-5 text-center">
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500 border border-emerald-500/20 animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-zinc-100">Pengaduan Terkirim!</h2>
            <span className="text-[10px] font-mono text-accent-orange font-bold">TICKET ID: {ticketId}</span>
          </div>
          <p className="text-xs text-secondary-text leading-relaxed">
            Terima kasih atas laporan Anda. Tiket Anda telah didaftarkan ke sistem support kami. Email konfirmasi akan dikirimkan ke <code className="text-zinc-300">{email}</code> untuk koordinasi penyelesaian lebih lanjut.
          </p>
          {attachmentBase64 && (
            <div className="w-full border border-secondary-border rounded p-3 bg-primary-base/30 text-left flex flex-col gap-2 my-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Gambar Terlampir:</span>
              <div className="w-full max-h-48 rounded overflow-hidden border border-secondary-border bg-zinc-900 flex items-center justify-center">
                <img src={attachmentBase64} alt="Attached preview" className="max-w-full max-h-48 object-contain" />
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setIsSubmitted(false);
              setTitle("");
              setDescription("");
              setPriority("Medium");
              handleRemoveAttachment();
            }}
            className="mt-2 w-full py-3 px-4 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded transition-all"
          >
            Kirim Pengaduan Baru
          </button>
        </div>
      </div>
    );
  }

  // 4.5 If login is required and user is not logged in, show lock screen
  if (service.requireLogin && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-primary-base flex items-center justify-center px-4 font-sans text-zinc-300">
        <div className="w-full max-w-md bg-secondary-panel rounded-lg border border-amber-500/20 p-8 shadow-2xl flex flex-col items-center gap-6 text-center animate-fade-in">
          <div className="p-3.5 bg-amber-500/10 rounded-full text-amber-500 border border-amber-500/20 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-zinc-100">Identitas Pelapor Diperlukan</h2>
            <p className="text-xs text-secondary-text leading-relaxed">
              Layanan pengaduan untuk saluran <span className="text-zinc-200 font-semibold">"{service.name}"</span> mewajibkan Anda untuk masuk ke platform sebelum mengirim laporan.
            </p>
          </div>

          <div className="w-full border-t border-secondary-border/50 my-2 pt-4 flex flex-col gap-3">
            <Link 
              href={`/auth/login?redirect=/aduan/${slug}`}
              className="w-full py-3 px-4 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-accent-orange/10 hover:scale-[1.01] active:scale-[0.99]"
            >
              Masuk ke Akun
            </Link>
            <Link 
              href={`/auth/register?redirect=/aduan/${slug}`}
              className="w-full py-3 px-4 text-xs font-bold text-zinc-300 bg-primary-base hover:bg-zinc-950 border border-secondary-border rounded transition-all text-center hover:scale-[1.01] active:scale-[0.99]"
            >
              Daftar Akun Baru
            </Link>
          </div>

          <p className="text-[10px] text-zinc-500 leading-normal">
            Hal ini dilakukan untuk mempermudah Anda melacak status tindak lanjut aduan secara real-time.
          </p>
        </div>
      </div>
    );
  }

  // 5. Main submission form
  return (
    <div className="min-h-screen bg-primary-base flex items-center justify-center px-4 py-12 font-sans text-zinc-300">
      <div className="w-full max-w-lg bg-secondary-panel rounded-lg border border-secondary-border p-8 shadow-2xl flex flex-col gap-6 relative">
        
        {/* Branding header */}
        <div className="flex justify-between items-center border-b border-secondary-border/50 pb-4">
          <Link href="/" className="flex items-center gap-1.5 group">
            <div className="p-1 rounded bg-accent-orange text-primary-base">
              <TicketIcon className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="text-sm font-bold text-zinc-100">
              stick<span className="text-accent-orange font-bold">.</span>
            </span>
          </Link>
          <span className="text-[9px] text-zinc-500 font-mono">Form Pengaduan Publik</span>
        </div>

        {/* User login state indicator if logged in */}
        {isLoggedIn && userEmail && (
          <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 rounded px-3 py-2 text-[10px] text-emerald-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Masuk sebagai: <strong className="text-emerald-300 font-semibold">{userEmail}</strong></span>
            </div>
            <button 
              type="button" 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setIsLoggedIn(false);
                setUserEmail("");
                setEmail("");
              }}
              className="text-zinc-500 hover:text-red-400 underline transition-colors"
            >
              Keluar
            </button>
          </div>
        )}

        {/* Header Description */}
        <div className="flex flex-col gap-2 text-left">
          <h2 className="text-base font-bold text-zinc-100 leading-snug">
            {service.name}
          </h2>
          <p className="text-xs text-secondary-text leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          
          {/* Dynamic Custom Fields */}
          {service.fieldsSchema && service.fieldsSchema.length > 0 ? (
            service.fieldsSchema.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>

                {/* Text Input */}
                {field.type === "text" && (
                  <input
                    type="text"
                    required={field.required}
                    placeholder={field.placeholder || ""}
                    value={customResponses[field.id] || ""}
                    onChange={(e) => setCustomResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent-orange w-full"
                  />
                )}

                {/* Paragraph Input */}
                {field.type === "paragraph" && (
                  <textarea
                    required={field.required}
                    rows={4}
                    placeholder={field.placeholder || ""}
                    value={customResponses[field.id] || ""}
                    onChange={(e) => setCustomResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent-orange w-full resize-none"
                  />
                )}

                {/* Dropdown Input */}
                {field.type === "dropdown" && (
                  <select
                    required={field.required}
                    value={customResponses[field.id] || ""}
                    onChange={(e) => setCustomResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className={`bg-primary-base border border-secondary-border text-xs rounded p-2.5 focus:outline-none focus:border-accent-orange w-full cursor-pointer transition-colors ${
                      !(customResponses[field.id]) ? "text-zinc-500" : "text-zinc-200"
                    }`}
                  >
                    <option value="" disabled hidden>{field.placeholder || "Pilih salah satu..."}</option>
                    {(field.options || []).map((opt, i) => (
                      <option key={i} value={opt} className="text-zinc-200 bg-zinc-950">{opt}</option>
                    ))}
                  </select>
                )}

                {/* Checkbox Input */}
                {field.type === "checkbox" && (
                  <div className="flex flex-col gap-2">
                    {(field.options || []).map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(customResponses[field.id] || []).includes(opt)}
                          onChange={(e) => {
                            const current = customResponses[field.id] || [];
                            const updated = e.target.checked
                              ? [...current, opt]
                              : current.filter((v: string) => v !== opt);
                            setCustomResponses(prev => ({ ...prev, [field.id]: updated }));
                          }}
                          className="accent-accent-orange w-3.5 h-3.5 cursor-pointer"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* File Upload Input */}
                {field.type === "file" && (
                  <div className="flex flex-col gap-2">
                    {!customResponses[field.id] ? (
                      <label className="flex flex-col items-center justify-center border border-dashed border-secondary-border rounded-lg p-4 bg-primary-base/20 hover:bg-primary-base/40 hover:border-accent-orange/50 transition-all cursor-pointer text-center group">
                        <Upload className="h-5 w-5 text-zinc-500 group-hover:text-accent-orange transition-colors mb-1" />
                        <span className="text-[10px] text-zinc-400 font-semibold">Pilih Berkas Gambar</span>
                        <span className="text-[9px] text-zinc-600">PNG, JPG, atau JPEG (Maks. 2 MB)</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) { alert("Ukuran file maksimal adalah 2 MB."); return; }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setCustomResponses(prev => ({ ...prev, [field.id]: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-2 bg-primary-base border border-secondary-border rounded-lg relative">
                        <div className="w-10 h-10 rounded border border-secondary-border bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={customResponses[field.id]} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">Gambar terlampir</span>
                        <button
                          type="button"
                          onClick={() => setCustomResponses(prev => { const next = { ...prev }; delete next[field.id]; return next; })}
                          className="absolute right-2 p-1 rounded hover:bg-zinc-800 text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500 gap-2">
              <FileText className="h-6 w-6 text-zinc-600" />
              <span className="text-xs font-semibold text-zinc-400">Formulir belum dikonfigurasi</span>
              <span className="text-[10px] text-zinc-600">Administrator belum menambahkan pertanyaan pada layanan ini.</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover disabled:bg-accent-orange/50 disabled:cursor-not-allowed rounded transition-all duration-200 shadow-lg shadow-accent-orange/10 active:scale-[0.99] flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Kirim Laporan Pengaduan
              </>
            )}
          </button>
        </form>

        {/* Footer branding note */}
        <div className="text-center text-[10px] text-zinc-600 pt-2 border-t border-secondary-border/50">
          Layanan aduan ini diselenggarakan secara resmi via platform{" "}
          <Link href="/" className="font-semibold text-zinc-500 hover:text-accent-orange underline">
            stick. Simple Ticketing
          </Link>
        </div>

      </div>
    </div>
  );
}
