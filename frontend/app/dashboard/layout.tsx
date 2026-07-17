"use client";

import { useState } from "react";
import Headbar from "@/components/dashboard/Headbar";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-primary-base">
      {/* Sticky Headbar at the top */}
      <Headbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 relative">
        {/* Sticky Sidebar on the left */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 w-full p-4 sm:p-6 md:p-8 overflow-y-auto bg-primary-base">
          {children}
        </main>
      </div>
    </div>
  );
}
