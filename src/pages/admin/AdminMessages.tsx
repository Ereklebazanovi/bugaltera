import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Inbox,
  Mail,
  Phone,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  topic: string | null;
  message: string | null;
  createdAt: { toDate: () => Date } | null;
  read: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminMessages() {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [loading, setLoading]           = useState(true);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => { fetchMessages() }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setMessages(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Message, "id">),
          read: d.data().read ?? false,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRead(id: string, currentRead: boolean) {
    await updateDoc(doc(db, "contacts", id), { read: !currentRead });
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: !currentRead } : m))
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "contacts", deleteTarget));
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget));
      if (expandedId === deleteTarget) setExpandedId(null);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  function formatDate(m: Message): string {
    if (!m.createdAt) return "—";
    return m.createdAt.toDate().toLocaleDateString("ka-GE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const pageTitle = (
    <span className="flex items-center gap-2">
      შეტყობინებები
      {unreadCount > 0 && (
        <span className="bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
          {unreadCount} ახალი
        </span>
      )}
    </span>
  );

  return (
    <>
      <AdminLayout title={pageTitle}>
        {/* Page body */}
        <main className="flex-1 p-4 md:p-8">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

            {/* Card header */}
            <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">ყველა შეტყობინება</h2>
              <p className="text-xs text-slate-400">{messages.length} სულ</p>
            </div>

            {/* States */}
            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="py-20 text-center">
                <Inbox size={28} strokeWidth={1.2} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">შეტყობინება არ არის</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <li key={msg.id} className={!msg.read ? "bg-blue-50/40" : ""}>

                    {/* Summary row — click to expand */}
                    <div
                      className="px-4 md:px-6 py-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                      onClick={() => {
                        const opening = expandedId !== msg.id;
                        setExpandedId((prev) => (prev === msg.id ? null : msg.id));
                        if (opening && !msg.read) handleToggleRead(msg.id, false);
                      }}
                    >
                      {/* Unread dot */}
                      <div className="mt-1.5 shrink-0">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            msg.read ? "bg-slate-200" : "bg-blue-500"
                          }`}
                        />
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`text-[15px] md:text-[16px] ${
                              msg.read
                                ? "text-slate-700 font-normal"
                                : "text-slate-900 font-semibold"
                            }`}
                          >
                            {msg.name}
                          </span>
                          {msg.topic && (
                            <span className="text-[11px] tracking-wide bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {msg.topic}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[13px] md:text-[15px] text-slate-800 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Phone size={11} strokeWidth={1.6} />
                            {msg.phone}
                          </span>
                          {msg.email && (
                            <span className="flex items-center gap-1.5 min-w-0">
                              <Mail size={11} strokeWidth={1.6} className="shrink-0" />
                              <span className="truncate">{msg.email}</span>
                            </span>
                          )}
                        </div>
                        {/* Message preview — hidden when this row is expanded */}
                        {msg.message && expandedId !== msg.id && (
                          <p className="text-[13px] text-slate-500 mt-1 truncate">
                            {msg.message}
                          </p>
                        )}
                      </div>

                      {/* Date + chevron */}
                      <div className="shrink-0 text-right ml-2">
                        <p className="text-[12px] md:text-[13px] text-slate-500 whitespace-nowrap">{formatDate(msg)}</p>
                        <div className="mt-1.5 flex justify-end text-slate-400">
                          {expandedId === msg.id ? (
                            <ChevronUp size={14} strokeWidth={1.5} />
                          ) : (
                            <ChevronDown size={14} strokeWidth={1.5} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail panel */}
                    {expandedId === msg.id && (
                      <div className="px-4 md:px-6 pb-5 md:pl-12 space-y-4 border-t border-slate-100/60">
                        {msg.message ? (
                          <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
                            <p className="text-[10px] tracking-[0.15em] uppercase font-semibold text-slate-500 mb-2">
                              შეტყობინება
                            </p>
                            <p className="text-[14px] md:text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                              {msg.message}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-4 text-xs text-slate-400 italic">შეტყობინების ტექსტი არ არის</p>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(msg.id);
                            }}
                            className="flex items-center gap-1.5 text-[13px] text-red-600 hover:text-red-800 bg-white border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Trash2 size={12} strokeWidth={1.6} />
                            წაშლა
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </AdminLayout>

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 px-4 sm:px-5 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-6 w-full max-w-sm pointer-events-auto mb-4 sm:mb-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">წაშლის დადასტურება</h3>
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-40"
                >
                  <X size={16} strokeWidth={1.6} />
                </button>
              </div>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                დარწმუნებული ხართ, რომ გსურთ ამ შეტყობინების წაშლა? ეს მოქმედება შეუქცევადია.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                >
                  გაუქმება
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? "..." : "წაშლა"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
