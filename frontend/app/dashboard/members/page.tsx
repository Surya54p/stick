"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MembersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/settings");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-secondary-text gap-3 font-sans">
      <span className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
      <span className="text-xs">Mengalihkan ke Pengaturan Workspace...</span>
    </div>
  );
}
