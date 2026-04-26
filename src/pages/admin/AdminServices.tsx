// AdminServices.tsx - Structured CMS for the Services page (/services)
// Saves to Firestore: collection "pages", doc "services"
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Sparkles,
  LayoutGrid,
  BarChart2,
  Users,
  ChevronDown,
  Loader2,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type Lang = "ka" | "en" | "ru";

export interface ServiceItem {
  title_ka: string; title_en: string; title_ru: string;
  desc_ka: string;  desc_en: string;  desc_ru: string;
  subSvcs_ka: string; subSvcs_en: string; subSvcs_ru: string;
}

interface HeroSection {
  eyebrow_ka: string; eyebrow_en: string; eyebrow_ru: string;
  heading1_ka: string; heading1_en: string; heading1_ru: string;
  heading2_ka: string; heading2_en: string; heading2_ru: string;
  subCopy_ka: string; subCopy_en: string; subCopy_ru: string;
}

interface CardsSection {
  subServicesLabel_ka: string; subServicesLabel_en: string; subServicesLabel_ru: string;
  cta_ka: string; cta_en: string; cta_ru: string;
  items: ServiceItem[];
}

interface StatsSection {
  stat0_num: string;
  stat0_label_ka: string; stat0_label_en: string; stat0_label_ru: string;
  stat1_num: string;
  stat1_label_ka: string; stat1_label_en: string; stat1_label_ru: string;
  stat2_num: string;
  stat2_label_ka: string; stat2_label_en: string; stat2_label_ru: string;
}

interface TeamCtaSection {
  heading_ka: string; heading_en: string; heading_ru: string;
  button_ka: string; button_en: string; button_ru: string;
}

interface ServicesContent {
  hero: HeroSection;
  cards: CardsSection;
  stats: StatsSection;
  teamCta: TeamCtaSection;
}

// ── Empty service template ─────────────────────────────────────────────────

function emptyService(): ServiceItem {
  return {
    title_ka: "", title_en: "", title_ru: "",
    desc_ka:  "", desc_en:  "", desc_ru:  "",
    subSvcs_ka: "", subSvcs_en: "", subSvcs_ru: "",
  };
}

// ── Smart defaults ─────────────────────────────────────────────────────────

const DEFAULTS: ServicesContent = {
  hero: {
    eyebrow_ka: "ჩვენი სერვისები",    eyebrow_en: "Our Services",           eyebrow_ru: "Наши услуги",
    heading1_ka: "სრული პროფესიული",  heading1_en: "Complete Professional",  heading1_ru: "Полное профессиональное",
    heading2_ka: "მომსახურება",        heading2_en: "Services",              heading2_ru: "обслуживание",
    subCopy_ka: "კომპლექსური ბუღალტერია, ბიზნეს ადმინისტრირება და იურიდიული მხარდაჭერა - ყველაფერი, რაც თქვენს ბიზნეს საჭიროებს ზრდისა და სტაბილურობისთვის.",
    subCopy_en: "Accounting, business administration, and legal support - everything your business needs for growth and stability.",
    subCopy_ru: "Комплексная бухгалтерия, бизнес-администрирование и юридическая поддержка - все, что необходимо вашему бизнесу для роста и стабильности.",
  },
  cards: {
    subServicesLabel_ka: "ძირითადი მიმართულებები:", subServicesLabel_en: "Key Areas:", subServicesLabel_ru: "Основные направления:",
    cta_ka: "კონსულტაციის მოთხოვნა", cta_en: "Request a Consultation", cta_ru: "Запрос консультации",
    items: [
      {
        title_ka: "კომპლექსური ბუღალტერია", title_en: "Accounting Services", title_ru: "Комплексная бухгалтерия",
        desc_ka: "ვუზრუნველყოფთ ბუღალტრული აღრიცხვის სრულ ციკლს. ჩვენი გამოცდილი ბუღალტრები ზრუნავენ თქვენი ფინანსური დოკუმენტაციის სიზუსტეზე, კანონმდებლობასთან სრული შესაბამისობის უზრუნველყოფით.",
        desc_en: "We manage the full accounting cycle with precision. Our experienced accountants ensure the accuracy of your financial documentation and full compliance with applicable legislation.",
        desc_ru: "Мы обеспечиваем полный цикл бухгалтерского учета. Наши опытные бухгалтеры заботятся о точности вашей финансовой документации, гарантируя полное соответствие законодательству.",
        subSvcs_ka: "ფინანსური აღრიცხვის წარმოება\nსაგადასახადო ანგარიშგება\nბალანსებისა და ფინანსური ანგარიშების მომზადება\nფულადი ნაკადების მართვა",
        subSvcs_en: "Financial record-keeping\nTax reporting & filing\nBalance sheet & financial statement preparation\nCash flow management",
        subSvcs_ru: "Ведение финансового учета\nНалоговая отчетность\nПодготовка балансов и финансовых отчетов\nУправление денежными потоками",
      },
      {
        title_ka: "ბიზნეს ადმინისტრაცია", title_en: "Business Administration", title_ru: "Бизнес-администрирование",
        desc_ka: "ბიზნეს პროცესების ეფექტური მართვა სტრატეგიული ზრდის მისაღწევად. ვეხმარებით კომპანიებს ოპერაციული სირთულეების გადალახვასა და საქმიანობის ოპტიმიზაციაში.",
        desc_en: "Effective management of business processes to achieve strategic growth. We help companies overcome operational challenges and optimise their operations for maximum efficiency.",
        desc_ru: "Эффективное управление бизнес-процессами для достижения стратегического роста. Мы помогаем компаниям преодолевать операционные трудности и оптимизировать деятельность.",
        subSvcs_ka: "ოპერაციული პროცესების ორგანიზება\nსტრატეგიული დაგეგმვა და ანალიზი\nდოკუმენტაციის მართვა და ოპტიმიზაცია\nბიზნეს-გეგმების შემუშავება\nმენეჯმენტის ანგარიშგება",
        subSvcs_en: "Organisation of operational processes\nStrategic planning & analysis\nDocument management & optimisation\nBusiness plan development\nManagement reporting",
        subSvcs_ru: "Организация операционных процессов\nСтратегическое планирование и анализ\nУправление документацией и оптимизация\nРазработка бизнес-планов\nУправленческая отчетность",
      },
      {
        title_ka: "იურიდიული მხარდაჭერა", title_en: "Legal Support", title_ru: "Юридическая поддержка",
        desc_ka: "სამართლებრივი საკითხები ბიზნეს საქმიანობის განუყოფელი ნაწილია. ვუზრუნველყოფთ კლიენტების სრულ იურიდიულ დაცვას - კონტრაქტების შედგენიდან რეგულაციებთან შესაბამისობამდე.",
        desc_en: "Legal matters are an inseparable part of business operations. We provide comprehensive legal protection - from contract drafting to ensuring full regulatory compliance.",
        desc_ru: "Правовые вопросы являются неотъемлемой частью деловой активности. Мы обеспечиваем полную юридическую защиту клиентов - от составления контрактов до соблюдения нормативных требований.",
        subSvcs_ka: "კონტრაქტების მომზადება და გადამოწმება\nსამართლებრივი კონსულტაციები\nრეგულაციებთან შესაბამისობის უზრუნველყოფა\nკორპორატიული სამართლებრივი მხარდაჭერა\nსახელმწიფო სტრუქტურებთან ურთიერთობა",
        subSvcs_en: "Contract preparation & review\nLegal consultations\nRegulatory compliance assurance\nCorporate legal support\nLiaison with government authorities",
        subSvcs_ru: "Подготовка и проверка контрактов\nЮридические консультации\nОбеспечение соблюдения нормативных требований\nКорпоративная юридическая поддержка\nВзаимодействие с государственными структурами",
      },
    ],
  },
  stats: {
    stat0_num: "10+", stat0_label_ka: "წლიანი პროფესიული გამოცდილება", stat0_label_en: "Years of Professional Experience", stat0_label_ru: "Лет профессионального опыта",
    stat1_num: "100+", stat1_label_ka: "კმაყოფილი პარტნიორი კომპანია", stat1_label_en: "Satisfied Partner Companies",    stat1_label_ru: "Довольных компаний-партнеров",
    stat2_num: "50+",  stat2_label_ka: "წარმატებით დასრულებული აუდიტი",stat2_label_en: "Successfully Completed Audits",  stat2_label_ru: "Успешно проведенных аудитов",
  },
  teamCta: {
    heading_ka: "გამოცდილი პროფესიონალები თქვენს სამსახურში",
    heading_en: "Experienced Professionals at Your Service",
    heading_ru: "Опытные профессионалы к вашим услугам",
    button_ka: "გუნდის გაცნობა",
    button_en: "Meet Our Team",
    button_ru: "Познакомиться с командой",
  },
};

// ── Shared input style ─────────────────────────────────────────────────────

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition";

// ── Field ─────────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, textarea, rows = 3, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  textarea?: boolean; rows?: number; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {hint && <span className="text-slate-400 font-normal ml-1.5">- {hint}</span>}
      </label>
      {textarea ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} resize-y leading-relaxed font-mono`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </div>
  );
}

// ── Language tabs ──────────────────────────────────────────────────────────

function LangTabs({ value, onChange }: { value: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-5">
      {(["ka", "en", "ru"] as Lang[]).map((lng) => (
        <button key={lng} type="button" onClick={() => onChange(lng)}
          className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${
            value === lng ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}>
          {lng === "ka" ? "ქართული" : lng === "en" ? "English" : "Русский"}
        </button>
      ))}
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────────────────

function SectionCard({
  icon, title, subtitle, isOpen, onToggle, onSave, saving, saved, children,
}: {
  icon: ReactNode; title: string; subtitle: string;
  isOpen: boolean; onToggle: () => void; onSave: () => void;
  saving: boolean; saved: boolean; children: ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <button type="button" onClick={onToggle} className="flex-1 flex items-center gap-3 text-left min-w-0">
          <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`} />
          <span className="text-slate-300 shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
            <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
          </div>
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onSave(); }} disabled={saving}
          className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors shrink-0">
          {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : null}
          {saved ? "შენახულია!" : "შენახვა"}
        </button>
      </div>
      {isOpen && <div className="px-4 md:px-6 py-5">{children}</div>}
    </div>
  );
}

// ── Add-service modal ──────────────────────────────────────────────────────

function AddServiceModal({
  onClose, onAdd,
}: {
  onClose: () => void;
  onAdd: (item: ServiceItem) => void;
}) {
  const [lang, setLang] = useState<Lang>("ka");
  const [item, setItem] = useState<ServiceItem>(emptyService());
  const up = (k: keyof ServiceItem, v: string) => setItem((p) => ({ ...p, [k]: v }));
  const lk = lang;

  const canAdd = item.title_ka.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-sm font-semibold text-slate-800">ახალი სერვისის დამატება</p>
            <p className="text-[11px] text-slate-400 mt-0.5">ქართული სათაური სავალდებულოა</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto flex-1 space-y-4">
          <LangTabs value={lang} onChange={setLang} />

          <Field
            label={`სათაური${lk === "ka" ? " *" : ""}`}
            value={(item as unknown as Record<string, string>)[`title_${lk}`]}
            onChange={(v) => up(`title_${lk}` as keyof ServiceItem, v)}
          />
          <Field
            label="აღწერა"
            value={(item as unknown as Record<string, string>)[`desc_${lk}`]}
            onChange={(v) => up(`desc_${lk}` as keyof ServiceItem, v)}
            textarea rows={3}
          />
          <Field
            label="ქვე-სერვისები"
            hint="თითო სტრიქონი = ერთი პუნქტი"
            value={(item as unknown as Record<string, string>)[`subSvcs_${lk}`]}
            onChange={(v) => up(`subSvcs_${lk}` as keyof ServiceItem, v)}
            textarea rows={5}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="text-xs font-medium text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            გაუქმება
          </button>
          <button type="button" onClick={() => canAdd && onAdd(item)} disabled={!canAdd}
            className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Plus size={13} />
            დამატება
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AdminServices() {
  const [loading, setLoading]   = useState(true);
  const [content, setContent]   = useState<ServicesContent>(DEFAULTS);
  const [open, setOpen]         = useState({ hero: true, cards: true, stats: true, teamCta: true });
  const [lang, setLang]         = useState<{ hero: Lang; cards: Lang; stats: Lang; teamCta: Lang }>({
    hero: "ka", cards: "ka", stats: "ka", teamCta: "ka",
  });

  // Cards-specific UI state
  const [expandedIdx, setExpandedIdx]   = useState<number | null>(null);
  const [deletingIdx, setDeletingIdx]   = useState<number | null>(null);
  const [showModal, setShowModal]       = useState(false);

  // Global save state
  const [saving] = useState<string | null>(null);
  const [saved, setSaved]       = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "pages", "services"));
        if (snap.exists()) {
          const d = snap.data() as Partial<ServicesContent>;
          setContent({
            hero:    { ...DEFAULTS.hero,    ...(d.hero    ?? {}) },
            cards:   {
              ...DEFAULTS.cards,
              ...(d.cards ?? {}),
              // preserve items array from Firestore if it exists
              items: (d.cards as CardsSection | undefined)?.items ?? DEFAULTS.cards.items,
            },
            stats:   { ...DEFAULTS.stats,   ...(d.stats   ?? {}) },
            teamCta: { ...DEFAULTS.teamCta, ...(d.teamCta ?? {}) },
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Generic section save ─────────────────────────────────────────────────
  // ── Generic section save (OPTIMISTIC UPDATE) ─────────────────────────────
  const saveSection = (section: keyof ServicesContent) => {
    // 1. მყისიერად ვანთებთ "შენახულია" სტატუსს კლიენტისთვის
    setSaved(section);
    setTimeout(() => setSaved(null), 2500);

    // 2. ფონურად ვუშვებთ Firebase-ში შენახვას (არ ვბლოკავთ UI-ს)
    setDoc(
      doc(db, "pages", "services"),
      { [section]: content[section], updatedAt: serverTimestamp() },
      { merge: true }
    ).catch((err) => {
      // 3. თუ დაქრაშა (ინტერნეტი ჩავარდა), გამოგვაქვს ერორი
      console.error("Firebase Save Error:", err);
      setSaveError("კავშირის შეცდომა! ცვლილება ვერ შეინახა. შეამოწმეთ ინტერნეტი და სცადეთ თავიდან.");
      setTimeout(() => setSaveError(null), 5000);
    });
  };

  // ── Cards auto-save (OPTIMISTIC UPDATE) ──────────────────────────────────
  const autoSaveCards = (updatedCards: CardsSection) => {
    // ფონური შენახვა UI-ის დაბლოკვის გარეშე
    setDoc(
      doc(db, "pages", "services"),
      { cards: updatedCards, updatedAt: serverTimestamp() },
      { merge: true }
    ).catch((err) => {
      console.error("Auto-save Failed:", err);
      setSaveError("ინტერნეტის ხარვეზის გამო სერვისების სია ვერ შეინახა!");
      setTimeout(() => setSaveError(null), 5000);
    });
  };

  // ── Service item handlers ────────────────────────────────────────────────
  const handleAddService = async (newItem: ServiceItem) => {
    const updatedItems = [...content.cards.items, newItem];
    const updatedCards = { ...content.cards, items: updatedItems };
    setContent((p) => ({ ...p, cards: updatedCards }));
    setShowModal(false);
    await autoSaveCards(updatedCards);
  };

  const handleDelete = async (idx: number) => {
    if (deletingIdx !== idx) { setDeletingIdx(idx); return; }
    const updatedItems = content.cards.items.filter((_, i) => i !== idx);
    const updatedCards = { ...content.cards, items: updatedItems };
    setContent((p) => ({ ...p, cards: updatedCards }));
    setDeletingIdx(null);
    if (expandedIdx === idx) setExpandedIdx(null);
    else if (expandedIdx !== null && expandedIdx > idx) setExpandedIdx(expandedIdx - 1);
    await autoSaveCards(updatedCards);
  };

  const updateServiceItem = (idx: number, key: keyof ServiceItem, value: string) => {
    setContent((p) => {
      const items = [...p.cards.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...p, cards: { ...p.cards, items } };
    });
  };

  // ── Simple updaters ──────────────────────────────────────────────────────
  const upHero    = (k: string, v: string) => setContent((p) => ({ ...p, hero:    { ...p.hero,    [k]: v } as HeroSection }));
  const upCards   = (k: string, v: string) => setContent((p) => ({ ...p, cards:   { ...p.cards,   [k]: v } as CardsSection }));
  const upStats   = (k: string, v: string) => setContent((p) => ({ ...p, stats:   { ...p.stats,   [k]: v } as StatsSection }));
  const upTeamCta = (k: string, v: string) => setContent((p) => ({ ...p, teamCta: { ...p.teamCta, [k]: v } as TeamCtaSection }));

  const toggleSection = (s: keyof typeof open) => setOpen((p) => ({ ...p, [s]: !p[s] }));

  const cards   = content.cards   as unknown as Record<string, string>;


const hero    = content.hero    as unknown as Record<string, string>;
  const stats   = content.stats   as unknown as Record<string, string>;
  const teamCta = content.teamCta as unknown as Record<string, string>;

  const hl = lang.hero;
  const cl = lang.cards;
  const sl = lang.stats;
  const tl = lang.teamCta;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="სერვისების გვერდი / კონტენტი">
      <main className="flex-1 p-4 md:p-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">სერვისების გვერდი</h2>
            <p className="text-xs text-slate-400 mt-0.5">საწყისი გვერდი - route: /services</p>
          </div>
          <a href="/services" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors">
            <ExternalLink size={11} />
            საჯარო გვერდი ↗
          </a>
        </div>

        {saveError && (
          <p className="mb-4 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={22} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">

            {/* ══ 1. HERO ══════════════════════════════════════════════════ */}
            <SectionCard
              icon={<Sparkles size={15} />}
              title="მთავარი ბანერი (Hero)" subtitle="გვერდის სათაური და აღწერა"
              isOpen={open.hero} onToggle={() => toggleSection("hero")}
              onSave={() => saveSection("hero")} saving={saving === "hero"} saved={saved === "hero"}
            >
              <LangTabs value={hl} onChange={(l) => setLang((p) => ({ ...p, hero: l }))} />
              <div className="space-y-4">
                <Field label="მცირე ტექსტი (Eyebrow)" value={hero[`eyebrow_${hl}`]} onChange={(v) => upHero(`eyebrow_${hl}`, v)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="მთავარი სათაური (Heading 1)" value={hero[`heading1_${hl}`]} onChange={(v) => upHero(`heading1_${hl}`, v)} />
                  <Field label="ქვესათაური (Heading 2)" value={hero[`heading2_${hl}`]} onChange={(v) => upHero(`heading2_${hl}`, v)} />
                </div>
                <Field label="ვრცელი ტექსტი (Subcopy)" value={hero[`subCopy_${hl}`]} onChange={(v) => upHero(`subCopy_${hl}`, v)} textarea rows={3} />
              </div>
            </SectionCard>

            {/* ══ 2. SERVICE CARDS ════════════════════════════════════════ */}
            <SectionCard
              icon={<LayoutGrid size={15} />}
              title="სერვისების ჩამონათვალი" subtitle={`${content.cards.items.length} სერვისი - დამატება / წაშლა / რედაქტირება`}
              isOpen={open.cards} onToggle={() => toggleSection("cards")}
              onSave={() => saveSection("cards")} saving={saving === "cards"} saved={saved === "cards"}
            >
              {/* Shared labels */}
              <div className="mb-6 pb-6 border-b border-slate-100 space-y-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">საერთო ტექსტები ბარათებისთვის</p>
                <LangTabs value={cl} onChange={(l) => setLang((p) => ({ ...p, cards: l }))} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="ქვე-სერვისების სათაური" value={cards[`subServicesLabel_${cl}`]} onChange={(v) => upCards(`subServicesLabel_${cl}`, v)} />
                  <Field label="ღილაკის ტექსტი (CTA)" value={cards[`cta_${cl}`]} onChange={(v) => upCards(`cta_${cl}`, v)} />
                </div>
              </div>

              {/* Services list */}
              <div className="space-y-2 mb-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  სერვისების სია ({content.cards.items.length})
                </p>

                {content.cards.items.length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">სერვისები არ არის დამატებული.</p>
                )}

                {content.cards.items.map((item, idx) => {
                  const isOpen = expandedIdx === idx;
                  const isDeleting = deletingIdx === idx;
                  const titlePreview = item.title_ka || item.title_en || "უსახელო სერვისი";

                  return (
                    <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                      {/* Row header */}
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50">
                        {/* Index badge */}
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 w-5 text-center">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        {/* Title */}
                        <button type="button" onClick={() => setExpandedIdx(isOpen ? null : idx)}
                          className="flex-1 text-left text-sm font-medium text-slate-700 truncate hover:text-slate-900 transition-colors">
                          {titlePreview}
                        </button>

                        {/* Edit toggle */}
                        <button type="button" onClick={() => setExpandedIdx(isOpen ? null : idx)}
                          className={`text-[10px] font-medium px-2.5 py-1 rounded-md transition-colors shrink-0 ${
                            isOpen ? "bg-slate-200 text-slate-700" : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                          }`}>
                          {isOpen ? "დახურვა" : "რედაქტირება"}
                        </button>

                        {/* Delete */}
                        {isDeleting ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-red-500 font-medium">დარწმუნებული ხართ?</span>
                            <button type="button" onClick={() => handleDelete(idx)}
                              className="text-[10px] font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors">
                              კი
                            </button>
                            <button type="button" onClick={() => setDeletingIdx(null)}
                              className="text-[10px] font-medium text-slate-500 hover:text-slate-800 px-1.5 py-1 rounded transition-colors">
                              არა
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => handleDelete(idx)}
                            className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Edit form - shown when expanded */}
                      {isOpen && (
                        <div className="px-4 py-4 border-t border-slate-100 space-y-4 bg-white">
                          <LangTabs value={cl} onChange={(l) => setLang((p) => ({ ...p, cards: l }))} />
                          <Field
                            label={`სერვისის სათაური (${cl === "ka" ? "ქართული" : cl === "en" ? "English" : "Русский"})`}
                            value={(item as unknown as Record<string, string>)[`title_${cl}`]}
                            onChange={(v) => updateServiceItem(idx, `title_${cl}` as keyof ServiceItem, v)}
                          />
                          <Field
                            label="სერვისის მოკლე აღწერა"
                            value={(item as unknown as Record<string, string>)[`desc_${cl}`]}
                            onChange={(v) => updateServiceItem(idx, `desc_${cl}` as keyof ServiceItem, v)}
                            textarea rows={4}
                          />
                          <Field
                            label="ქვე-სერვისების სია (ბულეტები)"
                            hint="თითო ხაზი (Enter) = ერთი პუნქტი"
                            value={(item as unknown as Record<string, string>)[`subSvcs_${cl}`]}
                            onChange={(v) => updateServiceItem(idx, `subSvcs_${cl}` as keyof ServiceItem, v)}
                            textarea rows={6}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add service button */}
              <button type="button" onClick={() => { setShowModal(true); setDeletingIdx(null); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors">
                <Plus size={14} />
                ახალი სერვისის დამატება
              </button>
            </SectionCard>

            {/* ══ 3. STATS ════════════════════════════════════════════════ */}
            <SectionCard
              icon={<BarChart2 size={15} />}
              title="სტატისტიკის მაჩვენებლები" subtitle="3 ციფრი და მათი აღწერები"
              isOpen={open.stats} onToggle={() => toggleSection("stats")}
              onSave={() => saveSection("stats")} saving={saving === "stats"} saved={saved === "stats"}
            >
              <LangTabs value={sl} onChange={(l) => setLang((p) => ({ ...p, stats: l }))} />
              <div className="space-y-3">
                {([0, 1, 2] as const).map((i) => (
                  <div key={i} className="flex items-end gap-3">
                    <div className="w-24 shrink-0">
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">მაჩვენებელი {i + 1}</label>
                      <input type="text" value={stats[`stat${i}_num`]}
                        onChange={(e) => upStats(`stat${i}_num`, e.target.value)}
                        placeholder="10+" className={inputCls} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        აღწერა ({sl === "ka" ? "ქართული" : sl === "en" ? "English" : "Русский"})
                      </label>
                      <input type="text" value={stats[`stat${i}_label_${sl}`]}
                        onChange={(e) => upStats(`stat${i}_label_${sl}`, e.target.value)}
                        className={inputCls} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ══ 4. TEAM CTA ═════════════════════════════════════════════ */}
            <SectionCard
              icon={<Users size={15} />}
              title="გუნდის ბანერი" subtitle="გვერდის ბოლოს მოწოდება მოქმედებისკენ"
              isOpen={open.teamCta} onToggle={() => toggleSection("teamCta")}
              onSave={() => saveSection("teamCta")} saving={saving === "teamCta"} saved={saved === "teamCta"}
            >
              <LangTabs value={tl} onChange={(l) => setLang((p) => ({ ...p, teamCta: l }))} />
              <div className="space-y-4">
                <Field label="სათაური" value={teamCta[`heading_${tl}`]} onChange={(v) => upTeamCta(`heading_${tl}`, v)} />
                <Field label="ღილაკის ტექსტი" value={teamCta[`button_${tl}`]} onChange={(v) => upTeamCta(`button_${tl}`, v)} />
              </div>
            </SectionCard>

          </div>
        )}
      </main>

      {/* ══ Add-service modal ══════════════════════════════════════════════ */}
      {showModal && (
        <AddServiceModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddService}
        />
      )}
    </AdminLayout>
  );
}