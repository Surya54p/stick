"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface WorkspaceSwitcherProps {
  workspaceSlug: string;
  workspaceName: string;
  currentWorkspaceType: "Pribadi" | "Private" | "Publik";
  workspaces: any[];
  onWorkspaceSelect: (ws: any) => void;
}

export default function WorkspaceSwitcher({
  workspaceSlug,
  workspaceName,
  currentWorkspaceType,
  workspaces,
  onWorkspaceSelect
}: WorkspaceSwitcherProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClose = () => setIsDropdownOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isDropdownOpen]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-base border border-secondary-border text-[11px] font-semibold text-zinc-300 hover:border-zinc-700 transition-colors focus:outline-none"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${
          currentWorkspaceType === "Pribadi" ? "bg-blue-500" :
          currentWorkspaceType === "Publik" ? "bg-emerald-500" :
          "bg-amber-500"
        }`} />
        <span className="font-mono">{workspaceName || workspaceSlug}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
      </button>

      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-md border border-secondary-border bg-secondary-panel shadow-lg z-50 py-1">
          <div className="px-3 py-1.5 border-b border-secondary-border/50 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Pilih Workspace
          </div>
          <div className="max-h-60 overflow-y-auto">
            {workspaces.map((ws) => {
              const type = ws.slug === "tech-support-acme" ? "Private" :
                           ws.slug === "operations-team" ? "Pribadi" :
                           ws.role === "Admin" ? "Private" : "Publik";
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    onWorkspaceSelect(ws);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-primary-base/50 transition-colors ${
                    workspaceSlug === ws.slug ? "bg-primary-base/80 border-l-2 border-accent-orange text-accent-orange" : "text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{ws.name}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                      type === "Pribadi" ? "text-blue-500 bg-blue-500/10 border-blue-500/20" :
                      type === "Publik" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                      "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {type}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{ws.slug}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
