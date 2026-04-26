// Partners.tsx — refactored to "Clients We Serve" logo grid

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  logoUrl: string
  createdAt: { toDate: () => Date } | null
}

// ── Animation variants ────────────────────────────────────────────────────────////

const gridStagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}

const logoVariant = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Partners() {
  const { t, i18n } = useTranslation()

  const getName = (p: Partner) =>
    i18n.language === 'en' ? (p.name_en || p.name_ka) : p.name_ka

  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <>
      <SEO
        title="კლიენტები — Balance101 • ბალანსი 101"
        description="გაიცანით კომპანიები, რომლებსაც Balance101 ემსახურება — საქართველოს წამყვანი ბიზნეს-სტრუქტურები და ორგანიზაციები."
        keywords="balance101 clients, accounting firm clients georgia, კლიენტები, მომსახურე კომპანიები, ბუღალტრული მომსახურება"
        path="/partners"
      />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-stone-900 overflow-hidden">
        <div className="relative min-h-[55vh] md:min-h-[78vh] flex items-center">
          <img
            src={heroImage}
            alt={t('partnersPage.hero.imgAlt')}
            className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
            loading="eager"
            decoding="async"
          />
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

      {/* ── Clients logo grid ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-stone-50">
        <div className="max-w-6xl mx-auto">

          {/* Section heading */}
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12 md:mb-16"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-5 h-px bg-stone-400 shrink-0" />
              <span className="text-stone-500 text-[10px] tracking-[0.35em] uppercase font-medium">
                {i18n.language === 'en' ? 'Our Clients' : 'ჩვენი კლიენტები3'}
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 font-normal">
              {i18n.language === 'en' ? 'Trusted By' : 'ჩვენ გვენდობიან'}
            </h2>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {Array.from({ length: 12 }).map((_, n) => (
                <div key={n} className="bg-white rounded-xl aspect-3/2 animate-pulse border border-stone-100" />
              ))}
            </div>
          ) : partners.length === 0 ? null : (
            <motion.div
              variants={gridStagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4"
            >
              {partners.map((partner) => (
                <motion.div
                  key={partner.id}
                  variants={logoVariant}
                  className="group bg-white rounded-xl border border-stone-100 shadow-sm
                             flex items-center justify-center p-4 md:p-5 aspect-3/2
                             hover:shadow-md hover:border-stone-200 transition-all duration-300"
                >
                  <img
                    src={partner.logoUrl}
                    alt={getName(partner)}
                    loading="lazy"
                    decoding="async"
                    className="max-h-9 md:max-h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </section>

      <ConsultationBanner />
    </>
  )
}
