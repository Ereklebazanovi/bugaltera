// AdminAbout.tsx - Structured CMS for the About page (/about)
// Saves to Firestore: collection "pages", doc "about"
import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  Sparkles,
  Info,
  CheckCircle,
  Gem,
  ChevronDown,
  Loader2,
  Check,
  ExternalLink,
} from "lucide-react";

type Lang = "ka" | "en" | "ru";

// ── Types ──────────────────────────────────────────────────────────────────
interface ArrayItem {
  title_ka: string; title_en: string; title_ru: string;
  desc_ka: string;  desc_en: string;  desc_ru: string;
}

interface AboutContent {
  hero: Record<string, string>;
  intro: Record<string, string>;
  whyUs: {
    eyebrow_ka: string; eyebrow_en: string; eyebrow_ru: string;
    heading_ka: string; heading_en: string; heading_ru: string;
    bullets: ArrayItem[];
  };
  values: {
    eyebrow_ka: string; eyebrow_en: string; eyebrow_ru: string;
    heading_ka: string; heading_en: string; heading_ru: string;
    items: ArrayItem[];
  };
}

// ── Smart Defaults (Merged from exact JSON files) ──────────────────────────
const DEFAULTS: AboutContent = {
  hero: {
    eyebrow_ka: "ჩვენ შესახებ", eyebrow_en: "About Us", eyebrow_ru: "О нас",
    heading1_ka: "პროფესიონალიზმი და", heading1_en: "Professionalism and", heading1_ru: "Профессионализм и",
    heading2_ka: "შედეგზე ორიენტირებული გადაწყვეტილებები", heading2_en: "Results-Oriented Solutions", heading2_ru: "решения, ориентированные на результат",
  },
  intro: {
    eyebrow_ka: "კომპანიის შესახებ", eyebrow_en: "About the Firm", eyebrow_ru: "О компании",
    heading_ka: "ვინ ვართ ჩვენ", heading_en: "Who We Are", heading_ru: "Кто мы",
    body_ka: "ბალანსი 101 არის პროფესიული მომსახურების კომპანია, რომელიც სპეციალიზებულია კომპლექსურ ბუღალტერიულ მომსახრუებაში, ბიზნეს ადმინისტრაციასა და იურიდიულ მხარდაჭერაში. ჩვენი მიზანია შევთავაზოთ კლიენტებს სრულყოფილი და სანდო მომსახურება, რომელიც უზრუნველყოფს მათი საქმიანობის ზრდას, სტაბილურობასა და კანონმდებლობასთან შესაბამისობას.",
    body_en: "Balance101 is a professional services company specialising in accounting, business administration, and legal support. Our goal is to offer clients comprehensive and reliable services that ensure the growth, stability, and regulatory compliance of their operations.",
    body_ru: "«Баланс 101» — это компания, предоставляющая профессиональные услуги, специализирующаяся на комплексном бухгалтерском обслуживании, бизнес-администрировании и юридической поддержке. Наша цель — предложить клиентам безупречное и надежное обслуживание, обеспечивающее рост, стабильность и соответствие их деятельности законодательству.",
  },
  whyUs: {
    eyebrow_ka: "ჩვენი უპირატესობები", eyebrow_en: "Our Strengths", eyebrow_ru: "Наши преимущества",
    heading_ka: "რატომ ჩვენი გუნდი?", heading_en: "Why Choose Our Team?", heading_ru: "Почему наша команда?",
    bullets: [
      {
        title_ka: "კომპლექსური მომსახურება", title_en: "Comprehensive Service", title_ru: "Комплексное обслуживание",
        desc_ka: "ბუღალტრიდან ბიზნეს ადმინისტრირებამდე და იურიდიულ კონსულტაციამდე - ყველა საჭირო სერვისი ერთ სივრცეში, დროისა და რესურსის დაზოგვით.", desc_en: "From accounting to business administration and legal consulting - all the services you need in one place, saving your time and resources.", desc_ru: "От бухгалтерии до бизнес-администрирования и юридических консультаций — все необходимые услуги в одном пространстве, экономя ваше время и ресурсы."
      },
      {
        title_ka: "მრავალწლიანი გამოცდილება", title_en: "Years of Experience", title_ru: "Многолетний опыт",
        desc_ka: "ჩვენი გუნდი აერთიანებს მაღალი კვალიფიკაციის სპეციალისტებს, რომელთა პრაქტიკული გამოცდილება უზრუნველყოფს კლიენტის ბიზნესის მაქსიმალურ ეფექტურობას.", desc_en: "Our team brings together highly qualified specialists whose practical expertise ensures maximum efficiency for every client's business.", desc_ru: "Наша команда объединяет высококвалифицированных специалистов, практический опыт которых обеспечивает максимальную эффективность бизнеса клиента."
      },
      {
        title_ka: "კანონმდებლობასთან შესაბამისობა", title_en: "Regulatory Compliance", title_ru: "Соответствие законодательству",
        desc_ka: "მუდმივად ვადევნებთ თვალს კანონმდებლობის ცვლილებებს და ვუზრუნველყოფთ, რომ კლიენტის საქმიანობა ყოველთვის შესაბამისობაში იყოს მოქმედ მოთხოვნებთან.", desc_en: "We continuously monitor legislative changes and ensure that our clients' operations remain fully compliant with current requirements.", desc_ru: "Мы постоянно следим за изменениями в законодательстве и гарантируем, что деятельность клиента всегда соответствует действующим требованиям."
      },
      {
        title_ka: "ინდივიდუალური მიდგომა", title_en: "Individual Approach", title_ru: "Индивидуальный подход",
        desc_ka: "ყოველი კლიენტი უნიკალურია. ჩვენ ვამზადებთ მორგებულ სტრატეგიებს, რომლებიც ზუსტად პასუხობს კონკრეტული ბიზნესის საჭიროებებსა და მიზნებს.", desc_en: "Every client is unique. We develop tailored strategies that precisely address the specific needs and goals of each business.", desc_ru: "Каждый клиент уникален. Мы разрабатываем индивидуальные стратегии, которые точно отвечают потребностям и целям конкретного бизнеса."
      }
    ]
  },
  values: {
    eyebrow_ka: "ჩვენი ღირებულებები", eyebrow_en: "Our Values", eyebrow_ru: "Наши ценности",
    heading_ka: "ჩვენი საქმიანობა ეფუძნება სამ ფუნდამენტურ პრინციპს", heading_en: "Three Principles That Guide Everything We Do", heading_ru: "Наша деятельность основывается на трех фундаментальных принципах",
    items: [
      {
        title_ka: "კონფიდენციალობა", title_en: "Confidentiality", title_ru: "Конфиденциальность",
        desc_ka: "კლიენტის მიერ მოწოდებული ნებისმიერი ინფორმაციის ხელშეუხებლობა ჩვენი უპირატესი მოვალეობაა.", desc_en: "The inviolability of all information provided by our clients is our foremost obligation.", desc_ru: "Неприкосновенность любой информации, предоставленной клиентом, является нашей первостепенной обязанностью."
      },
      {
        title_ka: "პროფესიული ეთიკა", title_en: "Professional Ethics", title_ru: "Профессиональная этика",
        desc_ka: "ჩვენ ვმოქმედებთ პროფესიული ეთიკის უმაღლესი სტანდარტების დაცვით, რაც განაპირობებს ჩვენს მიმართ მაღალ ნდობას.", desc_en: "We operate in strict adherence to the highest standards of professional ethics, which is the foundation of the trust our clients place in us.", desc_ru: "Мы действуем с соблюдением высочайших стандартов профессиональной этики, что обуславливает высокий уровень доверия к нам."
      },
      {
        title_ka: "შედეგზე ორიენტირებულობა", title_en: "Results-Oriented", title_ru: "Ориентированность на результат",
        desc_ka: "ჩვენი წარმატების საზომი კლიენტის ბიზნესის ზრდა და სტაბილურობაა. ყოველ გადაწყვეტილებას ვიღებთ ამ მიზნის გათვალისწინებით.", desc_en: "The growth and stability of our clients' businesses is our measure of success. Every decision we make is guided by this goal.", desc_ru: "Мерилом нашего успеха является рост и стабильность бизнеса клиента. Каждое решение мы принимаем с учетом этой цели."
      }
    ]
  }
};

// ── UI Components ──────────────────────────────────────────────────────────
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

function LangTabs({ value, onChange }: { value: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-5">
      {(["ka", "en", "ru"] as Lang[]).map((lng) => (
        <button key={lng} type="button" onClick={() => onChange(lng)}
          className={`text-xs px-4 py-1.5 rounded-md transition-colors font-medium ${value === lng ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          {lng === "ka" ? "ქართული" : lng === "en" ? "English" : "Русский"}
        </button>
      ))}
    </div>
  );
}

function SectionCard({ icon, title, subtitle, isOpen, onToggle, onSave, saved, children }: any) {
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
        <button type="button" onClick={(e) => { e.stopPropagation(); onSave(); }}
          className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors shrink-0">
          {saved ? <Check size={12} /> : null}
          {saved ? "შენახულია!" : "შენახვა"}
        </button>
      </div>
      {isOpen && <div className="px-4 md:px-6 py-5">{children}</div>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<AboutContent>(DEFAULTS);
  const [open, setOpen] = useState({ hero: true, intro: true, whyUs: false, values: false });
  const [lang, setLang] = useState({ hero: "ka" as Lang, intro: "ka" as Lang, whyUs: "ka" as Lang, values: "ka" as Lang });
  
  const [saved, setSaved] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getDoc(doc(db, "pages", "about")).then((snap) => {
      if (snap.exists()) {
        const d = snap.data() as Partial<AboutContent>;
        setContent({
          hero: { ...DEFAULTS.hero, ...(d.hero || {}) },
          intro: { ...DEFAULTS.intro, ...(d.intro || {}) },
          whyUs: { ...DEFAULTS.whyUs, ...(d.whyUs || {}) },
          values: { ...DEFAULTS.values, ...(d.values || {}) },
        });
      }
      setLoading(false);
    });
  }, []);

  // OPTIMISTIC SAVE
  const saveSection = (section: keyof AboutContent) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
    setDoc(doc(db, "pages", "about"), { [section]: content[section], updatedAt: serverTimestamp() }, { merge: true })
      .catch(() => {
        setSaveError("კავშირის შეცდომა! შეამოწმეთ ინტერნეტი.");
        setTimeout(() => setSaveError(null), 5000);
      });
  };

  const updateField = (section: keyof AboutContent, key: string, value: string) => {
    setContent((p) => ({ ...p, [section]: { ...p[section], [key]: value } }));
  };

 const updateArrayItem = (section: "whyUs" | "values", arrKey: "bullets" | "items", idx: number, key: string, value: string) => {
    setContent((p) => {
      const sectionData = p[section] as any;
      const newArr = [...sectionData[arrKey]];
      newArr[idx] = { ...newArr[idx], [key]: value };
      return { ...p, [section]: { ...sectionData, [arrKey]: newArr } };
    });
  };

  const toggleSection = (s: keyof typeof open) => setOpen((p) => ({ ...p, [s]: !p[s] }));

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-slate-400" /></div>;

  const { hero, intro, whyUs, values } = content;
  const { hero: hl, intro: il, whyUs: wl, values: vl } = lang;

  return (
    <AdminLayout title="ჩვენ შესახებ / კონტენტი">
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">ჩვენ შესახებ (About)</h2>
            <p className="text-xs text-slate-400 mt-0.5">route: /about</p>
          </div>
          <a href="/about" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700">
            <ExternalLink size={11} /> საჯარო გვერდი ↗
          </a>
        </div>

        {saveError && <p className="mb-4 text-xs text-white bg-red-500 rounded-lg px-3 py-2">{saveError}</p>}

        <div className="max-w-3xl space-y-4">
          {/* 1. HERO */}
          <SectionCard icon={<Sparkles size={15}/>} title="მთავარი ბანერი (Hero)" subtitle="პირველი ეკრანის ტექსტები" isOpen={open.hero} onToggle={() => toggleSection("hero")} onSave={() => saveSection("hero")} saved={saved === "hero"}>
            <LangTabs value={hl} onChange={(l) => setLang(p => ({...p, hero: l}))} />
            <div className="space-y-4">
              <Field label="მცირე ტექსტი (Eyebrow)" value={hero[`eyebrow_${hl}`]} onChange={(v) => updateField("hero", `eyebrow_${hl}`, v)} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="სათაური ნაწილი 1" value={hero[`heading1_${hl}`]} onChange={(v) => updateField("hero", `heading1_${hl}`, v)} />
                <Field label="სათაური ნაწილი 2" value={hero[`heading2_${hl}`]} onChange={(v) => updateField("hero", `heading2_${hl}`, v)} />
              </div>
            </div>
          </SectionCard>

          {/* 2. INTRO */}
          <SectionCard icon={<Info size={15}/>} title="შესავალი (Intro)" subtitle="ვინ ვართ ჩვენ" isOpen={open.intro} onToggle={() => toggleSection("intro")} onSave={() => saveSection("intro")} saved={saved === "intro"}>
            <LangTabs value={il} onChange={(l) => setLang(p => ({...p, intro: l}))} />
            <div className="space-y-4">
              <Field label="მცირე სათაური" value={intro[`eyebrow_${il}`]} onChange={(v) => updateField("intro", `eyebrow_${il}`, v)} />
              <Field label="მთავარი სათაური" value={intro[`heading_${il}`]} onChange={(v) => updateField("intro", `heading_${il}`, v)} />
              <Field label="ვრცელი ტექსტი (აღწერა)" value={intro[`body_${il}`]} onChange={(v) => updateField("intro", `body_${il}`, v)} textarea rows={5} />
            </div>
          </SectionCard>

          {/* 3. WHY US */}
          <SectionCard icon={<CheckCircle size={15}/>} title="რატომ ჩვენ? (უპირატესობები)" subtitle="4 ფიქსირებული ბლოკი" isOpen={open.whyUs} onToggle={() => toggleSection("whyUs")} onSave={() => saveSection("whyUs")} saved={saved === "whyUs"}>
            <LangTabs value={wl} onChange={(l) => setLang(p => ({...p, whyUs: l}))} />
            <div className="space-y-4 mb-6 border-b border-slate-100 pb-6">
              <Field label="სექციის მცირე სათაური" value={whyUs[`eyebrow_${wl}`]} onChange={(v) => updateField("whyUs", `eyebrow_${wl}`, v)} />
              <Field label="სექციის მთავარი სათაური" value={whyUs[`heading_${wl}`]} onChange={(v) => updateField("whyUs", `heading_${wl}`, v)} />
            </div>
            <div className="space-y-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">უპირატესობა {i + 1}</p>
                  <Field label="სათაური" value={whyUs.bullets[i]?.[`title_${wl}` as keyof ArrayItem]} onChange={(v) => updateArrayItem("whyUs", "bullets", i, `title_${wl}`, v)} />
                  <Field label="აღწერა" value={whyUs.bullets[i]?.[`desc_${wl}` as keyof ArrayItem]} onChange={(v) => updateArrayItem("whyUs", "bullets", i, `desc_${wl}`, v)} textarea rows={2} />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 4. VALUES */}
          <SectionCard icon={<Gem size={15}/>} title="ჩვენი ფასეულობები" subtitle="3 ფიქსირებული ღირებულება" isOpen={open.values} onToggle={() => toggleSection("values")} onSave={() => saveSection("values")} saved={saved === "values"}>
            <LangTabs value={vl} onChange={(l) => setLang(p => ({...p, values: l}))} />
            <div className="space-y-4 mb-6 border-b border-slate-100 pb-6">
              <Field label="სექციის მცირე სათაური" value={values[`eyebrow_${vl}`]} onChange={(v) => updateField("values", `eyebrow_${vl}`, v)} />
              <Field label="სექციის მთავარი სათაური" value={values[`heading_${vl}`]} onChange={(v) => updateField("values", `heading_${vl}`, v)} />
            </div>
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">ფასეულობა {i + 1}</p>
                  <Field label="სათაური" value={values.items[i]?.[`title_${vl}` as keyof ArrayItem]} onChange={(v) => updateArrayItem("values", "items", i, `title_${vl}`, v)} />
                  <Field label="აღწერა" value={values.items[i]?.[`desc_${vl}` as keyof ArrayItem]} onChange={(v) => updateArrayItem("values", "items", i, `desc_${vl}`, v)} textarea rows={2} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </main>
    </AdminLayout>
  );
}