// AdminBanner.tsx - Global CMS for the Consultation Banner
// Saves to Firestore: collection "globals", doc "banner"
import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { MessageSquare, Loader2, Check } from "lucide-react";

type Lang = "ka" | "en" | "ru";

interface BannerContent {
  heading_ka: string; heading_en: string; heading_ru: string;
  subCopy_ka: string; subCopy_en: string; subCopy_ru: string;
  cta_ka: string; cta_en: string; cta_ru: string;
  phone1: string;
  phone2: string;
}

const DEFAULTS: BannerContent = {
  heading_ka: "გჭირდებათ კონსულტაცია?", heading_en: "Need Expert Advice?", heading_ru: "Нужна консультация?",
  subCopy_ka: "ჩვენი გამოცდილი სპეციალისტები მზად არიან დაგეხმარონ.", subCopy_en: "Our experienced specialists are ready to assist you.", subCopy_ru: "Наши опытные специалисты готовы вам помочь.",
  cta_ka: "კონსულტაციის მოთხოვნა", cta_en: "Request a Consultation", cta_ru: "Запрос консультации",
  phone1: "+995 511 411 604",
  phone2: "032 219 08 39"
};

const inputCls = "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition";

function Field({ label, value, onChange, textarea, rows = 3, hint }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; rows?: number; hint?: string; }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label} {hint && <span className="text-slate-400 font-normal ml-1.5">- {hint}</span>}
      </label>
      {textarea ? (
        <textarea rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-y leading-relaxed`} />
      ) : (
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </div>
  );
}

export default function AdminBanner() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<BannerContent>(DEFAULTS);
  const [lang, setLang] = useState<Lang>("ka");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getDoc(doc(db, "globals", "banner")).then((snap) => {
      if (snap.exists()) {
        setContent({ ...DEFAULTS, ...(snap.data() as Partial<BannerContent>) });
      }
      setLoading(false);
    });
  }, []);

  const saveBanner = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setDoc(doc(db, "globals", "banner"), { ...content, updatedAt: serverTimestamp() }, { merge: true })
      .catch(() => {
        setSaveError("კავშირის შეცდომა! შეამოწმეთ ინტერნეტი.");
        setTimeout(() => setSaveError(null), 5000);
      });
  };

  const updateField = (key: keyof BannerContent, value: string) => {
    setContent((p) => ({ ...p, [key]: value }));
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <AdminLayout title="გლობალური ბანერი / კონტენტი">
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">საკონტაქტო ბანერი</h2>
            <p className="text-xs text-slate-400 mt-0.5">გლობალური კომპონენტი ყველა გვერდისთვის</p>
          </div>
        </div>

        {saveError && <p className="mb-4 text-xs text-white bg-red-500 rounded-lg px-3 py-2">{saveError}</p>}

        <div className="max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare size={15} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-800">ტექსტები და ნომრები</p>
            </div>
            <button onClick={saveBanner} className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
              {saved ? <Check size={12} /> : null}
              {saved ? "შენახულია!" : "შენახვა"}
            </button>
          </div>

          <div className="px-6 py-5 space-y-6">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
              {(["ka", "en", "ru"] as Lang[]).map((lng) => (
                <button key={lng} onClick={() => setLang(lng)} className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${lang === lng ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {lng === "ka" ? "ქართული" : lng === "en" ? "English" : "Русский"}
                </button>
              ))}
            </div>

            <div className="space-y-4 border-b border-slate-100 pb-6">
              <Field label="ბანერის სათაური" value={content[`heading_${lang}`]} onChange={(v) => updateField(`heading_${lang}` as keyof BannerContent, v)} />
              <Field label="მოკლე აღწერა" value={content[`subCopy_${lang}`]} onChange={(v) => updateField(`subCopy_${lang}` as keyof BannerContent, v)} textarea rows={2} />
              <Field label="ღილაკის ტექსტი (CTA)" value={content[`cta_${lang}`]} onChange={(v) => updateField(`cta_${lang}` as keyof BannerContent, v)} />
            </div>

            <div className="space-y-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ტელეფონის ნომრები (საერთო ყველა ენისთვის)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="ნომერი 1" hint="მაგ: +995 511..." value={content.phone1} onChange={(v) => updateField("phone1", v)} />
                <Field label="ნომერი 2" hint="მაგ: 032 2..." value={content.phone2} onChange={(v) => updateField("phone2", v)} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}