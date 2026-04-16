import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListConversations, useListChatMessages, useCreateConversation, useSendChatMessage } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Plus, MessageSquare, Search } from "lucide-react";
import { useUser } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { user } = useUser();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [searchNewUser, setSearchNewUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: conversations, refetch: refetchConvs } = useListConversations();
  const { data: messages, refetch: refetchMessages } = useListChatMessages(
    activeConvId!,
    { query: { enabled: !!activeConvId } }
  );
  const sendMessage = useSendChatMessage();
  const createConversation = useCreateConversation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConv = conversations?.find(c => c.id === activeConvId);

  const handleSend = async () => {
    if (!input.trim() || !activeConvId) return;
    try {
      await sendMessage.mutateAsync({ conversationId: activeConvId!, data: { content: input } });
      setInput("");
      refetchMessages();
      refetchConvs();
    } catch {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversations List */}
      <div className="w-72 shrink-0 flex flex-col border border-border/50 bg-card/40 backdrop-blur rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-bold text-sm uppercase tracking-wider text-primary mb-3">COMMS</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-8 bg-background border-border focus:border-primary/50 h-8 text-sm"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!conversations ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full bg-muted/30" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24 bg-muted/30" />
                  <Skeleton className="h-3 w-36 bg-muted/30" />
                </div>
              </div>
            ))
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground opacity-30 mb-2" />
              <p className="text-xs text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full p-3 flex items-start gap-3 text-left transition-all hover:bg-muted/30 ${activeConvId === conv.id ? "bg-primary/5 border-r-2 border-primary" : ""}`}
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={conv.participantAvatar || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">{conv.participantName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{conv.participantName}</p>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">{conv.unreadCount}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage || "No messages yet"}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border border-border/50 bg-card/40 backdrop-blur rounded-xl overflow-hidden">
        {activeConvId && activeConv ? (
          <>
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3 bg-background/30">
              <Avatar className="w-9 h-9">
                <AvatarImage src={activeConv.participantAvatar || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-sm">{activeConv.participantName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{activeConv.participantName}</h3>
                <p className="text-xs text-primary">Active</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {messages?.map((msg, i) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      {!isMe && (
                        <Avatar className="w-7 h-7 shrink-0">
                          <AvatarImage src={msg.senderAvatar || undefined} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">{msg.senderName?.[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/40 border border-border/50 rounded-tl-sm"}`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border/50 bg-background/20">
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-background border-border focus:border-primary/50 flex-1"
                />
                <Button type="submit" disabled={!input.trim()} className="bg-primary text-primary-foreground hover:bg-primary/80 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Select a conversation</h3>
              <p className="text-muted-foreground text-sm mt-1">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
