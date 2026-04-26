import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import heroImage from '../assets/hero.webp'
import CountUp from './CountUp'

// ── Static fallback stats (used when CMS has no override) ────────────────────

const FALLBACK_STATS = [
  { num: 10, suffix: '+' },
  { num: 50, suffix: '+' },
  { num: 10, suffix: '+' },
]

// ── CMS helpers ───────────────────────────────────────────────────────────────

// i18n uses 'ge' for Georgian; Firestore keys use 'ka'
function firestoreLang(i18nLang: string): string {
  return i18nLang === 'ge' ? 'ka' : i18nLang
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  cms?: Record<string, string> | null
}

export default function HeroVariant({ cms }: Props) {
  const { t, i18n } = useTranslation()
  // Returns CMS value if non-empty, otherwise falls back to the i18n translation
  const lk = firestoreLang(i18n.language)
  const c = (key: string, fallback: string) => cms?.[`${key}_${lk}`] || fallback

  return (
    <section className="bg-stone-900 overflow-hidden">
      
      {/* ══════════════════════════════════════════════════════════════════
          Main Container: იკავებს ეკრანის სრულ სიმაღლეს
      ══════════════════════════════════════════════════════════════════ */}
      <div className="relative flex flex-col">

        {/* Background image - ოდნავ ჩამოწეული (40%), რომ სკამის ფეხი გავარიდოთ ღილაკს */}
        <img
          src={heroImage}
          alt={t('home.hero.imgAlt')}
          className="absolute inset-0 w-full h-full object-cover object-[30%_40%] md:object-[50%_40%]"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

        {/* Gradient overlay - ბოლოში ოდნავ მუქი, რომ რიცხვები გამოჩნდეს */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

        {/* ── ცენტრალური ტექსტი ── */}
        <div className="relative z-10 w-full">
        <motion.div
          className="flex flex-col items-center text-center px-4 sm:px-8 max-w-4xl mx-auto py-16 w-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            key={i18n.language}
            className="flex flex-col items-center gap-4 md:gap-7 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {/* 1 — Eyebrow: firm type */}
            <motion.p
              className="flex items-center gap-2 text-[10px] md:text-xs tracking-[0.2em] text-white/80 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <span className="w-5 h-px bg-gold-400 shrink-0" />
              {c('eyebrow', t('home.hero.eyebrow'))}
              <span className="w-5 h-px bg-gold-400 shrink-0" />
            </motion.p>

            {/* 2 — Main title: firm name */}
            <motion.h1
              className="font-serif text-3xl md:text-5xl font-medium text-white leading-tight tracking-tight mb-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              Balance 101
              {t('home.hero.localName') && (
                <><span className="text-stone-400"> •</span> {t('home.hero.localName')}</>
              )}
            </motion.h1>

            {/* 3 — Subtitle: years tagline */}
            <motion.p
              className="uppercase tracking-[0.2em] md:tracking-[0.25em] text-[10px] md:text-xs font-medium text-stone-300 mt-2 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.38 }}
            >
              {c('tagline', t('home.hero.tagline'))}
            </motion.p>

            <motion.div
              className="w-10 h-px bg-white/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ transformOrigin: 'center' }}
            />

            {/* 4a — Slogan */}
            <motion.p
              className="font-serif font-light italic text-2xl md:text-3xl text-white tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              {c('heading1', t('home.hero.heading1'))} {c('heading2', t('home.hero.heading2'))}
            </motion.p>

            {/* 4b — Description */}
            <motion.p
              className="font-sans text-sm md:text-base text-stone-300/90 leading-[1.8] font-light max-w-2xl mx-auto mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.65 }}
            >
              {c('subCopy', t('home.hero.subCopy'))}
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 md:mt-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 w-full sm:w-auto bg-stone-900 text-white text-sm font-medium tracking-wide hover:bg-stone-800 transition-all duration-300 no-underline rounded-sm"
              >
                {c('cta1', t('home.hero.cta1'))}
                <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-1.5 px-8 py-3 w-full sm:w-auto border border-stone-300 text-stone-200 text-sm font-medium tracking-wide hover:bg-white/10 transition-all duration-300 no-underline"
              >
                {c('cta2', t('home.hero.cta2'))}
                <ChevronRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
          </motion.div>
        </motion.div>
        </div>

        {/* ── TRUST STATS BAR ── */}
        <motion.div
          className="relative z-20 w-full mt-16 md:mt-24 pb-8 md:pb-12 px-2 sm:px-8 pointer-events-none"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            key={i18n.language}
            className="max-w-4xl mx-auto flex items-start justify-center gap-2 sm:gap-12 md:gap-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {FALLBACK_STATS.map(({ num, suffix }, i) => {
              const cmsNum    = cms?.[`stat${i}_num`]
              const cmsSuffix = cms?.[`stat${i}_suffix`]
              const resolvedNum    = cmsNum    ? parseInt(cmsNum, 10) : num
              const resolvedSuffix = cmsSuffix ?? suffix
              return (
              <Fragment key={i}>
                <div className="text-center min-w-0 flex-1 sm:flex-none px-1">
                  <p className="font-serif text-2xl md:text-4xl text-white font-normal leading-none tabular-nums drop-shadow-sm">
                    <CountUp num={resolvedNum} suffix={resolvedSuffix} delay={800} />
                  </p>
                  <p className="text-white/70 text-[7px] xs:text-[8px] md:text-[9px] mt-2 uppercase tracking-widest font-medium leading-[1.3] wrap-break-word">
                    {c(`stat${i}`, t(`home.hero.stats.${i}`))}
                  </p>
                </div>
                {i < FALLBACK_STATS.length - 1 && (
                  <div className="w-px h-6 md:h-10 bg-white/20 shrink-0 mt-1" />
                )}
              </Fragment>
              )
            })}
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}