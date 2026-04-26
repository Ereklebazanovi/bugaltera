// AdminHome.tsx - Structured CMS for the Home page (/)
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Sparkles,
  LayoutTemplate,
  ChevronDown,
  Loader2,
  Check,
  ExternalLink,
} from "lucide-react";

// ── Language ───────────────────────────────────────────────────────────────

type Lang = "ka" | "en" | "ru";

// ── Section shapes ─────────────────────────────────────────────────────────

interface HeroSection {
  eyebrow_ka: string; eyebrow_en: string; eyebrow_ru: string;
  tagline_ka: string; tagline_en: string; tagline_ru: string;
  heading1_ka: string; heading1_en: string; heading1_ru: string;
  heading2_ka: string; heading2_en: string; heading2_ru: string;
  subCopy_ka: string; subCopy_en: string; subCopy_ru: string;
  cta1_ka: string; cta1_en: string; cta1_ru: string;
  cta2_ka: string; cta2_en: string; cta2_ru: string;
  stat0_ka: string; stat0_en: string; stat0_ru: string;
  stat1_ka: string; stat1_en: string; stat1_ru: string;
  stat2_ka: string; stat2_en: string; stat2_ru: string;
  // language-agnostic: same value shown in all languages
  stat0_num: string; stat0_suffix: string;
  stat1_num: string; stat1_suffix: string;
  stat2_num: string; stat2_suffix: string;
}

interface BentoSection {
  langEyebrow_ka: string; langEyebrow_en: string; langEyebrow_ru: string;
  langHeading_ka: string; langHeading_en: string; langHeading_ru: string;
  lang0_ka: string; lang0_en: string; lang0_ru: string;
  lang1_ka: string; lang1_en: string; lang1_ru: string;
  lang2_ka: string; lang2_en: string; lang2_ru: string;
  missionEyebrow_ka: string; missionEyebrow_en: string; missionEyebrow_ru: string;
  missionBody_ka: string; missionBody_en: string; missionBody_ru: string;
}

interface HomeContent {
  hero: HeroSection;
  bento: BentoSection;
}

// ── Smart defaults - mirrors existing JSON translations ────────────────────

const DEFAULTS: HomeContent = {
  hero: {
    eyebrow_ka: "პროფესიული მომსახურება",
    eyebrow_en: "Professional Services",
    eyebrow_ru: "Профессиональные услуги",
    tagline_ka: "თქვენი სანდო პარტნიორი ფინანსურ სტაბილურობაში.",
    tagline_en: "Your Trusted Partner in Financial Stability.",
    tagline_ru: "Ваш надежный партнер в финансовой стабильности.",
    heading1_ka: "ფინანსური სიზუსტე.",
    heading1_en: "Financial Precision.",
    heading1_ru: "Финансовая точность.",
    heading2_ka: "ბიზნესის გარანტირებული ზრდა.",
    heading2_en: "Guaranteed Business Growth.",
    heading2_ru: "Гарантированный рост бизнеса.",
    subCopy_ka:
      "კომპლექსური ბუღალტერია, ბიზნეს ადმინისტრირებისა და იურიდიული მხარდაჭერის სრულ სპექტრი. ვაგვარებთ ურთულეს ამოცანებს, რომ თქვენ ფოკუსირდეთ ბიზნესის განვითარებაზე.",
    subCopy_en:
      "Providing a full spectrum of accounting, business administration, and legal support services. We solve complex challenges so you can focus on growing your business.",
    subCopy_ru:
      "Полный спектр услуг по комплексной бухгалтерии, бизнес-администрированию и юридической поддержке. Мы решаем самые сложные задачи, чтобы вы могли сосредоточиться на развитии бизнеса.",
    cta1_ka: "უფასო კონსულტაცია",
    cta1_en: "Free Consultation",
    cta1_ru: "Бесплатная консультация",
    cta2_ka: "ჩვენი სერვისები",
    cta2_en: "Our Services",
    cta2_ru: "Наши услуги",
    stat0_ka: "წლიანი პროფესიული გამოცდილება",
    stat0_en: "Years of Professional Experience",
    stat0_ru: "Лет профессионального опыта",
    stat1_ka: "კმაყოფილი პარტნიორი კომპანია",
    stat1_en: "Satisfied Partner Companies",
    stat1_ru: "Довольных компаний-партнеров",
    stat2_ka: "წარმატებით დასრულებული აუდიტი",
    stat2_en: "Successfully Completed Audits",
    stat2_ru: "Успешно проведенных аудитов",
    stat0_num: "10", stat0_suffix: "+",
    stat1_num: "50", stat1_suffix: "+",
    stat2_num: "10", stat2_suffix: "+",
  },
  bento: {
    langEyebrow_ka: "მომსახურების ენები",
    langEyebrow_en: "Languages of Service",
    langEyebrow_ru: "Языки обслуживания",
    langHeading_ka: "ვემსახურებით სამ ენაზე",
    langHeading_en: "We Serve in Three Languages",
    langHeading_ru: "Обслуживаем на трех языках",
    lang0_ka: "ქართული",
    lang0_en: "Georgian",
    lang0_ru: "Грузинский",
    lang1_ka: "ინგლისური",
    lang1_en: "English",
    lang1_ru: "Английский",
    lang2_ka: "რუსული",
    lang2_en: "Russian",
    lang2_ru: "Русский",
    missionEyebrow_ka: "ჩვენი მისია",
    missionEyebrow_en: "Our Mission",
    missionEyebrow_ru: "Наша миссия",
    missionBody_ka:
      "ჩვენი მისიაა კლიენტებს შევთავაზოთ სრულყოფილი და სანდო პროფესიული მომსახურება, რომელიც უზრუნველყოფს მათი საქმიანობის ზრდას, სტაბილურობასა და კანონმდებლობასთან შესაბამისობას. ჩვენი წარმატების საზომი კლიენტის ნდობა და კმაყოფილებაა.",
    missionBody_en:
      "Our mission is to offer clients comprehensive and reliable professional services that ensure the growth, stability, and regulatory compliance of their operations. The measure of our success is the trust and satisfaction of our clients.",
    missionBody_ru:
      "Наша миссия — предложить клиентам безупречное и надежное профессиональное обслуживание, обеспечивающее рост, стабильность и соответствие их деятельности законодательству. Мерило нашего успеха — доверие и удовлетворенность клиента.",
  },
};

// ── Shared input styles ────────────────────────────────────────────────────

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition";

// ── Field ─────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  hint?: string;
}

function Field({ label, value, onChange, textarea, rows = 3, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {hint && (
          <span className="text-slate-400 font-normal ml-1.5">- {hint}</span>
        )}
      </label>
      {textarea ? (
        <textarea
          rows={rows}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} resize-y leading-relaxed`}
        />
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}

// ── Language tabs ──────────────────────────────────────────────────────────

function LangTabs({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-5">
      {(["ka", "en", "ru"] as Lang[]).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => onChange(lng)}
          className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${
            value === lng
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {lng === "ka" ? "ქართული" : lng === "en" ? "English" : "Русский"}
        </button>
      ))}
    </div>
  );
}

// ── Section accordion card ─────────────────────────────────────────────────

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  children: ReactNode;
}

function SectionCard({
  icon,
  title,
  subtitle,
  isOpen,
  onToggle,
  onSave,
  saving,
  saved,
  children,
}: SectionCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        {/* Clickable toggle area */}
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 flex items-center gap-3 text-left min-w-0"
        >
          <ChevronDown
            size={15}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
          />
          <span className="text-slate-300 shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {title}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
          </div>
        </button>

        {/* Save button - stopPropagation so it doesn't toggle the card */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          disabled={saving}
          className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {saving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : saved ? (
            <Check size={12} />
          ) : null}
          {saved ? "შენახულია!" : "შენახვა"}
        </button>
      </div>

      {/* Collapsible body */}
      {isOpen && (
        <div className="px-4 md:px-6 py-5">{children}</div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<HomeContent>(DEFAULTS);
  const [open, setOpen] = useState({ hero: true, bento: true });
  const [lang, setLang] = useState<{ hero: Lang; bento: Lang }>({
    hero: "ka",
    bento: "ka",
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Load from Firestore on mount ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "pages", "home"));
        if (snap.exists()) {
          const d = snap.data() as Partial<HomeContent>;
          setContent({
            hero: { ...DEFAULTS.hero, ...(d.hero ?? {}) },
            bento: { ...DEFAULTS.bento, ...(d.bento ?? {}) },
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Save one section (merge so other sections are untouched) ─────────────
  const saveSection = async (section: keyof HomeContent) => {
    setSaving(section);
    setSaveError(null);
    try {
      await setDoc(
        doc(db, "pages", "home"),
        { [section]: content[section], updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSaved(section);
      setTimeout(() => setSaved(null), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "შეცდომა მოხდა.");
    } finally {
      setSaving(null);
    }
  };

  // ── Per-section updaters ─────────────────────────────────────────────────
  const updateHero = (key: string, value: string) =>
    setContent((p) => ({ ...p, hero: { ...p.hero, [key]: value } as HeroSection }));
  const updateBento = (key: string, value: string) =>
    setContent((p) => ({ ...p, bento: { ...p.bento, [key]: value } as BentoSection }));

  const toggleSection = (s: keyof typeof open) =>
    setOpen((p) => ({ ...p, [s]: !p[s] }));

  // Dynamic field accessors (safe cast - keys are always valid)
const hero = content.hero as unknown as Record<string, string>;
  const bento = content.bento as unknown as Record<string, string>;

  const h = lang.hero;
  const b = lang.bento;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout title="მთავარი გვერდი / კონტენტი">
      <main className="flex-1 p-4 md:p-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              მთავარი გვერდი
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              საწყისი გვერდი - Route: /
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ExternalLink size={11} />
            საჯარო გვერდი ↗
          </a>
        </div>

        {/* Error banner */}
        {saveError && (
          <p className="mb-4 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {saveError}
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={22} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">

            {/* ══════════════════════════════════════════════════════════
                1.  HERO SECTION
            ══════════════════════════════════════════════════════════ */}
            <SectionCard
              icon={<Sparkles size={15} />}
              title="მთავარი ბანერი (Hero)"
              subtitle="პირველი ეკრანი და მთავარი სათაურები"
              isOpen={open.hero}
              onToggle={() => toggleSection("hero")}
              onSave={() => saveSection("hero")}
              saving={saving === "hero"}
              saved={saved === "hero"}
            >
              <LangTabs
                value={h}
                onChange={(l) => setLang((p) => ({ ...p, hero: l }))}
              />

              <div className="space-y-4">
                {/* Row 1 */}
                <Field
                  label="მცირე ტექსტი (Eyebrow)"
                  hint="ტექსტი მთავარი სათაურის ზემოთ"
                  value={hero[`eyebrow_${h}`]}
                  onChange={(v) => updateHero(`eyebrow_${h}`, v)}
                />
                <Field
                  label="სლოგანი (Tagline)"
                  hint="მოკლე აღწერილობითი ტექსტი"
                  value={hero[`tagline_${h}`]}
                  onChange={(v) => updateHero(`tagline_${h}`, v)}
                />

                {/* Headings in a 2-col grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="მთავარი სათაური (Heading 1)"
                    value={hero[`heading1_${h}`]}
                    onChange={(v) => updateHero(`heading1_${h}`, v)}
                  />
                  <Field
                    label="ქვესათაური (Heading 2)"
                    value={hero[`heading2_${h}`]}
                    onChange={(v) => updateHero(`heading2_${h}`, v)}
                  />
                </div>

                <Field
                  label="ვრცელი ტექსტი (Subcopy)"
                  hint="აღწერა სათაურების ქვემოთ"
                  value={hero[`subCopy_${h}`]}
                  onChange={(v) => updateHero(`subCopy_${h}`, v)}
                  textarea
                  rows={3}
                />

                {/* CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="მთავარი ღილაკი (CTA 1)"
                    value={hero[`cta1_${h}`]}
                    onChange={(v) => updateHero(`cta1_${h}`, v)}
                  />
                  <Field
                    label="მეორადი ღილაკი (CTA 2)"
                    value={hero[`cta2_${h}`]}
                    onChange={(v) => updateHero(`cta2_${h}`, v)}
                  />
                </div>

                {/* Trust stats */}
                <div className="pt-2 space-y-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    სტატისტიკის მაჩვენებლები
                  </p>

                  {/* Numbers — language-agnostic, always visible */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <p className="text-[11px] text-slate-400 font-medium">
                      ციფრები და სუფიქსები — ყველა ენაზე ერთნაირია
                    </p>
                    {([0, 1, 2] as const).map((i) => (
                      <div key={i} className="flex items-end gap-3">
                        <div className="w-24 shrink-0">
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            სტატ {i + 1} — ციფრი
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={hero[`stat${i}_num`]}
                            onChange={(e) => updateHero(`stat${i}_num`, e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                          />
                        </div>
                        <div className="w-20 shrink-0">
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            სუფიქსი
                          </label>
                          <input
                            type="text"
                            value={hero[`stat${i}_suffix`]}
                            onChange={(e) => updateHero(`stat${i}_suffix`, e.target.value)}
                            placeholder="+"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            ლეიბლი ({h === "ka" ? "ქართული" : h === "en" ? "English" : "Русский"})
                          </label>
                          <input
                            type="text"
                            value={hero[`stat${i}_${h}`]}
                            onChange={(e) => updateHero(`stat${i}_${h}`, e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ══════════════════════════════════════════════════════════
                2.  BENTO GRID SECTION
            ══════════════════════════════════════════════════════════ */}
            <SectionCard
              icon={<LayoutTemplate size={15} />}
              title="ენები და მისია (Bento Grid)"
              subtitle="საინფორმაციო ბლოკი ენების და მომსაურების შესახებ"
              isOpen={open.bento}
              onToggle={() => toggleSection("bento")}
              onSave={() => saveSection("bento")}
              saving={saving === "bento"}
              saved={saved === "bento"}
            >
              <LangTabs
                value={b}
                onChange={(l) => setLang((p) => ({ ...p, bento: l }))}
              />

              <div className="space-y-4">
                {/* Languages subsection */}
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  ენების სექცია (მარცხენა სვეტი)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="სექციის მცირე სათაური"
                    value={bento[`langEyebrow_${b}`]}
                    onChange={(v) => updateBento(`langEyebrow_${b}`, v)}
                  />
                  <Field
                    label="სექციის მთავარი სათაური"
                    value={bento[`langHeading_${b}`]}
                    onChange={(v) => updateBento(`langHeading_${b}`, v)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field
                    label="ენა 1"
                    value={bento[`lang0_${b}`]}
                    onChange={(v) => updateBento(`lang0_${b}`, v)}
                  />
                  <Field
                    label="ენა 2"
                    value={bento[`lang1_${b}`]}
                    onChange={(v) => updateBento(`lang1_${b}`, v)}
                  />
                  <Field
                    label="ენა 3"
                    value={bento[`lang2_${b}`]}
                    onChange={(v) => updateBento(`lang2_${b}`, v)}
                  />
                </div>

                {/* Mission subsection */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    მისიის სექცია (მარჯვენა სვეტი)
                  </p>
                  <Field
                    label="მისიის სათაური"
                    value={bento[`missionEyebrow_${b}`]}
                    onChange={(v) => updateBento(`missionEyebrow_${b}`, v)}
                  />
                  <Field
                    label="მისიის აღწერა"
                    value={bento[`missionBody_${b}`]}
                    onChange={(v) => updateBento(`missionBody_${b}`, v)}
                    textarea
                    rows={4}
                  />
                </div>
              </div>
            </SectionCard>

          </div>
        )}
      </main>
    </AdminLayout>
  );
}