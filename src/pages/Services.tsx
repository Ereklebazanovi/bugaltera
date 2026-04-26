import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Scale, ShieldCheck, Gavel, BookOpen, Briefcase, ArrowRight } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import ConsultationBanner from '../components/ConsultationBanner'
import SEO from '../components/SEO'
import { Helmet } from 'react-helmet-async'
import practiceHero from '../assets/practice-hero.webp'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ServiceItem {
  title_ka: string; title_en: string; title_ru: string;
  desc_ka: string;  desc_en: string;  desc_ru: string;
  subSvcs_ka: string; subSvcs_en: string; subSvcs_ru: string;
}

interface ServicesCms {
  hero:    Record<string, string>
  cards: {
    subServicesLabel_ka: string; subServicesLabel_en: string; subServicesLabel_ru: string;
    cta_ka: string; cta_en: string; cta_ru: string;
    items?: ServiceItem[]
  }
  stats:   Record<string, string>
  teamCta: Record<string, string>
}

// ── Icons cycled by index ────────────────────────────────────────────────────

const SERVICE_ICONS = [Scale, ShieldCheck, Gavel, BookOpen, Briefcase]
const FALLBACK_STAT_NUMS = ['10+', '100+', '50+']

// ── CMS helper ───────────────────────────────────────────────────────────────

function firestoreLang(i18nLang: string): string {
  return i18nLang === 'ge' ? 'ka' : i18nLang
}

// ── Animations ───────────────────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Services() {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [cms, setCms] = useState<ServicesCms | null>(null)
  const { hash } = useLocation()
  const { t, i18n } = useTranslation()

  // Fetch CMS overrides
  useEffect(() => {
    getDoc(doc(db, 'pages', 'services'))
      .then((snap) => {
        if (snap.exists()) {
          setCms(snap.data() as ServicesCms)
        }
      })
      .catch((err) => console.error("CMS Fetch Error:", err))
  }, [])

  const lk = firestoreLang(i18n.language)

  // Generic CMS field reader
  const c = (section: 'hero' | 'stats' | 'teamCta', key: string, fallback: string) =>
    (cms?.[section] as Record<string, string> | undefined)?.[`${key}_${lk}`] || fallback

  // cards shared labels 
  const cCards = (key: string, fallback: string) =>
    (cms?.cards as Record<string, string> | undefined)?.[`${key}_${lk}`] || fallback

  // i18n baseline arrays 
  const i18nServices = t('servicesPage.services', { returnObjects: true }) as Array<{
    title: string; desc: string; subServices: string[]
  }>
  const i18nStats = t('servicesPage.stats', { returnObjects: true }) as Array<{ label: string }>

  // Resolved service list — CMS items array takes full precedence when present
  const dbItems = cms?.cards?.items;
  const services = Array.isArray(dbItems)
    ? dbItems.map((item) => {
        const r = item as unknown as Record<string, string>
        return {
          title:       r[`title_${lk}`] || item.title_ka || 'უსახელო სერვისი',
          desc:        r[`desc_${lk}`]  || item.desc_ka  || '',
          subServices: (r[`subSvcs_${lk}`] || item.subSvcs_ka || '').split('\n').filter(Boolean),
        }
      })
    : i18nServices.map((s) => ({ title: s.title, desc: s.desc, subServices: s.subServices }))

  // Resolved stats
  const statNums = ([0, 1, 2] as const).map(
    (i) => (cms?.stats as Record<string, string> | undefined)?.[`stat${i}_num`] || FALLBACK_STAT_NUMS[i]
  )
  const statLabels = ([0, 1, 2] as const).map(
    (i) => c('stats', `stat${i}_label`, i18nStats[i]?.label ?? '')
  )

  // Scroll to the specific service card
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    window.scrollTo({ top: 0, behavior: 'instant' })
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 450)
    return () => clearTimeout(timer)
  }, [hash])

  return (
    <>
      <SEO
        title="ფინანსური სერვისები — Balance101 • ბალანსი 101"
        description="ბუღალტრული აღრიცხვა, საგადასახადო კონსულტაცია, ფინანსური აუდიტი და კონსულტაცია. კვალიფიციური სპეციალისტები თბილისში — მიიღეთ პროფესიონალური კონსულტაცია."
        keywords="financial services georgia, accounting tbilisi, tax consulting georgia, bookkeeping tbilisi, financial audit georgia, balance101 services"
        path="/services"
        canonical="https://www.balance101.ge/services"
      />
      <Helmet>
        <link rel="preload" as="image" type="image/webp" href={practiceHero} />
      </Helmet>

      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-32 md:pb-44 min-h-[60vh] md:min-h-[68vh] flex flex-col justify-end bg-stone-900">

        <img
          src={practiceHero}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          aria-hidden="true"
          onLoad={() => setIsImageLoaded(true)}
        />

        <div className="absolute inset-0 bg-linear-to-b from-stone-900/50 via-stone-900/80 to-stone-900/95" />

        <motion.div
          className="relative px-5 md:px-8 pt-20 md:pt-44 max-w-6xl mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-6 h-px bg-white/50 shrink-0" />
              <span className="text-white/60 text-[10px] tracking-[0.35em] uppercase font-medium">
                {c('hero', 'eyebrow', t('servicesPage.hero.eyebrow'))}
              </span>
            </div>

            <h1 className="font-serif text-3xl md:text-5xl text-white font-normal leading-[1.15] mb-4">
              {c('hero', 'heading1', t('servicesPage.hero.heading1'))}<br className="hidden md:block" /> {c('hero', 'heading2', t('servicesPage.hero.heading2'))}
            </h1>
            <p className="text-stone-300 text-sm md:text-base font-light leading-relaxed max-w-lg">
              {c('hero', 'subCopy', t('servicesPage.hero.subCopy'))}
            </p>
          </motion.div>
        </motion.div>

      </section>

      {/* ── Service cards ─────────────────────────────────────────────────── */}
      <div id="services-cards" className="-mt-20 md:-mt-28 relative z-10 pt-10 md:pt-14 pb-14 md:pb-20 px-4 md:px-8">
        
        {/* 🔥 MAGIC FIX: key={`grid-${services.length}`} 
          ეს აიძულებს ანიმაციას, რომ ახალი სერვისის დამატებისას/წაშლისას თავიდან გაეშვას! 
        */}
        <motion.div
          key={`grid-${services.length}`}
          className="max-w-6xl mx-auto grid grid-cols-1 gap-6 md:grid-cols-2"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {services.map((svc, i) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length]
            const isLastOdd = services.length > 1 && services.length % 2 !== 0 && i === services.length - 1
            return (
            <motion.div
              key={i}
              id={`service-${i}`}
              variants={cardVariant}
              className={`relative bg-white rounded-xl flex flex-col overflow-hidden border border-stone-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_14px_44px_rgb(0,0,0,0.1)] transition-shadow duration-300${isLastOdd ? ' md:col-span-2 md:max-w-[calc(50%-12px)] md:w-full md:mx-auto' : ''}`}
            >
              <span
                className="hidden md:block absolute top-3 right-5 font-serif text-8xl text-stone-900 font-bold opacity-[0.03] select-none pointer-events-none leading-none"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="relative p-8 md:p-10 flex flex-col flex-1">

                <div className="flex items-start gap-3.5 mb-5">
                  <Icon size={19} strokeWidth={1.2} className="text-stone-800 shrink-0 mt-1" />
                  <h2 className="font-serif text-xl md:text-2xl text-stone-800 font-normal leading-snug">
                    {svc.title}
                  </h2>
                </div>

                <motion.div
                  key={i18n.language}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="flex flex-col flex-1"
                >
                  <p className="text-stone-700 text-sm font-normal leading-relaxed mb-4">
                    {svc.desc}
                  </p>

                  <h4 className="text-xs font-semibold tracking-wider text-stone-500 uppercase mb-3">
                    {cCards('subServicesLabel', t('servicesPage.cards.subServicesLabel'))}
                  </h4>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {svc.subServices.map((s, si) => (
                      <li key={si} className="flex items-start gap-3 text-sm text-stone-700 font-normal leading-snug">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-800 shrink-0 mt-1.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-stone-100 pt-5">
                    <Link
                      to="/contact"
                      className="group inline-flex items-center gap-2 text-stone-900 text-sm font-semibold no-underline min-h-11 hover:text-stone-600 transition-colors duration-200"
                    >
                      {cCards('cta', t('servicesPage.cards.cta'))}
                      <ArrowRight
                        className="w-4 h-4 shrink-0 group-hover:translate-x-1.5 transition-transform duration-200"
                        strokeWidth={1.75}
                      />
                    </Link>
                  </div>
                </motion.div>

              </div>
            </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section className="py-14 md:py-16 px-4 md:px-8 bg-white border-y border-stone-200">
        <motion.div
          key={i18n.language}
          className="max-w-4xl mx-auto flex flex-col md:flex-row md:divide-x md:divide-stone-200 items-stretch text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {statNums.map((num, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 py-6 md:py-0 md:px-14">
              <span className="font-serif text-5xl md:text-6xl text-stone-900 font-light">{num}</span>
              <span className="text-stone-600 text-sm font-normal tracking-wide">{statLabels[i]}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Team CTA ──────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-stone-200">
        <motion.div
          className="max-w-xl mx-auto flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex flex-col items-center"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 font-normal leading-snug mb-8">
              {c('teamCta', 'heading', t('servicesPage.teamCta.heading'))}
            </h2>
            <Link
              to="/team"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-stone-900 text-white text-sm font-medium tracking-wide no-underline hover:bg-stone-700 transition-colors duration-200"
            >
              {c('teamCta', 'button', t('servicesPage.teamCta.button'))}
              <ArrowRight
                className="w-4 h-4 shrink-0 group-hover:translate-x-1.5 transition-transform duration-200"
                strokeWidth={1.75}
              />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <ConsultationBanner />
    </>
  )
}