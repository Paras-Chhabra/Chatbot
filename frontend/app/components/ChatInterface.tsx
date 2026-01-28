"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2, Sparkles, Database } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your Aiven SQL Assistant. I can access your campaign database in real-time. Ask me about spend, clicks, or performance metrics.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the FastAPI Backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await axios.post(`${apiUrl}/chat`, {
        message: input,
      });
      // Handle response - ensure we get a proper string even if response contains objects
      const rawResponse = response.data.response;
      let contentString: string;

      if (typeof rawResponse === 'string') {
        contentString = rawResponse;
      } else if (rawResponse === null || rawResponse === undefined) {
        contentString = "";
      } else {
        // If it's an object, stringify it nicely
        contentString = JSON.stringify(rawResponse, null, 2);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: contentString,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling chatbot:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error connecting to the database. Please check the backend logs.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return <div className="h-screen bg-slate-950" />;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/30">
            <Database className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Aiven SQL Insights
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Database Connection
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-4 max-w-3xl mx-auto",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border",
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-500/30"
                  : "bg-slate-700 border-slate-600"
              )}
            >
              {msg.role === "assistant" ? (
                <Sparkles className="w-5 h-5 text-indigo-100" />
              ) : (
                <User className="w-5 h-5 text-slate-200" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed max-w-[80%]",
                msg.role === "assistant"
                  ? "bg-slate-900/80 border border-slate-700/50 text-slate-100 rounded-tl-sm"
                  : "bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-500/10"
              )}
            >
              {/* Simple rendering for now. In a real app, use ReactMarkdown */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              <div className="mt-2 text-[10px] opacity-50 uppercase tracking-wider font-medium">
                {msg.timestamp || ""}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 max-w-3xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div className="px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl rounded-tl-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-slate-900/80 backdrop-blur-lg border-t border-slate-800">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative flex items-center gap-3"
        >
          <div className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for campaign metrics (e.g., 'Total spend today')..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl pl-5 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-500 shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800 rounded-lg border border-slate-700 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
              Enter
            </div>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center aspect-square"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="max-w-3xl mx-auto mt-2 text-center">
          <p className="text-[10px] text-slate-500">
            AI can make mistakes. Please verify important financial data.
          </p>
        </div>
      </div>
    </div>
  );
}
