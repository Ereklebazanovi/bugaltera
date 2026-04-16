// Partners.tsx

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import heroImage from '../assets/partners-hero.webp'
import ConsultationBanner from '../components/ConsultationBanner'
import SEO from '../components/SEO'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Partner {
  id: string
  name_ka: string
  name_en?: string
  description_ka?: string
  description_en?: string
  websiteUrl?: string
  logoUrl: string
  createdAt: { toDate: () => Date } | null
}

// ── Animation variants ────────────────────────────────────────────────────────

const gridStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const cardVariant = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Partners() {
  const { t, i18n } = useTranslation()
  const scrollPosRef = useRef(0); 

  // Pick the correct language field; fall back to Georgian if English is empty.
  const getName = (p: Partner) =>
    i18n.language === 'en' ? (p.name_en || p.name_ka) : p.name_ka
  const getDesc = (p: Partner) =>
    i18n.language === 'en' ? (p.description_en || p.description_ka) : p.description_ka

  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Partner | null>(null)

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setPartners(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Partner, 'id'>) }))
        )
      } finally {
        setLoading(false)
      }
    }
    fetchPartners()
  }, [])

  // Lock body scroll while modal is open
  useEffect(() => {
    if (selected) {
      scrollPosRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosRef.current}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollPosRef.current);
      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = '';
      });
    }
  }, [selected]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <SEO
        title="პარტნიორები — Darchia & Partners"
        description={"გაიცანით Darchia & Partners-ის სანდო პარტნიორები — წამყვანი ორგანიზაციები და კორპორატიული სამართლებრივი პარტნიორობა საქართველოს წამყვან ბანკებთან და ბიზნეს-სტრუქტურებთან."}
        keywords="darchia partners, law firm partners georgia, corporate legal partners, TBC bank legal, AmCham Georgia, სამართლებრივი პარტნიორობა, კორპორატიული სამართალი"
        path="/partners"
      />
      {/* ── Dark full-image hero — left-aligned ───────────────────────────── */}
      <section className="bg-stone-900 overflow-hidden">
        <div className="relative min-h-[55vh] md:min-h-[78vh] flex items-center">

          {/* Background image */}
          <img
            src={heroImage}
            alt={t('partnersPage.hero.imgAlt')}
            className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30" />

          <motion.div
            className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 md:py-16"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              key={i18n.language}
              className="flex flex-col items-start gap-3 md:gap-5 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <motion.p
                className="text-white/60 text-[10px] tracking-[0.35em] uppercase font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {t('partnersPage.hero.eyebrow')}
              </motion.p>

              <motion.h1
                className="font-serif font-medium text-white leading-[1.15] tracking-tight
                           text-3xl md:text-4xl lg:text-5xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {t('partnersPage.hero.heading1')}
              </motion.h1>

              <motion.div
                className="w-10 h-px bg-white/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{ transformOrigin: 'left center' }}
              />

              <motion.p
                className="text-stone-300 text-sm md:text-base font-light leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {t('partnersPage.hero.subCopy')}
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Partner cards grid ────────────────────────────────────────────── */}
      <section className="py-10 md:py-24 px-4 md:px-8 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-72 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : partners.length === 0 ? null : (
            <motion.div
              variants={gridStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10"
            >
              {partners.map((partner) => (
                <motion.div
                  key={partner.id}
                  variants={cardVariant}
                  onClick={() => setSelected(partner)}
                  className="group bg-white rounded-2xl border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                             flex flex-col text-left p-8 md:p-10 lg:p-12 min-h-[260px] md:min-h-[320px]
                             cursor-pointer hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1
                             transition-all duration-400"
                >
                  {/* Logo */}
                  <img
                    src={partner.logoUrl}
                    alt={getName(partner)}
                    loading="lazy"
                    decoding="async"
                    className="h-14 md:h-20 w-auto object-contain object-left mb-auto"
                  />

                  <div>
                    {/* Name */}
                    <h3 className="font-serif text-xl md:text-2xl text-navy-900 font-normal leading-snug mt-8">
                      {getName(partner)}
                    </h3>

                    {/* Description excerpt */}
                    {getDesc(partner) && (
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed mt-4 line-clamp-3">
                        {getDesc(partner)}
                      </p>
                    )}

                    {/* Action indicator */}
                    <span className="mt-8 text-[11px] md:text-xs uppercase tracking-widest text-gold-500 font-semibold block transition-colors group-hover:text-gold-600">
                      {t('partnersPage.viewMore')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Partner detail modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-8 bg-stone-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-5 right-5 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 shadow-sm hover:bg-stone-200 text-stone-600 transition-colors duration-150 cursor-pointer"
                aria-label="დახურვა"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              <div className="overflow-y-auto overscroll-contain p-8 md:p-12 flex flex-col items-center text-center">
                {/* Logo */}
                <div className="w-full h-32 md:h-40 flex items-center justify-center mb-6">
                  <img
                    src={selected.logoUrl}
                    alt={getName(selected)}
                    className="max-w-full h-24 md:h-32 object-contain"
                  />
                </div>

                {/* Name */}
                <h2 className="font-serif text-2xl md:text-3xl text-stone-900 font-normal leading-tight mb-5 pb-5 border-b border-stone-100 w-full">
                  {getName(selected)}
                </h2>

                {/* Description */}
                {getDesc(selected) && (
                  <p className="text-stone-600 text-base font-light leading-relaxed mb-6 whitespace-pre-wrap text-left w-full">
                    {getDesc(selected)}
                  </p>
                )}

                {/* Website link */}
                {selected.websiteUrl && (
                  <a
                    href={selected.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    ვებსაიტზე გადასვლა
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Global CTA Banner ─────────────────────────────────────────────── */}
      <ConsultationBanner />
    </>
  )
}