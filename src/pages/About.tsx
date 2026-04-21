import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Scale, Lightbulb, Check } from 'lucide-react'
import ConsultationBanner from '../components/ConsultationBanner'
import SEO from '../components/SEO'
import practiceHero from '../assets/aboutpage.webp'

// ── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

// ── Value icons (order matches JSON items) ───────────────────────────────────

const VALUE_ICONS = [ShieldCheck, Scale, Lightbulb]

// ── Component ────────────────────────────────────────────────────────────────

export default function About() {
  const { t, i18n } = useTranslation()

  const bullets   = t('aboutPage.whyUs.bullets',  { returnObjects: true }) as Array<{ title: string; desc: string }>
  const values    = t('aboutPage.values.items',    { returnObjects: true }) as Array<{ title: string; desc: string }>

  return (
    <>
      <SEO
        title="ჩვენ შესახებ — Balance101 • ბალანსი 101"
        description="გაიცანით Balance101 — პროფესიონალური საბუღალტრო კომპანია თბილისში. გამოცდილი ბუღალტრები, ფინანსური კონსულტაციები და საგადასახადო სერვისები."
        keywords={"საბუღალტრო კომპანია, ფინანსური მომსახურება, ბუღალტრული გუნდი, balance101 about, accounting firm georgia, financial services tbilisi, accountants georgia"}
        path="/about"
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[55vh] md:min-h-[70vh] flex flex-col bg-stone-900">
        <img
          src={practiceHero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-[center_15%]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-stone-900/50 via-stone-900/80 to-stone-900/95" />

        <motion.div
          className="relative px-5 md:px-8 pt-32 md:pt-40 pb-14 md:pb-20 max-w-6xl mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="max-w-2xl text-left"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-6 h-px bg-white/50 shrink-0" />
              <span className="text-white/60 text-[10px] tracking-[0.35em] uppercase font-medium">
                {t('aboutPage.hero.eyebrow')}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-white font-normal leading-[1.15]">
              {t('aboutPage.hero.heading1')}<br className="hidden md:block" /> {t('aboutPage.hero.heading2')}
            </h1>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-16 md:py-20 px-5 md:px-8">
        {/* "2015" watermark */}
        

        <motion.div
          className="relative max-w-6xl mx-auto grid md:grid-cols-[1fr_2fr] gap-10 md:gap-20"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-5 h-px bg-stone-300 shrink-0" />
              <span className="text-stone-400 text-[10px] tracking-[0.35em] uppercase font-medium">
                {t('aboutPage.intro.eyebrow')}
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 font-normal">
              {t('aboutPage.intro.heading')}
            </h2>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="border-l-2 border-gold-500 pl-5">
              <motion.p
                key={i18n.language}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-stone-800 text-lg leading-relaxed font-medium"
              >
                {t('aboutPage.intro.body')}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Why Us ────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-stone-100 py-16 md:py-20 px-5 md:px-8"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M40 0H0V40' fill='none' stroke='%23000' stroke-width='0.4' stroke-opacity='0.07'/%3E%3C/svg%3E\")" }}
      >
        <div className="max-w-6xl mx-auto">

          <motion.div
            key={i18n.language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-10 md:mb-12"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-5 h-px bg-stone-400 shrink-0" />
              <span className="text-stone-500 text-[10px] tracking-[0.35em] uppercase font-medium">
                {t('aboutPage.whyUs.eyebrow')}
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 font-normal">
              {t('aboutPage.whyUs.heading')}
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {bullets.map((bullet, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white border border-stone-200 rounded-2xl p-6 md:p-7 flex gap-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-gold-500/40"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/25 shrink-0 mt-0.5">
                  <Check size={14} strokeWidth={2.5} className="text-gold-600" />
                </div>
                <div>
                  <h3 className="font-serif text-[1.05rem] text-stone-900 font-normal mb-1.5 leading-snug">
                    {bullet.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {bullet.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section
        className="relative bg-stone-200 py-16 md:py-20 px-5 md:px-8"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M0 24L24 0' fill='none' stroke='%23000' stroke-width='0.4' stroke-opacity='0.05'/%3E%3C/svg%3E\")" }}
      >
        <div className="max-w-6xl mx-auto">

          <motion.div
            key={i18n.language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-10 md:mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="block w-5 h-px bg-stone-400 shrink-0" />
              <span className="text-stone-500 text-[10px] tracking-[0.35em] uppercase font-medium">
                {t('aboutPage.values.eyebrow')}
              </span>
              <span className="block w-5 h-px bg-stone-400 shrink-0" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 font-normal max-w-xl mx-auto">
              {t('aboutPage.values.heading')}
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {values.map((val, i) => {
              const Icon = VALUE_ICONS[i]
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white rounded-xl p-7 md:p-8 flex flex-col border border-stone-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <Icon size={24} strokeWidth={1.4} className="text-gold-500 mb-5" />
                  <h3 className="font-serif text-xl text-stone-900 font-normal mb-3 leading-snug">
                    {val.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {val.desc}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>

        </div>
      </section>

      {/* ── Languages + Mission ───────────────────────────────────────────── */}
     

      <ConsultationBanner />
    </>
  )
}
