"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User as UserIcon, Mic, Loader2, Sparkles } from "lucide-react";

// Safari compatibility Type definitions
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AI_QUESTIONS = [
  "Hi! Tell me about yourself",
  "What do you do daily?",
  "Why do you want to improve English?"
];

type ChatMessage = {
  id: string;
  sender: "ai" | "user";
  text: string;
};

export default function ConversationalTest() {
  const router = useRouter();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Delayed Auth State
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [tempUserName, setTempUserName] = useState("");
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is already authenticated from a past session, but don't force it.
    // Starts the sequence.
    setIsTyping(true);
    setTimeout(() => {
      setMessages([{ id: "q0", sender: "ai", text: `Hi! Let's evaluate your English level. ${AI_QUESTIONS[0].replace("Hi! ", "")}` }]);
      setIsTyping(false);
    }, 1500);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, errorText, showAuthPopup]);

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

    const wordCount = inputValue.trim().split(/ +/).filter(w => w.length > 0).length;
    if (wordCount < 4) {
      setErrorText("Please write a meaningful English sentence (minimum 4 words).");
      return;
    }
    
    setErrorText(null);

    const userMsg: ChatMessage = { id: `u${currentQIndex}`, sender: "user", text: inputValue };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    const nextIdx = currentQIndex + 1;
    setCurrentQIndex(nextIdx);

    if (nextIdx < AI_QUESTIONS.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: `q${nextIdx}`, sender: "ai", text: AI_QUESTIONS[nextIdx] }]);
        setIsTyping(false);
      }, 1500);
    } else {
      // Finished all 3 questions. Trigger Delayed Auth popup!
      setTimeout(async () => {
        setMessages(prev => [...prev, { id: "analyzing", sender: "ai", text: "Excellent job! Generating your profile..." }]);
        setIsTyping(false);
        
        // Show Auth Popup
        setShowAuthPopup(true);
      }, 1000);
    }
  };

  const submitAuthAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUserName.trim().length < 2) return;

    localStorage.setItem("user_name", tempUserName.trim());
    setShowAuthPopup(false);
    setIsTyping(true); // AI indicator spins while the API is hit

    const fullHistory = messages.filter(m => m.id !== "analyzing"); 
    
    // We already committed the last userMsg to `messages` state, so we just use that plus the new name context.
    const chatCompile = fullHistory.map(m => `${m.sender === 'user' ? tempUserName.trim() : 'AI'}: ${m.text}`).join("\\n");
    
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatHistory: chatCompile }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.valid === false) {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: "error", sender: "ai", text: "I detected random input during our conversation. Please try again with valid English." }]);
        return;
      }

      localStorage.setItem("ai_plan", JSON.stringify(data));
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, { id: "error2", sender: "ai", text: "Failed to generate plan: " + err.message }]);
    }
  };

  return (
    <div className="h-screen bg-[#0F0F14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(108,92,231,0.05)_0,transparent_50%)] pointer-events-none" />

      {/* Delayed Auth Overlay */}
      <AnimatePresence>
        {showAuthPopup && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-[#1B1B29] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF]" />
              <div className="text-center mb-6 mt-2">
                <div className="w-12 h-12 mx-auto bg-[#00D4FF]/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-[#00D4FF]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Almost exactly right!</h3>
                <p className="text-white/60 text-sm">
                  Get your personalized English report and your Daily Plan! What should we call you?
                </p>
              </div>

              <form onSubmit={submitAuthAndGenerate} className="space-y-4">
                <Input 
                  autoFocus
                  placeholder="Your First Name" 
                  value={tempUserName}
                  onChange={e => setTempUserName(e.target.value)}
                  className="h-12 bg-black/50 border-white/10 text-center text-lg focus-visible:ring-[#00D4FF]/50" 
                />
                <Button 
                  type="submit" 
                  disabled={tempUserName.trim().length < 2}
                  className="w-full h-12 bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF] hover:opacity-90 font-bold text-md"
                >
                  See My Results
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-3xl h-[85vh] flex flex-col bg-black/40 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/5 rounded-t-3xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">AI English Coach</h2>
            <p className="text-xs text-[#00D4FF] uppercase tracking-widest font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" /> Active Test
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-start gap-4 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${
                  msg.sender === "ai" 
                    ? "bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.3)]" 
                    : "bg-white/10"
                }`}>
                  {msg.sender === "ai" ? <Bot className="w-4 h-4 text-white" /> : <UserIcon className="w-4 h-4 text-white/70" />}
                </div>

                <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] text-[15px] leading-relaxed ${
                  msg.sender === "ai" 
                    ? "bg-white/5 border border-white/10 text-white rounded-tl-sm" 
                    : "bg-[#6C5CE7] text-white rounded-tr-sm shadow-md"
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] shrink-0 flex items-center justify-center mt-1 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5 h-[50px]">
                  <span className="w-1.5 h-1.5 bg-[#6C5CE7] rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full animate-pulse delay-75" />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse delay-150" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-1 text-red-400 text-sm text-center pt-2">
             {errorText && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>⚠️ {errorText}</motion.span>}
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-black/40 border-t border-white/5 rounded-b-3xl mt-4">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isTyping || currentQIndex >= AI_QUESTIONS.length}
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
              onChange={e => { setInputValue(e.target.value); setErrorText(null); }}
              placeholder={isRecording ? "Listening..." : "Type or speak your answer..."}
              disabled={isTyping || currentQIndex >= AI_QUESTIONS.length}
              className="flex-1 h-14 bg-white/5 border-white/10 rounded-xl shadow-inner focus-visible:ring-1 focus-visible:ring-[#00D4FF]/50 text-[15px] placeholder:text-white/30 truncate pr-16"
            />
            
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isTyping || currentQIndex >= AI_QUESTIONS.length}
              className="absolute right-2 h-10 w-10 border-0 rounded-lg bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF] hover:opacity-90 transition-opacity p-0 disabled:opacity-50"
            >
              <Send className="w-4 h-4 ml-[-2px] text-white" />
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
