"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Target, Flag, Sparkles, Zap, ShieldAlert, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AIPlan {
  level: string;
  weaknesses: string[];
  daily_plan: { day: number; focus: string }[];
  advice: string;
  confidence_score?: number;
}

export default function DashboardOverview() {
  const router = useRouter();
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("user_name");
    if (savedName) setUserName(savedName);

    const saved = localStorage.getItem("ai_plan");
    if (saved) {
      try {
        setPlan(JSON.parse(saved));
      } catch (e) {
        console.error("Invalid plan data", e);
      }
    } else {
      router.push("/test");
    }
  }, [router]);

  if (!plan) return <div className="p-8 text-white/50 animate-pulse">Loading securely generated AI plan...</div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        
        {/* Personal Greeting Header */}
        <div className="mb-2">
           <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
             Hi {userName || "there"} 👋
           </h1>
           <p className="text-lg text-white/60">Let’s improve your English today.</p>
        </div>

        {/* Header Section / Stats */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gradient-to-r from-[#6C5CE7]/10 to-transparent p-6 rounded-3xl border border-[#6C5CE7]/20">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#00D4FF]" />
              <span className="text-sm font-bold tracking-widest uppercase text-[#00D4FF]">Analysis Complete</span>
            </div>
            <p className="text-white/60 max-w-xl text-sm leading-relaxed">
              Based on your conversational structure, coherence, and vocabulary, your personal AI profile has been generated.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-8 shrink-0">
            <div className="text-right">
              <p className="text-sm text-white/50 mb-1 uppercase tracking-widest flex justify-end items-center gap-1.5">
                Calculated Level
              </p>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#00D4FF]">
                {plan.level}
              </div>
            </div>

            {plan.confidence_score !== undefined && (
              <div className="text-right border-l border-white/10 pl-8">
                <p className="text-sm text-white/50 mb-1 uppercase tracking-widest flex justify-end items-center gap-1.5">
                  <Activity className="w-4 h-4 text-green-400" /> Confidence
                </p>
                <div className="text-3xl font-black text-white flex items-baseline justify-end gap-1">
                  {plan.confidence_score} <span className="text-sm text-white/40">/10</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Plan Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/5 bg-[#1B1B29]/60 backdrop-blur-md h-full">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="w-5 h-5 text-[#6C5CE7]" /> Daily Blueprint
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {plan.daily_plan.map((day, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="flex gap-4 group"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#6C5CE7]/20 border border-[#6C5CE7]/50 flex items-center justify-center text-xs font-bold text-[#6C5CE7] shadow-[0_0_10px_rgba(108,92,231,0.2)]">
                        {day.day}
                      </div>
                      {idx !== plan.daily_plan.length - 1 && (
                        <div className="w-px h-full bg-white/10 my-2 group-hover:bg-[#6C5CE7]/50 transition-colors" />
                      )}
                    </div>
                    <div className="pb-4 pt-1 flex-1">
                      <p className="text-white/90 font-medium leading-relaxed">{day.focus}</p>
                    </div>
                  </motion.div>
                ))}

                <Link href="/dashboard/practice" className="block mt-4">
                  <Button className="w-full h-14 bg-[#6C5CE7] hover:bg-[#5a4cc4] text-white border-0 shadow-[0_0_20px_rgba(108,92,231,0.3)] transition-all">
                     Start Coaching Session <Zap className="w-5 h-5 ml-2 text-amber-300" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Insights */}
          <div className="space-y-6">
            <Card className="border-red-500/20 bg-red-950/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400 text-lg">
                  <ShieldAlert className="w-5 h-5" /> Target Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/80 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-gradient-to-br from-[#1B1B29] to-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-amber-400">
                  <Flag className="w-5 h-5" /> AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[15px] text-white/80 italic leading-relaxed border-l-2 border-amber-500/50 pl-4 py-1">
                  "{plan.advice}"
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
