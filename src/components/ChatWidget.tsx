import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/i18n/LanguageContext";

interface Message {
  id: string;
  content: string;
  sender_type: "visitor" | "bot" | "admin";
  created_at: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mode, setMode] = useState<"bot" | "agent">("bot");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();
  const c = t.chat;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to realtime messages when in agent mode
  useEffect(() => {
    if (!conversationId || mode !== "agent") return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_type === "admin") {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, mode]);

  const startConversation = async () => {
    const token = sessionStorage.getItem("visitor_sid") || crypto.randomUUID();
    const { data: convId } = await supabase.rpc("create_chat_conversation", {
      p_session_token: token,
    });
    if (convId) {
      setConversationId(convId as string);
      sessionStorage.setItem("chat_session_token", token);
      const sid = sessionStorage.getItem("visitor_sid");
      if (sid) {
        await supabase.rpc("link_visitor_data", { p_session_id: sid });
      }
      const welcomeMsg: Message = {
        id: "welcome",
        content: c.welcome,
        sender_type: "bot",
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMsg]);

      await supabase.rpc("send_chat_message", {
        p_session_token: token,
        p_conversation_id: convId as string,
        p_content: welcomeMsg.content,
        p_sender_type: "bot",
      });
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!conversationId) startConversation();
  };

  const transferToAgent = async () => {
    setMode("agent");
    if (conversationId) {
      const token = sessionStorage.getItem("chat_session_token") || "";
      await supabase.rpc("update_chat_conversation", {
        p_session_token: token,
        p_conversation_id: conversationId,
        p_status: "waiting",
      });

      const transferMsg: Message = {
        id: `transfer-${Date.now()}`,
        content: c.transferMsg,
        sender_type: "bot",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, transferMsg]);

      await supabase.rpc("send_chat_message", {
        p_session_token: token,
        p_conversation_id: conversationId,
        p_content: transferMsg.content,
        p_sender_type: "bot",
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      sender_type: "visitor",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const token = sessionStorage.getItem("chat_session_token") || "";
    await supabase.rpc("send_chat_message", {
      p_session_token: token,
      p_conversation_id: conversationId,
      p_content: userMsg.content,
      p_sender_type: "visitor",
    });

    if (mode === "bot") {
      setLoading(true);
      try {
        const chatHistory = messages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({
            role: m.sender_type === "visitor" ? "user" : "assistant",
            content: m.content,
          }));
        chatHistory.push({ role: "user", content: userMsg.content });

        const { data, error } = await supabase.functions.invoke("chat-ai", {
          body: { messages: chatHistory, lang },
        });

        if (error) throw error;

        const reply = data?.reply || c.fallbackError;

        if (reply.includes("[TRANSFER_TO_AGENT]")) {
          await transferToAgent();
        } else {
          const botMsg: Message = {
            id: `bot-${Date.now()}`,
            content: reply,
            sender_type: "bot",
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, botMsg]);
          await supabase.rpc("send_chat_message", {
            p_session_token: sessionStorage.getItem("chat_session_token") || "",
            p_conversation_id: conversationId,
            p_content: reply,
            p_sender_type: "bot",
          });
        }
      } catch (err) {
        console.error("Chat error:", err);
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          content: c.errorMsg,
          sender_type: "bot",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={handleOpen}
            className="fixed bottom-6 left-4 md:left-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-4 md:left-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mode === "bot" ? (
                  <Bot className="w-5 h-5" />
                ) : (
                  <Headphones className="w-5 h-5" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {mode === "bot" ? c.botTitle : c.agentTitle}
                  </p>
                  <p className="text-xs opacity-75">
                    {mode === "bot" ? c.botOnline : c.agentWaiting}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {mode === "bot" && (
                  <button
                    onClick={transferToAgent}
                    className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors"
                    title={c.connectAgent}
                  >
                    <Headphones className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === "visitor" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.sender_type === "visitor"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : msg.sender_type === "admin"
                        ? "bg-cta/10 text-foreground rounded-bl-sm border border-cta/20"
                        : "bg-secondary text-foreground rounded-bl-sm"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-end">
                  <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={c.placeholder}
                  className="flex-1 px-3 py-2 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
