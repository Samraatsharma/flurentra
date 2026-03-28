"use client";

import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0F0F14] text-foreground font-sans">
      <div className="border-r border-white/5 bg-[#151520]/80 backdrop-blur-xl h-screen flex flex-col hidden md:flex sticky top-0 py-6">
        <Sidebar className="w-64" />
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Premium Dashboard Gradient background */}
        <div className="absolute top-0 right-0 w-[60vh] h-[60vh] bg-[#6C5CE7]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[50vh] h-[50vh] bg-[#00D4FF]/5 rounded-full blur-[150px] pointer-events-none" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
