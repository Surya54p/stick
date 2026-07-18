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
  X
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PublicComplaintPage({ params }: PageProps) {
  const { slug } = use(params);
  
  const [service, setService] = useState<{ name: string; description: string; isOpen: boolean } | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

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
        isOpen: data.is_open
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
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !title.trim() || !description.trim() || attachmentError) return;

    setIsLoading(true);
    try {
      const res = await apiRequest(`/public/aduan-services/${slug}/submit`, "POST", {
        email,
        title,
        priority,
        description,
        attachment_base64: attachmentBase64
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
          
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="publicEmail" className="text-xs font-semibold text-zinc-300">
              Alamat Email Anda
            </label>
            <div className="relative flex items-center bg-primary-base border border-secondary-border rounded focus-within:border-accent-orange transition-colors">
              <Mail className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                id="publicEmail"
                type="email"
                required
                placeholder="nama@emailanda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Title input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="publicTitle" className="text-xs font-semibold text-zinc-300">
              Judul Kendala / Laporan
            </label>
            <div className="relative flex items-center bg-primary-base border border-secondary-border rounded focus-within:border-accent-orange transition-colors">
              <FileText className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                id="publicTitle"
                type="text"
                required
                placeholder="Ringkasan singkat keluhan..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Priority Select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="publicPriority" className="text-xs font-semibold text-zinc-300">
              Tingkat Urgensi Masalah
            </label>
            <select
              id="publicPriority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-200 focus:outline-none focus:border-accent-orange w-full cursor-pointer"
            >
              <option value="Low">Low — Hanya saran atau keluhan minor</option>
              <option value="Medium">Medium — Mengganggu kenyamanan pemakaian</option>
              <option value="High">High — Masalah besar, fitur tidak berfungsi</option>
              <option value="Urgent">Urgent — Layanan mati / tidak bisa login</option>
            </select>
          </div>

          {/* Description input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="publicDesc" className="text-xs font-semibold text-zinc-300">
              Kronologi & Detail Masalah
            </label>
            <textarea
              id="publicDesc"
              required
              rows={5}
              placeholder="Mohon jelaskan secara terperinci apa yang terjadi, apa pesan errornya, dan langkah kejadiannya agar kami dapat merespons secepat mungkin..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-accent-orange w-full resize-none"
            />
          </div>

          {/* Image Upload Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Lampiran Gambar (Opsional)
            </label>
            <div className="flex flex-col gap-2">
              {!attachmentBase64 ? (
                <label className="flex flex-col items-center justify-center border border-dashed border-secondary-border rounded-lg p-5 bg-primary-base/20 hover:bg-primary-base/40 hover:border-accent-orange/50 transition-all cursor-pointer text-center group">
                  <Upload className="h-6 w-6 text-zinc-500 group-hover:text-accent-orange transition-colors mb-2" />
                  <span className="text-xs text-zinc-300 font-semibold mb-0.5">Pilih Berkas Gambar</span>
                  <span className="text-[10px] text-zinc-600">PNG, JPG, atau JPEG (Maks. 2 MB)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-primary-base border border-secondary-border rounded-lg relative">
                  <div className="w-12 h-12 rounded border border-secondary-border bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={attachmentBase64} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0 mr-8 text-left">
                    <span className="text-xs font-semibold text-zinc-200 truncate">{attachmentName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Siap diunggah</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="absolute right-3 p-1 rounded bg-secondary-panel hover:bg-zinc-800 text-red-500 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {attachmentError && (
                <p className="text-[11px] font-medium text-red-500">{attachmentError}</p>
              )}
            </div>
          </div>

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
