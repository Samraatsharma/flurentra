"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Bot } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
};

export default function TrainingPage() {
  const [userName, setUserName] = useState("there");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<Message[]>([]);

  useEffect(() => {
    const name = localStorage.getItem("user_name") || "there";
    setUserName(name);

    // Setup TTS
    synthRef.current = window.speechSynthesis;

    // Setup Speech Recognition
    const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechAPI) {
      const recognition = new SpeechAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join("");
        setLiveTranscript(transcript);
        if (event.results[0].isFinal) {
          setLiveTranscript("");
          handleUserSpeech(transcript.trim());
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      synthRef.current?.cancel();
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    historyRef.current = messages;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Prefer a natural-sounding voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Samantha") ||
      v.name.includes("Karen") ||
      v.name.includes("Moira") ||
      v.name.includes("Female") ||
      (v.lang === "en-US" && v.localService)
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const addMessage = useCallback((role: "user" | "ai", text: string) => {
    const msg: Message = { id: `${role}-${Date.now()}`, role, text };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const callTeacher = useCallback(async (userText: string) => {
    setIsThinking(true);
    try {
      const res = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: historyRef.current.map(m => ({ role: m.role, text: m.text })),
          userName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addMessage("ai", data.reply);
      speak(data.reply);
    } catch (err) {
      const errMsg = "Sorry, I had a connection issue. Please try again!";
      addMessage("ai", errMsg);
      speak(errMsg);
    } finally {
      setIsThinking(false);
    }
  }, [userName, addMessage, speak]);

  const handleUserSpeech = useCallback((text: string) => {
    if (!text || text.length < 2) return;
    addMessage("user", text);
    callTeacher(text);
  }, [addMessage, callTeacher]);

  const startSession = useCallback(async () => {
    setSessionStarted(true);
    const greeting = `Hi ${userName}! I'm Aria, your personal English coach. Let's practice speaking together. To start — tell me your name and where you're from.`;
    addMessage("ai", greeting);
    speak(greeting);
  }, [userName, addMessage, speak]);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition not supported. Use Chrome or Safari.");
        return;
      }
      synthRef.current?.cancel();
      setIsSpeaking(false);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // already started
      }
    }
  };

  return (
    <PageTransition>
      <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">

        {/* Top Header */}
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-2xl font-black text-white">Live Training Session</h1>
            <p className="text-white/40 text-sm">AI Teacher Aria • Voice + Text</p>
          </div>
          <button
            onClick={() => { setVoiceEnabled(v => !v); synthRef.current?.cancel(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm text-white/70"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-[#00D4FF]" /> : <VolumeX className="w-4 h-4 text-white/30" />}
            {voiceEnabled ? "Voice ON" : "Voice OFF"}
          </button>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">

          {/* LEFT: Avatar Panel */}
          <div className="hidden lg:flex w-72 flex-col items-center justify-center bg-black/30 border border-white/5 rounded-3xl backdrop-blur-xl p-6 relative overflow-hidden">

            {/* Background glow */}
            <motion.div
              animate={{ scale: isSpeaking ? [1, 1.3, 1] : [1, 1.05, 1], opacity: isSpeaking ? [0.3, 0.6, 0.3] : [0.1, 0.2, 0.1] }}
              transition={{ duration: isSpeaking ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-48 h-48 rounded-full bg-[#6C5CE7]/30 blur-[60px]"
            />
            <motion.div
              animate={{ scale: isSpeaking ? [1, 1.2, 1] : 1, opacity: isSpeaking ? [0.2, 0.5, 0.2] : 0.1 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-32 h-32 rounded-full bg-[#00D4FF]/20 blur-[40px]"
            />

            {/* Avatar Circle */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                scale: isSpeaking ? [1, 1.04, 1] : [1, 1.01, 1],
              }}
              transition={{ duration: isSpeaking ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              {/* Outer ring — pulsing glow */}
              <motion.div
                animate={{
                  boxShadow: isSpeaking
                    ? ["0 0 20px rgba(0,212,255,0.4)", "0 0 50px rgba(108,92,231,0.8)", "0 0 20px rgba(0,212,255,0.4)"]
                    : ["0 0 10px rgba(108,92,231,0.2)", "0 0 20px rgba(108,92,231,0.3)", "0 0 10px rgba(108,92,231,0.2)"]
                }}
                transition={{ duration: isSpeaking ? 0.6 : 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-36 h-36 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] flex items-center justify-center"
              >
                <div className="w-32 h-32 rounded-full bg-[#0F0F14] flex items-center justify-center">
                  <motion.div
                    animate={{ scale: isSpeaking ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6C5CE7]/80 to-[#00D4FF]/80 flex items-center justify-center shadow-2xl"
                  >
                    <Bot className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Name + Status */}
            <div className="relative z-10 text-center mt-6">
              <p className="font-bold text-white text-lg">Aria</p>
              <p className="text-xs text-white/40 tracking-widest uppercase mb-3">AI English Coach</p>
              <AnimatePresence mode="wait">
                {isSpeaking && (
                  <motion.div key="speaking" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 justify-center bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-ping" />
                    <span className="text-[#00D4FF] text-xs font-semibold">Speaking</span>
                  </motion.div>
                )}
                {isListening && (
                  <motion.div key="listening" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 justify-center bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    <span className="text-red-400 text-xs font-semibold">Listening</span>
                  </motion.div>
                )}
                {isThinking && (
                  <motion.div key="thinking" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 justify-center bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-400 text-xs font-semibold">Thinking...</span>
                  </motion.div>
                )}
                {!isSpeaking && !isListening && !isThinking && sessionStarted && (
                  <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 justify-center bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-green-400 text-xs font-semibold">Ready</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sound waves when speaking */}
            {isSpeaking && (
              <div className="absolute bottom-8 flex items-end gap-0.5 h-6">
                {[1,2,3,4,5,6,7].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${20 + Math.random() * 60}%`, `${20 + Math.random() * 80}%`, `${20 + Math.random() * 40}%`] }}
                    transition={{ duration: 0.3 + i * 0.05, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-[#00D4FF] rounded-full opacity-70"
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Chat Panel */}
          <div className="flex-1 flex flex-col bg-black/30 border border-white/5 rounded-3xl backdrop-blur-xl overflow-hidden">

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {!sessionStarted && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] flex items-center justify-center shadow-[0_0_30px_rgba(108,92,231,0.4)]"
                  >
                    <Bot className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to practice, {userName}?</h3>
                    <p className="text-white/50 max-w-sm mx-auto text-sm">
                      Aria will speak to you, listen to your responses, and correct + improve your English in real-time.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startSession}
                    className="px-10 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#00D4FF] rounded-full text-white font-bold text-lg shadow-[0_0_30px_rgba(108,92,231,0.4)] hover:shadow-[0_0_50px_rgba(108,92,231,0.6)] transition-all"
                  >
                    Start Training Session 🎙️
                  </motion.button>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-3`}
                  >
                    {msg.role === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,212,255,0.3)]">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                      msg.role === "ai"
                        ? "bg-white/5 border border-white/10 text-white rounded-tl-sm"
                        : "bg-gradient-to-br from-[#6C5CE7] to-[#5a4cc4] text-white rounded-tr-sm shadow-lg"
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {isThinking && (
                  <motion.div key="thinking-dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#6C5CE7] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-[#00D4FF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            {sessionStarted && (
              <div className="p-5 border-t border-white/5 bg-black/20">
                {/* Live transcript display */}
                <AnimatePresence>
                  {liveTranscript && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mb-3 text-center text-sm text-white/60 italic bg-white/5 rounded-xl px-4 py-2"
                    >
                      🎤 &quot;{liveTranscript}...&quot;
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-4">
                  {/* Mic Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={toggleMic}
                    disabled={isThinking || isSpeaking}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                      isListening
                        ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                        : "bg-gradient-to-br from-[#6C5CE7] to-[#00D4FF] shadow-[0_0_20px_rgba(108,92,231,0.4)] hover:shadow-[0_0_40px_rgba(108,92,231,0.6)]"
                    }`}
                  >
                    {/* Pulse rings when listening */}
                    {isListening && (
                      <>
                        <motion.div animate={{ scale: [1, 1.6], opacity: [0.5, 0] }} transition={{ duration: 1, repeat: Infinity }}
                          className="absolute inset-0 rounded-full border-2 border-red-400" />
                        <motion.div animate={{ scale: [1, 1.9], opacity: [0.3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                          className="absolute inset-0 rounded-full border-2 border-red-300" />
                      </>
                    )}
                    {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                  </motion.button>

                  <div className="text-center">
                    <p className="text-white/50 text-sm font-medium">
                      {isListening ? "Tap to stop" : isThinking ? "Aria is thinking..." : isSpeaking ? "Aria is speaking..." : "Tap mic to respond"}
                    </p>
                    <p className="text-white/25 text-xs mt-0.5">
                      {isListening ? "Listening for your voice..." : "Hold mic, speak clearly"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
