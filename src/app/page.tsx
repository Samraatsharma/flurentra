"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0F14]">
      {/* Background gradients (Purple to Blue) */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(108,92,231,0.15)_0,rgba(15,15,20,1)_50%)] pointer-events-none" />
      <div className="absolute top-1/4 -right-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.12)_0,rgba(15,15,20,0)_50%)] pointer-events-none" />

      {/* Floating 3D Elements (Parallax) */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-40 left-20 w-72 h-72 bg-[#6C5CE7]/20 rounded-full blur-[100px]"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-[#00D4FF]/20 rounded-full blur-[120px]"
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#00D4FF]" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF]">
            Flurentra
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/test" className="px-5 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all backdrop-blur-md">
            Start Speaking
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
          <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Next-Generation Voice AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold max-w-5xl tracking-tight mb-8 leading-tight"
        >
          Talk and Test Your English <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF]">with AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed"
        >
          Stop using generic courses. Discover your exact fluency level instantly and let AI generate a fully personalized daily learning plan mapped directly to your weaknesses.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/test" className="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-white bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF] rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(108,92,231,0.4)] active:scale-95">
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
            <span className="relative flex items-center gap-3">
              Start Speaking
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
