import { useState, useEffect } from "react";
import { listContactMessages, updateMessageStatus, adminReplyToMessage } from "../../api/admin";
import type { ContactMessage, MessageStatus } from "../../types/communication";

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MessageStatus | "all">("all");
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [filter]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await listContactMessages(filter === "all" ? undefined : filter);
      const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMessages(sorted);
      // Auto select first message if none selected
      if (sorted.length > 0 && !selectedId) {
        setSelectedId(sorted[0].id);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMessage = messages.find(m => m.id === selectedId);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !replyText.trim()) return;
    setBusy(true);
    try {
      await adminReplyToMessage(selectedId, replyText);
      await updateMessageStatus(selectedId, "replied");
      setReplyText("");
      loadMessages();
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setBusy(false);
    }
  };

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case "new": return "bg-amber-100 text-amber-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "replied": return "bg-green-100 text-green-700";
      case "resolved": return "bg-gray-100 text-gray-500";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-[32px] border border-line overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-line flex flex-col md:flex-row justify-between items-center gap-4 bg-ivory-warm/10">
        <div>
          <h1 className="font-display text-2xl text-midnight">Inquiry Center</h1>
          <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-midnight/40">Responding to the Solenne community</p>
        </div>
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-line/50 overflow-x-auto max-w-full">
          {["all", "new", "replied", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 text-[9px] uppercase tracking-widest rounded-lg transition-all ${
                filter === f ? "bg-midnight text-ivory shadow-md" : "text-midnight/50 hover:text-midnight"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-line overflow-y-auto bg-ivory-warm/5">
          {loading && messages.length === 0 ? (
            <div className="p-20 text-center animate-pulse">
               <div className="w-12 h-12 bg-line rounded-full mx-auto mb-4" />
               <p className="text-[11px] uppercase tracking-widest text-midnight/30">Loading Inquiries...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-20 text-center font-voice italic text-midnight/30">
               No messages found in this category.
            </div>
          ) : (
            <div className="divide-y divide-line/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`p-5 cursor-pointer transition-all relative ${
                    selectedId === m.id ? "bg-white shadow-inner" : "hover:bg-white/60"
                  }`}
                >
                  {selectedId === m.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-midnight" />}

                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-tighter ${getStatusColor(m.status)}`}>
                      {m.status}
                    </span>
                    <span className="text-[8px] text-midnight/30 font-sans uppercase">
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold truncate ${!m.is_read ? 'text-midnight' : 'text-midnight/60'}`}>
                      {m.name}
                    </h4>
                    {!m.is_read && <span className="h-2 w-2 rounded-full bg-gold shrink-0" />}
                  </div>

                  <h5 className="text-[11px] text-midnight/80 font-medium truncate mt-1">{m.subject}</h5>
                  <p className="text-[10px] text-midnight/40 line-clamp-2 mt-1 leading-relaxed">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Area */}
        <div className="hidden md:flex flex-1 bg-white flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-8 border-b border-line bg-white z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-bold">{selectedMessage.status} inquiry</span>
                    <h2 className="text-2xl font-display text-midnight mt-1">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-3 mt-3">
                       <div className="w-8 h-8 rounded-full bg-ivory-warm flex items-center justify-center font-display text-xs text-midnight/50">
                          {selectedMessage.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-midnight">{selectedMessage.name}</p>
                          <p className="text-[10px] text-midnight/40 font-sans lowercase">{selectedMessage.email}</p>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => updateMessageStatus(selectedMessage.id, e.target.value as MessageStatus).then(loadMessages)}
                      className="text-[9px] uppercase tracking-widest border border-line rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-gold/30 cursor-pointer bg-white"
                    >
                      <option value="new">Mark New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="replied">Replied</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <span className="text-[9px] text-midnight/30 uppercase tracking-tighter">Received: {new Date(selectedMessage.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Chat Flow */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFCF9]">
                {/* Initial message from customer */}
                <div className="flex flex-col items-start max-w-[85%]">
                  <div className="bg-white p-6 rounded-[28px] rounded-tl-none border border-line shadow-sm">
                    <p className="text-sm text-midnight leading-relaxed font-sans whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                  <span className="mt-2 text-[9px] text-midnight/30 uppercase tracking-widest ml-4">Customer Inquiry</span>
                </div>

                {/* Response history */}
                {selectedMessage.replies?.map((r) => (
                  <div key={r.id} className={`flex flex-col ${r.is_admin ? "items-end ml-auto" : "items-start"} max-w-[85%]`}>
                    <div className={`p-6 rounded-[28px] ${
                      r.is_admin
                        ? "bg-midnight text-ivory rounded-tr-none shadow-lg"
                        : "bg-white text-midnight rounded-tl-none border border-line shadow-sm"
                    }`}>
                      <p className="text-sm leading-relaxed font-sans whitespace-pre-wrap">{r.text}</p>
                    </div>
                    <span className={`mt-2 text-[9px] uppercase tracking-widest ${r.is_admin ? "text-gold mr-4" : "text-midnight/30 ml-4"}`}>
                      {r.is_admin ? "Solenne Atelier" : "Customer"} · {new Date(r.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Reply Form */}
              <div className="p-6 border-t border-line bg-white">
                <form onSubmit={handleReply} className="relative">
                  <textarea
                    placeholder={`Reply to ${selectedMessage.name.split(' ')[0]}...`}
                    className="w-full border border-line rounded-[24px] p-6 pr-32 text-sm font-sans outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/10 resize-none h-32 transition-all bg-ivory-warm/10"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                  <div className="absolute right-4 bottom-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateMessageStatus(selectedMessage.id, "resolved").then(loadMessages)}
                      className="px-4 py-3 text-[9px] uppercase tracking-widest text-midnight/40 hover:text-midnight transition-colors font-bold"
                    >
                      Resolve
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="bg-midnight px-6 py-3 rounded-full text-[9px] uppercase tracking-[0.2em] text-ivory hover:bg-midnight-deep transition-all shadow-lg shadow-midnight/10 disabled:opacity-50"
                    >
                      {busy ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-midnight/10 bg-[#FDFCF9]">
              <div className="w-24 h-24 mb-6 opacity-20">
                 <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p className="font-voice italic text-xl">Select a conversation to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
