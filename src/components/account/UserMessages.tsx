import { useState, useEffect } from "react";
import { getMyMessages, getConversation, replyToMessage } from "../../api/account";
import type { ContactMessage, Conversation } from "../../types/communication";

export default function UserMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getMyMessages();
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (id: string) => {
    setLoading(true);
    try {
      const data = await getConversation(id);
      setSelectedConversation(data);
    } catch (err) {
      console.error("Failed to load conversation", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !replyText.trim()) return;
    setBusy(true);
    try {
      await replyToMessage(selectedConversation.id, replyText);
      const updated = await getConversation(selectedConversation.id);
      setSelectedConversation(updated);
      setReplyText("");
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setBusy(false);
    }
  };

  if (loading && messages.length === 0) {
    return <div className="p-10 text-center text-sm italic text-midnight/40 font-voice">Loading your messages...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-midnight">Messages & Support</h2>
        <p className="mt-2 text-sm text-midnight/60 font-sans italic">Track your inquiries and atelier responses.</p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line p-12 text-center">
          <p className="text-midnight/50 font-voice italic">You haven't sent any messages yet.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 items-start">
          {/* List */}
          <div className="space-y-3">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMessage(m.id)}
                className={`w-full text-left p-5 border rounded-2xl transition-all ${
                  selectedConversation?.id === m.id
                    ? "bg-ivory shadow-sm border-gold ring-1 ring-gold/20"
                    : "bg-white border-line hover:border-gold/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${
                    m.status === "new" ? "bg-gold text-white" : "bg-line text-midnight/60"
                  }`}>
                    {m.status}
                  </span>
                  <span className="text-[9px] text-midnight/40">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xs font-display text-midnight truncate">{m.subject}</h4>
                <p className="mt-1 text-[11px] text-midnight/50 line-clamp-1 font-sans">{m.message}</p>
              </button>
            ))}
          </div>

          {/* Conversation */}
          <div className="bg-white border border-line rounded-[28px] overflow-hidden min-h-[400px] flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-6 border-b border-line bg-ivory-warm/20">
                  <h3 className="font-display text-lg text-midnight">{selectedConversation.subject}</h3>
                  <span className="text-[10px] text-midnight/40 uppercase tracking-widest mt-1 block">
                    Started on {new Date(selectedConversation.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[500px]">
                  {/* Original Message */}
                  <div className="flex flex-col items-end max-w-[90%] ml-auto">
                    <div className="bg-midnight text-ivory p-4 rounded-2xl rounded-tr-none">
                      <p className="text-sm font-sans leading-relaxed">{selectedConversation.message}</p>
                    </div>
                    <span className="mt-2 text-[9px] text-gold uppercase mr-1">You</span>
                  </div>

                  {/* Replies */}
                  {selectedConversation.replies?.map((r) => (
                    <div key={r.id} className={`flex flex-col ${r.is_admin ? "items-start" : "items-end"} max-w-[90%] ${!r.is_admin ? "ml-auto" : ""}`}>
                      <div className={`p-4 rounded-2xl ${
                        r.is_admin
                          ? "bg-ivory-warm text-midnight rounded-tl-none border border-line/30"
                          : "bg-midnight text-ivory rounded-tr-none"
                      }`}>
                        <p className="text-sm leading-relaxed font-sans">{r.text}</p>
                      </div>
                      <span className={`mt-2 text-[9px] uppercase ${r.is_admin ? "text-midnight/40 ml-1" : "text-gold mr-1"}`}>
                        {r.is_admin ? "Solenne Atelier" : "You"} · {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedConversation.status !== "resolved" && (
                  <div className="p-6 border-t border-line">
                    <form onSubmit={handleReply} className="relative">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply to the atelier..."
                        className="w-full bg-ivory-warm/20 border border-line p-4 pr-12 text-sm font-sans outline-none focus:border-gold rounded-xl resize-none h-24"
                        required
                      />
                      <button
                        type="submit"
                        disabled={busy || !replyText.trim()}
                        className="absolute bottom-4 right-4 text-gold hover:text-midnight transition-colors disabled:opacity-30"
                        aria-label="Send reply"
                      >
                        <IconSend />
                      </button>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <IconMessage className="w-12 h-12 text-line mb-4" />
                <p className="text-midnight/40 font-voice italic">Select a conversation to view the history</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IconSend() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMessage({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
