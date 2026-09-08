"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, X, Loader2, Sparkles } from "lucide-react";
import { api, getToken } from "@/lib/api";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/workouts": "Workout Plan",
  "/meals": "Meal Plan",
  "/progress": "Progress",
};

type ChatMessage = { role: "user" | "assistant"; content: string };

type AIChatProps = {
  /** Optional exercise name to give the assistant extra context. */
  currentExercise?: string;
};

type ProfileContext = {
  fitnessGoal?: string;
  workoutLocation?: string;
  workoutExperience?: string;
  dietaryPreference?: string;
  targetBodyFocus?: string;
};

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your Strive Assistant. Ask me about workouts, home alternatives, meals, or beginner fitness tips — for example, \"What can I do instead of leg press at home?\"",
};

const SUGGESTIONS = [
  "What can I do instead of leg press at home?",
  "What should I eat after a workout?",
  "How many days should I train as a beginner?",
];

export function AIChat({ currentExercise }: AIChatProps) {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ProfileContext | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const currentPage = PAGE_NAMES[pathname] || undefined;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
      setLoggedIn(Boolean(getToken()));
    });

    const handleOpen = () => setOpen(true);
    window.addEventListener("open-ai-chat", handleOpen);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("open-ai-chat", handleOpen);
    };
  }, []);

  // Lazily load profile context the first time the panel opens.
  useEffect(() => {
    if (!open || profile) return;
    let active = true;
    api
      .get("/api/profile")
      .then((res) => {
        if (!active) return;
        const p = (res.data?.profile || res.data || {}) as ProfileContext;
        setProfile({
          fitnessGoal: p.fitnessGoal,
          workoutLocation: p.workoutLocation,
          workoutExperience: p.workoutExperience,
          dietaryPreference: p.dietaryPreference,
          targetBodyFocus: p.targetBodyFocus,
        });
      })
      .catch(() => setProfile({}));
    return () => {
      active = false;
    };
  }, [open, profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;

    setError("");
    setInput("");
    // Prior turns (exclude the canned welcome) become conversation history.
    const history = messages
      .slice(1)
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const res = await api.post("/api/ai/chat", {
        message,
        history,
        context: {
          ...(profile || {}),
          ...(currentExercise ? { currentExercise } : {}),
          ...(currentPage ? { currentPage } : {}),
        },
      });
      const reply = res.data?.reply || "Strive Assistant is unavailable right now. Please try again later.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setError("Strive Assistant is unavailable right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !loggedIn) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          aria-label="Open Strive Assistant chat"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Ask Strive Assistant</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:bottom-5 sm:right-5">
          <div className="mx-auto flex h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:h-[560px] sm:w-[380px] sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-none">Strive Assistant</p>
                  <p className="text-[11px] text-white/80 mt-0.5">Beginner-friendly fitness help</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 hover:bg-white/15 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start" role="status" aria-live="polite">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking…
                  </div>
                </div>
              )}

              {messages.length === 1 && !loading && (
                <div className="space-y-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage(s)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-slate-100 bg-white p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1000}
                aria-label="Message Strive Assistant"
                placeholder="Ask about workouts, meals, or tips…"
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
