import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListOpenaiConversations, useGetOpenaiMessages, useCreateOpenaiConversation } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Send, Plus, MessageSquare, Loader2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageBubble {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function AIAssistant() {
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageBubble[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: conversations, refetch: refetchConvs } = useListOpenaiConversations();
  const { data: savedMessages } = useGetOpenaiMessages(
    activeConvId!,
    { query: { enabled: !!activeConvId } }
  );
  const createConv = useCreateOpenaiConversation();

  useEffect(() => {
    if (savedMessages) {
      setMessages(savedMessages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
    }
  }, [savedMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleNewConversation = async () => {
    try {
      const conv = await createConv.mutateAsync({ data: { title: "New Conversation" } });
      setActiveConvId(conv.id);
      setMessages([]);
      refetchConvs();
    } catch {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    let convId = activeConvId;
    if (!convId) {
      try {
        const conv = await createConv.mutateAsync({ data: { title: input.slice(0, 50) } });
        convId = conv.id;
        setActiveConvId(conv.id);
        refetchConvs();
      } catch {
        toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
        return;
      }
    }

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setSending(true);
    setStreamingContent("");

    try {
      const token = await (window as any).__clerk?.session?.getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/openai/conversations/${convId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                setStreamingContent(fullContent);
              }
              if (data.done) {
                setMessages(prev => [...prev, { role: "assistant", content: fullContent }]);
                setStreamingContent("");
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to get AI response", variant: "destructive" });
      setStreamingContent("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col gap-2 hidden md:flex">
        <Button
          onClick={handleNewConversation}
          className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 justify-start gap-2"
          variant="ghost"
        >
          <Plus className="w-4 h-4" /> New Chat
        </Button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations?.map(conv => (
            <button
              key={conv.id}
              onClick={() => { setActiveConvId(conv.id); setStreamingContent(""); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 truncate ${activeConvId === conv.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{conv.title || "Conversation"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 rounded-xl border border-border/50 bg-card/40 backdrop-blur overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3 bg-background/30">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-sm">TECHVERSE AI</h2>
            <p className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeConvId && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shadow-[0_0_40px_rgba(0,255,255,0.15)]">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">TechVerse AI Assistant</h3>
                <p className="text-muted-foreground max-w-sm text-sm">Your intelligent coding companion. Ask me anything about development, architecture, career advice, or platform features.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {["How do I deploy a React app?", "Review my code architecture", "Help me plan a new project", "What tech stack should I use?"].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-3 rounded-lg border border-border/50 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5 transition-all text-left flex items-center gap-2"
                  >
                    <ChevronRight className="w-3 h-3 text-primary shrink-0" /> {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === "user" ? "bg-secondary/20 border border-secondary/30 text-secondary" : "bg-primary/20 border border-primary/30 text-primary"}`}>
                  {msg.role === "user" ? "U" : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-secondary/10 border border-secondary/20 rounded-tr-sm" : "bg-muted/40 border border-border/50 rounded-tl-sm"}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {streamingContent && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-primary/20 border border-primary/30 text-primary">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[80%] rounded-xl px-4 py-3 text-sm bg-muted/40 border border-border/50 rounded-tl-sm">
                <p className="whitespace-pre-wrap leading-relaxed">{streamingContent}</p>
                <span className="inline-block w-1.5 h-4 bg-primary/80 animate-pulse ml-0.5" />
              </div>
            </motion.div>
          )}

          {sending && !streamingContent && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-primary/20 border border-primary/30 text-primary">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border border-border/50 rounded-xl rounded-tl-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-background/20">
          <form
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask TechVerse AI anything..."
              className="bg-background border-border focus:border-primary/50 flex-1"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_15px_rgba(0,255,255,0.3)] shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
