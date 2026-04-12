import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sounds } from "@/lib/sounds";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  sender_type: "visitor" | "bot" | "admin";
  created_at: string;
}

interface AdminVisitorChatProps {
  visitorSessionId: string;
  visitorName: string | null;
}

const AdminVisitorChat = ({ visitorSessionId, visitorName }: AdminVisitorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Find or create conversation for this visitor
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setMessages([]);
      setConversationId(null);

      // Find existing conversation
      const { data: convs } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_token", visitorSessionId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (convs && convs.length > 0) {
        const cid = convs[0].id;
        setConversationId(cid);

        // Mark as active and assign admin
        const user = (await supabase.auth.getUser()).data.user;
        await supabase.from("chat_conversations").update({
          status: "active",
          assigned_admin: user?.id || null,
        }).eq("id", cid);

        // Fetch messages
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", cid)
          .order("created_at", { ascending: true });
        if (msgs) setMessages(msgs as Message[]);
      }
      setLoading(false);
    };
    init();
  }, [visitorSessionId]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`admin-chat-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          if (newMsg.sender_type === "visitor") sounds.chatMessage();
          return [...prev, newMsg];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;

      // Create conversation if none exists
      let cid = conversationId;
      if (!cid) {
        const { data: newConv } = await supabase.from("chat_conversations").insert({
          session_token: visitorSessionId,
          visitor_name: visitorName || "زائر",
          status: "active",
          assigned_admin: user?.id || null,
        }).select("id").single();
        if (newConv) {
          cid = newConv.id;
          setConversationId(cid);
        }
      }

      if (!cid) return;

      await supabase.from("chat_messages").insert({
        conversation_id: cid,
        content: text,
        sender_type: "admin",
        sender_id: user?.id || null,
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-80 bg-background rounded-lg border border-border overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <MessageCircle className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">لا توجد رسائل بعد</p>
            <p className="text-[10px] text-muted-foreground/70">ابدأ المحادثة مع الزائر</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender_type === "admin" ? "justify-start" : "justify-end"}`}
              >
                <div className={`max-w-[80%] rounded-xl px-3 py-2 ${
                  msg.sender_type === "admin"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : msg.sender_type === "bot"
                    ? "bg-muted text-muted-foreground rounded-tl-sm"
                    : "bg-secondary text-foreground rounded-tl-sm"
                }`}>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[9px] mt-1 ${
                    msg.sender_type === "admin" ? "text-primary-foreground/60" : "text-muted-foreground/60"
                  }`}>
                    {msg.sender_type === "admin" ? "أنت" : msg.sender_type === "bot" ? "بوت" : "الزائر"} · {formatTime(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-2 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="اكتب رسالة..."
          className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          dir="auto"
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          size="sm"
          className="h-8 w-8 p-0 rounded-lg"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
};

export default AdminVisitorChat;
