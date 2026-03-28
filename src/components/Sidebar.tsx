"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, LayoutDashboard, Sparkles, LogOut, TrendingUp, Zap } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "My AI Plan", icon: LayoutDashboard },
    { href: "/dashboard/training", label: "Live Training", icon: Zap },
    { href: "/dashboard/practice", label: "Practice Studio", icon: MessageSquare },
    { href: "/dashboard/progress", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="w-full h-full flex flex-col px-4">
      <Link href="/dashboard" className="flex items-center gap-2 mb-10 px-2 cursor-pointer mt-4">
        <Sparkles className="w-6 h-6 text-[#00D4FF]" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF]">
          Flurentra
        </span>
      </Link>

      <nav className="flex-1 space-y-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isActive ? "text-white bg-white/5 border border-white/10" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <link.icon className={`w-5 h-5 ${isActive ? "text-[#00D4FF]" : ""}`} />
              <span className="font-medium tracking-wide text-sm">{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-[#00D4FF] rounded-r-full shadow-[0_0_10px_rgba(0,212,255,0.5)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10 px-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#00D4FF] flex items-center justify-center font-bold text-white shadow-lg uppercase">
              {typeof window !== 'undefined' ? (localStorage.getItem('user_name')?.[0] || 'U') : 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">
                {typeof window !== 'undefined' ? (localStorage.getItem('user_name') || 'Learner') : 'Learner'}
              </p>
              <p className="text-[10px] uppercase text-[#00D4FF] tracking-widest font-bold">Pro Member</p>
            </div>
          </div>
          <Link href="/test">
            <LogOut className="w-4 h-4 text-white/40 hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
