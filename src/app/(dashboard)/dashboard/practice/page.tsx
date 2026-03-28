"use client";

import { useState, useRef, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, SpellCheck2, ArrowUpCircle, Info, Mic } from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type PracticeUIState = {
  original: string;
  corrected: string;
  improved: string;
  explanation: string;
};

export default function PracticePage() {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<PracticeUIState[]>([]);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isTyping]);

  useEffect(() => {
    // Initialization of SpeechRecognition safely
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputValue(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        alert("Your browser does not support Voice Recognition. Please use Chrome/Safari latest.");
        return;
      }
      setInputValue("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    const sentence = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setHistory(prev => [...prev, {
        original: sentence,
        corrected: data.corrected,
        improved: data.improved,
        explanation: data.explanation
      }]);
    } catch (err) {
      console.error(err);
      alert("Failed to reach Gemini AI. Check console.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <PageTransition>
      <div className="h-[calc(100vh-6rem)] flex flex-col bg-[#1B1B29]/40 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AI Practice Studio</h2>
            <p className="text-xs text-[#00D4FF] uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" /> Voice Active
            </p>
          </div>
        </div>

        {/* Play Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {history.length === 0 && !isTyping && (
             <div className="h-full flex flex-col items-center justify-center text-white/30 text-center space-y-4">
                <Mic className="w-16 h-16 opacity-50 mb-2" />
                <p className="max-w-md mx-auto text-lg text-white/60">
                  Speak or type any sentence below. The AI will instantly correct grammar and suggest native-sounding improvements.
                </p>
             </div>
          )}

          <AnimatePresence initial={false}>
            {history.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* User Input */}
                <div className="flex justify-end pr-4">
                   <div className="bg-[#6C5CE7] text-white px-5 py-3 rounded-2xl rounded-br-sm shadow-md max-w-lg text-[15px]">
                     {item.original}
                   </div>
                </div>

                {/* AI Review Card */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] shrink-0 flex items-center justify-center mt-2 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-black/40 border border-[#00D4FF]/20 rounded-2xl rounded-tl-sm p-5 space-y-4 w-full max-w-2xl">
                    
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-white/50 uppercase tracking-wider font-bold mb-1">
                        <SpellCheck2 className="w-3 h-3 text-green-400" /> Grammatically Correct
                      </div>
                      <p className="text-[15px] font-medium text-white">{item.corrected}</p>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-white/50 uppercase tracking-wider font-bold mb-1">
                        <ArrowUpCircle className="w-3 h-3 text-[#00D4FF]" /> Native Improvement
                      </div>
                      <p className="text-[15px] text-[#00D4FF] font-medium">{item.improved}</p>
                    </div>

                    <div className="bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 p-3 rounded-xl flex gap-3 items-start mt-2">
                      <Info className="w-4 h-4 text-[#6C5CE7] shrink-0 mt-0.5" />
                      <p className="text-sm text-white/70 leading-relaxed">{item.explanation}</p>
                    </div>

                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.3)] mt-2">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#6C5CE7] rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-[#00D4FF] rounded-full animate-pulse delay-75" />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-150" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-black/60 border-t border-white/5 rounded-b-3xl">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2">
            
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isTyping}
              className={`h-14 w-14 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                isRecording 
                  ? "bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              } disabled:opacity-50`}
            >
              <Mic className={`w-6 h-6 ${isRecording ? "scale-110" : ""}`} />
            </button>

            <Input 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Type or speak any sentence..."}
              disabled={isTyping}
              className="flex-1 h-14 bg-white/5 border-white/10 rounded-xl shadow-inner focus-visible:ring-1 focus-visible:ring-[#00D4FF]/50 text-[15px] placeholder:text-white/30 pr-16"
            />
            
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isTyping}
              className="absolute right-2 h-10 w-10 border-0 rounded-lg bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF] hover:opacity-90 transition-opacity p-0 disabled:opacity-50"
            >
              <Send className="w-4 h-4 ml-[-2px] text-white" />
            </Button>
            
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
