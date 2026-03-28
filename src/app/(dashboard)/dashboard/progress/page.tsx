"use client";

import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ProgressPage() {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"];
  const data = [20, 35, 30, 50, 65, 55, 80]; // Dummy percentage heights

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-6">Learning Analytics</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Fluency Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mt-4 flex items-end justify-between gap-2 border-l border-b border-white/10 pb-4 px-4 w-full">
                {data.map((val, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-blue-600/50 to-purple-500 rounded-t-md relative overflow-hidden transition-all group-hover:brightness-125 cursor-pointer"
                    >
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
                    <span className="text-xs text-white/50 mt-4 font-medium">{weeks[i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-indigo-900/40 to-black/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Strengths & Focus Areas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 mt-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">Vocabulary</span>
                  <span className="font-bold text-green-400">Excellent</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-green-500 rounded-full" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">Grammar</span>
                  <span className="font-bold text-blue-400">Good</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-blue-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">Pronunciation</span>
                  <span className="font-bold text-amber-400">Needs Work</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full w-[40%] bg-amber-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
