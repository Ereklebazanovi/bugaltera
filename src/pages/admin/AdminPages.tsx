// AdminPages.tsx
import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { FileText, Loader2, Check, ExternalLink } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type PageKey = "terms" | "privacy";
type LangKey = "ka" | "en" | "ru";

interface PageContent {
  title_ka: string;
  title_en: string;
  title_ru: string;
  content_ka: string;
  content_en: string;
  content_ru: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_LABELS: Record<PageKey, { ka: string; en: string; route: string }> = {
  terms: {
    ka: "წესები და პირობები",
    en: "Terms & Conditions",
    route: "/terms",
  },
  privacy: {
    ka: "კონფიდენციალობის პოლიტიკა",
    en: "Privacy Policy",
    route: "/privacy",
  },
};

const EMPTY: PageContent = {
  title_ka: "",
  title_en: "",
  title_ru: "",
  content_ka: "",
  content_en: "",
  content_ru: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPages() {
  const [activePage, setActivePage] = useState<PageKey>("terms");
  const [activeLang, setActiveLang] = useState<LangKey>("ka");

  const [data, setData] = useState<Record<PageKey, PageContent>>({
    terms: { ...EMPTY },
    privacy: { ...EMPTY },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<PageKey | null>(null);
  const [saved, setSaved] = useState<PageKey | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Load both docs on mount ────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [termsSnap, privacySnap] = await Promise.all([
          getDoc(doc(db, "settings", "terms")),
          getDoc(doc(db, "settings", "privacy")),
        ]);
        setData({
          terms: termsSnap.exists()
            ? (termsSnap.data() as PageContent)
            : { ...EMPTY },
          privacy: privacySnap.exists()
            ? (privacySnap.data() as PageContent)
            : { ...EMPTY },
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Save handler ──────────────────────────────────────────────────────────

  const handleSave = async (page: PageKey) => {
    setSaving(page);
    setSaveError(null);
    try {
      await setDoc(doc(db, "settings", page), {
        ...data[page],
        updatedAt: serverTimestamp(),
      });
      setSaved(page);
      setTimeout(() => setSaved(null), 2500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "შეცდომა მოხდა.");
    } finally {
      setSaving(null);
    }
  };

  // ── Field update ──────────────────────────────────────────────────────────

  const updateField = (
    page: PageKey,
    field: keyof PageContent,
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      [page]: { ...prev[page], [field]: value },
    }));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title="გვერდები / კონტენტი">
      <main className="flex-1 p-4 md:p-8">

        {/* Page-type tab selector */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-6 shadow-sm">
          {(Object.keys(PAGE_LABELS) as PageKey[]).map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`text-xs px-4 md:px-5 py-2 rounded-lg transition-colors font-medium ${
                activePage === page
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {PAGE_LABELS[page].ka}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={22} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="max-w-3xl">
            {(Object.keys(PAGE_LABELS) as PageKey[]).map((page) =>
              activePage !== page ? null : (
                <div
                  key={page}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm"
                >
                  {/* Card header */}
                  <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 min-w-0">
                      <FileText size={15} className="text-slate-400 shrink-0" />
                      <span className="truncate">{PAGE_LABELS[page].ka}</span>
                    </h2>
                    <div className="flex items-center gap-2 shrink-0">
                      {saveError && (
                        <p className="text-xs text-red-500">{saveError}</p>
                      )}
                      <button
                        onClick={() => handleSave(page)}
                        disabled={saving === page}
                        className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
                      >
                        {saving === page ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : saved === page ? (
                          <Check size={12} />
                        ) : null}
                        {saved === page ? "შენახულია!" : "შენახვა"}
                      </button>
                    </div>
                  </div>

                  <div className="px-4 md:px-6 py-5 space-y-5">

                    {/* Language tabs */}
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">
                        ენა / Language
                      </p>
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                        {(["ka", "en", "ru"] as LangKey[]).map((lng) => (
                          <button
                            key={lng}
                            type="button"
                            onClick={() => setActiveLang(lng)}
                            className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${
                              activeLang === lng
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            {lng === "ka" ? "ქართული" : lng === "en" ? "English" : "Русский"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title field */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        სათაური{" "}
                        <span className="text-slate-400 font-normal">
                          ({activeLang === "ka" ? "ქართული" : activeLang === "en" ? "English" : "Русский"})
                        </span>
                      </label>
                      <input
                        type="text"
                        value={
                          data[page][
                            `title_${activeLang}` as keyof PageContent
                          ]
                        }
                        onChange={(e) =>
                          updateField(
                            page,
                            `title_${activeLang}` as keyof PageContent,
                            e.target.value
                          )
                        }
                        placeholder={
                          activeLang === "ka"
                            ? PAGE_LABELS[page].ka
                            : PAGE_LABELS[page].en
                        }
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                      />
                    </div>

                    {/* Content textarea */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        შინაარსი{" "}
                        <span className="text-slate-400 font-normal">
                          ({activeLang === "ka" ? "ქართული" : activeLang === "en" ? "English" : "Русский"}) —
                          ყოველი ახალი ხაზი გამოჩნდება ახალ აბზაცად
                        </span>
                      </label>
                      <textarea
                        rows={24}
                        value={
                          data[page][
                            `content_${activeLang}` as keyof PageContent
                          ]
                        }
                        onChange={(e) =>
                          updateField(
                            page,
                            `content_${activeLang}` as keyof PageContent,
                            e.target.value
                          )
                        }
                        placeholder={
                          activeLang === "ka"
                            ? `შეიყვანეთ ${PAGE_LABELS[page].ka}-ის სრული ტექსტი...\n\nEnter = ახალი აბზაცი.\nორი Enter = ცარიელი ხაზი სექციებს შორის.`
                            : activeLang === "en"
                            ? `Enter the full ${PAGE_LABELS[page].en} text here...\n\nPress Enter for a new paragraph.\nPress Enter twice to add a blank line between sections.`
                            : `Введите полный текст...\n\nEnter = новый абзац.\nДва Enter = пустая строка между разделами.`
                        }
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition resize-y font-mono leading-relaxed"
                      />
                    </div>

                    {/* Public page preview link */}
                    <a
                      href={PAGE_LABELS[page].route}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <ExternalLink size={11} />
                      საჯარო გვერდის ნახვა ↗
                    </a>

                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
