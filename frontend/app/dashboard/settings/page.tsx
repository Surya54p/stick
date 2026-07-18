"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { 
  Settings, 
  Save, 
  Globe, 
  ShieldAlert, 
  Key, 
  Clipboard, 
  Check, 
  Users, 
  Plus, 
  UserX, 
  Shield, 
  X 
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Agent" | "Customer";
  status: "Active" | "Invited";
}

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Rian Adiputra", email: "rian@perusahaan.com", role: "Admin", status: "Active" },
  { id: "2", name: "Alex Harrison", email: "alex@perusahaan.com", role: "Agent", status: "Active" },
  { id: "3", name: "Sarah Connor", email: "sarah@perusahaan.com", role: "Agent", status: "Active" },
  { id: "4", name: "Budi Santoso", email: "budi@client.com", role: "Customer", status: "Active" },
  { id: "5", name: "Siti Rahma", email: "siti@client.com", role: "Customer", status: "Invited" }
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"umum" | "anggota" | "api" | "bahaya">("umum");
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Member & Invitation states
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Member["role"]>("Agent");

  const apiToken = "stk_live_58c973ea06b6d4fd27272a09090b";

  useEffect(() => {
    const ws = localStorage.getItem("current_workspace");
    if (ws) {
      const parsed = JSON.parse(ws);
      setCurrentWorkspace(parsed);
      setWorkspaceName(parsed.name);
      setWorkspaceSlug(parsed.slug);
      fetchMembersAndInvitations(parsed.slug);
    } else {
      router.push("/auth/login");
    }
  }, []);

  const fetchMembersAndInvitations = async (slug: string) => {
    setIsLoading(true);
    try {
      const activeMembers = await apiRequest(`/workspaces/${slug}/members`);
      const invites = await apiRequest(`/workspaces/${slug}/invitations`);
      
      const formattedInvites = invites.map((invite: any) => ({
        id: invite.id,
        name: invite.email.split("@")[0],
        email: invite.email,
        role: invite.role,
        status: invite.status // "Pending", "Accepted", "Expired"
      }));
      
      setMembers(activeMembers);
      setInvitations(formattedInvites);
    } catch (err: any) {
      console.error("Gagal memuat data anggota/undangan:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    setIsSaving(true);
    try {
      const updated = await apiRequest(`/workspaces/${currentWorkspace.slug}`, "PUT", {
        name: workspaceName,
        slug: workspaceSlug.toLowerCase().trim().replace(/\s+/g, "-")
      });
      
      const workspacesStr = localStorage.getItem("workspaces");
      if (workspacesStr) {
        const list = JSON.parse(workspacesStr);
        const updatedList = list.map((w: any) => w.slug === currentWorkspace.slug ? { ...w, name: updated.name, slug: updated.slug } : w);
        localStorage.setItem("workspaces", JSON.stringify(updatedList));
      }
      
      const newWs = { ...currentWorkspace, name: updated.name, slug: updated.slug };
      localStorage.setItem("current_workspace", JSON.stringify(newWs));
      setCurrentWorkspace(newWs);
      
      alert("Pengaturan workspace berhasil disimpan!");
      window.location.reload();
    } catch (err: any) {
      alert("Gagal menyimpan perubahan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentWorkspace) return;

    try {
      await apiRequest(`/workspaces/${currentWorkspace.slug}/invitations`, "POST", {
        email: inviteEmail,
        role: inviteRole
      });
      
      setInviteEmail("");
      setInviteRole("Agent");
      setIsInviteOpen(false);
      
      fetchMembersAndInvitations(currentWorkspace.slug);
      alert("Undangan sukses dikirim!");
    } catch (err: any) {
      alert("Gagal mengirim undangan: " + err.message);
    }
  };

  const handleRemoveMember = (id: string) => {
    alert("Untuk merubah keanggotaan pengguna silakan hubungi Administrator sistem.");
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace) return;
    if (confirm("APAKAH ANDA BENAR-BENAR YAKIN? Tindakan ini akan menghapus seluruh data tiket dan anggota workspace secara permanen!")) {
      try {
        await apiRequest(`/workspaces/${currentWorkspace.slug}`, "DELETE");
        
        const workspacesStr = localStorage.getItem("workspaces");
        if (workspacesStr) {
          const list = JSON.parse(workspacesStr);
          const updatedList = list.filter((w: any) => w.slug !== currentWorkspace.slug);
          localStorage.setItem("workspaces", JSON.stringify(updatedList));
          
          if (updatedList.length > 0) {
            localStorage.setItem("current_workspace", JSON.stringify(updatedList[0]));
            router.push("/dashboard");
            setTimeout(() => window.location.reload(), 100);
          } else {
            localStorage.removeItem("current_workspace");
            localStorage.removeItem("token");
            router.push("/auth/login");
          }
        } else {
          router.push("/auth/login");
        }
      } catch (err: any) {
        alert("Gagal menghapus workspace: " + err.message);
      }
    }
  };

  const menuItems = [
    { id: "umum", name: "Informasi Umum", icon: <Globe className="h-4 w-4" /> },
    { id: "anggota", name: "Anggota Tim", icon: <Users className="h-4 w-4" /> },
    { id: "api", name: "Keamanan & API", icon: <Key className="h-4 w-4" /> },
    { id: "bahaya", name: "Zona Bahaya", icon: <ShieldAlert className="h-4 w-4" /> }
  ] as const;

  return (
    <div className="flex flex-col gap-6 w-full text-left font-sans text-zinc-300">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-accent-orange" />
          Pengaturan Workspace
        </h1>
        <p className="text-xs text-secondary-text">
          Ubah konfigurasi, detail profil organisasi, dan preferensi workspace ticketing Anda.
        </p>
      </div>

      {/* Two Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Sidebar Navigation */}
        <div className="md:col-span-1 bg-secondary-panel rounded-lg border border-secondary-border p-2 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all duration-150 text-left ${
                  isActive 
                    ? "bg-primary-base border-l-2 border-accent-orange text-accent-orange" 
                    : item.id === "bahaya" 
                      ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/5" 
                      : "text-secondary-text hover:text-zinc-100 hover:bg-primary-base/50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Tab Panel Content */}
        <div className="md:col-span-3 flex flex-col gap-6">
          
          {/* TAB 1: INFORMASI UMUM */}
          {activeTab === "umum" && (
            <div className="bg-secondary-panel rounded-lg border border-secondary-border p-6 shadow-2xl animate-in fade-in-50 duration-150">
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-secondary-border/50 pb-3">
                  Informasi Umum
                </h3>

                {/* Workspace Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Nama Workspace</label>
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 focus:outline-none focus:border-accent-orange w-full"
                  />
                </div>

                {/* Subdomain Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Subdomain Workspace</label>
                  <div className="flex items-center text-xs bg-primary-base border border-secondary-border rounded p-2.5 text-zinc-400 font-mono focus-within:border-accent-orange">
                    <Globe className="h-4 w-4 text-zinc-600 mr-2 shrink-0" />
                    <input
                      type="text"
                      required
                      value={workspaceSlug}
                      onChange={(e) => setWorkspaceSlug(e.target.value)}
                      className="bg-transparent text-xs text-zinc-100 focus:outline-none w-full"
                    />
                    <span className="text-zinc-600 font-bold ml-1">.stick.co</span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="border-t border-secondary-border/50 pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-md shadow-accent-orange/10 transition-all duration-200 active:scale-[0.98]"
                  >
                    {isSaving ? (
                      <span className="w-4 h-4 border-2 border-primary-base border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: ANGGOTA TIM */}
          {activeTab === "anggota" && (
            <div className="bg-secondary-panel rounded-lg border border-secondary-border p-6 shadow-2xl animate-in fade-in-50 duration-150 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-secondary-border/50 pb-4">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                    Anggota Tim & Pengguna
                  </h3>
                  <p className="text-[11px] text-secondary-text">
                    Kelola akses, peran, dan undangan untuk agen dan pelanggan di workspace Anda.
                  </p>
                </div>
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded shadow transition-all duration-200 active:scale-[0.98] self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  Undang Anggota
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-secondary-border/50 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="pb-3 px-2">Nama</th>
                      <th className="pb-3 px-2">Email</th>
                      <th className="pb-3 px-2 w-28">Peran</th>
                      <th className="pb-3 px-2 w-24">Status</th>
                      <th className="pb-3 px-2 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-border/50 text-xs">
                    {[
                      ...members.map(m => ({ ...m, status: "Active" })),
                      ...invitations.map(i => ({ ...i, status: i.status === "Pending" ? "Invited" : i.status }))
                    ].map(member => (
                      <tr key={member.id} className="hover:bg-primary-base/10 transition-all duration-150">
                        <td className="py-3 px-2 font-semibold text-zinc-100 flex items-center gap-2">
                          <div className="w-5.5 h-5.5 rounded bg-zinc-800 border border-secondary-border flex items-center justify-center text-[9px] text-zinc-400 font-bold">
                            {(member.name || "").substring(0, 1)}
                          </div>
                          {member.name}
                        </td>
                        <td className="py-3 px-2 text-secondary-text font-mono text-[11px]">
                          {member.email}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                            member.role === "Admin" ? "text-accent-orange" :
                            member.role === "Agent" ? "text-blue-400" :
                            "text-zinc-400"
                          }`}>
                            <Shield className="h-3 w-3" />
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                            member.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={member.role === "Admin"}
                              className="p-1 rounded bg-primary-base border border-secondary-border text-red-500/70 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Hapus Akses"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: KEAMANAN & TOKEN API */}
          {activeTab === "api" && (
            <div className="bg-secondary-panel rounded-lg border border-secondary-border p-6 shadow-2xl animate-in fade-in-50 duration-150">
              <div className="flex flex-col gap-5">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-secondary-border/50 pb-3">
                  Keamanan & Token API (Integrasi)
                </h3>

                {/* API Key Container */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Workspace API Secret Token</label>
                  <div className="flex items-center justify-between text-xs bg-primary-base border border-secondary-border rounded p-2.5 text-zinc-400 font-mono">
                    <div className="flex items-center overflow-x-auto select-all pr-2 col-span-1">
                      <Key className="h-4 w-4 text-zinc-600 mr-2 shrink-0" />
                      <span>{apiToken}</span>
                    </div>
                    <button
                      onClick={handleCopyToken}
                      className="p-1 rounded bg-secondary-panel hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors shrink-0"
                      title="Salin Token"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Gunakan token ini untuk menghubungkan form feedback di website eksternal Anda dengan database support stick.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ZONA BAHAYA */}
          {activeTab === "bahaya" && (
            <div className="bg-red-500/5 rounded-lg border border-red-500/20 p-6 flex flex-col gap-4 animate-in fade-in-50 duration-150">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5" />
                Zona Bahaya
              </h3>
              <p className="text-[11px] text-red-200/60 leading-relaxed text-left">
                Tindakan di zona ini bersifat permanen dan tidak dapat dibatalkan. Menghapus workspace akan menghapus seluruh data tiket, percakapan komentar, dan keanggotaan agen yang berafiliasi.
              </p>
              <div className="border-t border-red-500/10 pt-4 mt-2">
                <button
                  onClick={handleDeleteWorkspace}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-400 text-xs font-bold rounded transition-colors self-start"
                >
                  Hapus Workspace ini
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* INVITE MEMBER MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-secondary-panel rounded-lg border border-secondary-border p-6 shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-4 right-4 p-1 rounded text-secondary-text hover:text-zinc-100 hover:bg-primary-base"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider border-b border-secondary-border pb-3">
              Undang Anggota Tim
            </h3>

            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="indah@perusahaan.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-100 focus:outline-none focus:border-accent-orange w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300">Peran Akses</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Member["role"])}
                  className="bg-primary-base border border-secondary-border text-xs rounded p-2.5 text-zinc-200 focus:outline-none focus:border-accent-orange w-full cursor-pointer"
                >
                  <option value="Agent">Agent (Menyelesaikan tiket)</option>
                  <option value="Admin">Admin (Akses penuh)</option>
                  <option value="Customer">Customer (Hanya mengajukan tiket)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end border-t border-secondary-border/50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-xs border border-secondary-border text-secondary-text rounded hover:bg-primary-base"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-accent-orange text-primary-base font-bold rounded hover:bg-accent-orange-hover"
                >
                  Kirim Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
