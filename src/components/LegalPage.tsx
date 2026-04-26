// LegalPage.tsx — shared renderer for Terms and Privacy public pages
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useTranslation } from "react-i18next";
import SEO from "./SEO";

type PageKey = "terms" | "privacy";

interface PageContent {
  title_ka: string;
  title_en: string;
  title_ru: string;
  content_ka: string;
  content_en: string;
  content_ru: string;
}

interface Props {
  pageKey: PageKey;
}

export default function LegalPage({ pageKey }: Props) {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "settings", pageKey));
        setContent(snap.exists() ? (snap.data() as PageContent) : null);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [pageKey]);

  const title = content
    ? lang === 'ru' ? (content.title_ru   || content.title_en   || content.title_ka)
    : lang === 'en' ? (content.title_en   || content.title_ka)
    : (content.title_ka || content.title_en)
    : "";

  const body = content
    ? lang === 'ru' ? (content.content_ru || content.content_en || content.content_ka)
    : lang === 'en' ? (content.content_en || content.content_ka)
    : (content.content_ka || content.content_en)
    : "";

  const seoMeta = pageKey === 'privacy'
    ? { title: 'კონფიდენციალობის პოლიტიკა — Balance101', path: '/privacy' as const }
    : { title: 'მომსახურების პირობები — Balance101',      path: '/terms'   as const }

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={seoMeta.title}
        description={title || seoMeta.title}
        path={seoMeta.path}
      />
      <motion.div
        key={i18n.language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-5 md:px-8 pt-8 pb-20"
      >
        {loading ? (
          /* Skeleton loader */
          <div className="space-y-4 animate-pulse pt-6">
            <div className="h-3 w-24 bg-stone-100 rounded" />
            <div className="h-8 w-2/3 bg-stone-100 rounded" />
            <div className="mt-8 space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-3 bg-stone-100 rounded"
                  style={{ width: `${85 + Math.random() * 15}%` }}
                />
              ))}
            </div>
          </div>
        ) : !content || !body ? (
          /* No content yet */
          <div className="pt-16 text-center">
            <p className="text-stone-400 text-sm font-light">
              {lang === 'ru' ? "Содержимое ещё не добавлено." : lang === 'en' ? "Content not available yet." : "შინაარსი ჯერ არ დაემატა."}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-10 pb-6 border-b border-stone-100">
              <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-stone-400 mb-3 block">
                {lang === 'ru' ? "Правовая информация" : lang === 'en' ? "Legal" : "სამართლებრივი ინფორმაცია"}
              </span>
              <h1 className="font-serif text-2xl md:text-3xl text-stone-900 font-normal leading-snug">
                {title}
              </h1>
            </div>

            {/* Body — whitespace-pre-wrap preserves every line break the admin typed */}
            <div className="prose-legal">
              {body.split("\n").map((line, i) =>
                line.trim() === "" ? (
                  /* Blank line → visual gap between sections */
                  <div key={i} className="h-4" />
                ) : (
                  <p
                    key={i}
                    className="text-[14px] md:text-[15px] text-stone-700 font-light leading-relaxed mb-3"
                  >
                    {line}
                  </p>
                )
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
