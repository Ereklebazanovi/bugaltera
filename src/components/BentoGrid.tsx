import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Scale, ShieldCheck, Gavel,
  ChevronRight, Phone, Clock, ArrowRight,
} from 'lucide-react'

// ── Animation variants ──────────────────────────────────────────────────────

const bentoStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
}

const cardVariant = {
  hidden:  { opacity: 0, y: 18 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
  hover: {
    y: -5,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
}

// ── Static data (icon + anchor only) ────────────────────────────────────────

const AREA_META = [
  { Icon: Scale,       anchor: 'civil' },
  { Icon: ShieldCheck, anchor: 'admin' },
  { Icon: Gavel,       anchor: 'criminal' },
]

// ── Component ───────────────────────────────────────────────────────────────

export default function BentoGrid() {
  const { t, i18n } = useTranslation()
  const areas = t('home.services.areas', { returnObjects: true }) as Array<{ title: string; desc: string }>

  return (
    <section id="services" className="bg-stone-200 pt-12 pb-8 md:py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        <motion.div
          key={i18n.language}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >

          {/* Section header */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center gap-3 mb-3">
              <motion.span
                className="block w-6 h-px bg-stone-400 shrink-0"
                style={{ transformOrigin: 'left center' }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const }}
              />
              <span className="text-stone-500 text-[10px] tracking-[0.35em] uppercase font-medium">
                {t('home.services.eyebrow')}
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 font-normal">
              {t('home.services.heading')}
            </h2>
          </div>

          <motion.div
            variants={bentoStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >

            {/* ── 4 Practice Area Cards ─────────────────────────────────────── */}
            {AREA_META.map(({ Icon, anchor }, i) => (
              <motion.div
                key={anchor}
                variants={cardVariant}
                whileHover="hover"
                className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 shadow-sm transition-[box-shadow,border-color] duration-300 hover:shadow-md hover:border-l-gold-500 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4 min-h-16">
                  <Icon size={20} strokeWidth={1.2} className="text-stone-400 shrink-0 mt-1" />
                  <h3 className="font-serif text-lg md:text-xl text-stone-900 font-normal leading-snug">
                    {areas[i]?.title}
                  </h3>
                </div>
                <p className="text-stone-500 text-sm font-light leading-relaxed flex-1">
                  {areas[i]?.desc}
                </p>
                <Link
                  to={`/services#${anchor}`}
                  className="inline-flex items-center gap-1.5 mt-6 text-stone-700 text-sm font-medium hover:gap-2.5 transition-all duration-200 no-underline min-h-11 self-start"
                >
                  {t('home.services.learnMore')}
                  <ChevronRight size={13} strokeWidth={2.5} />
                </Link>
              </motion.div>
            ))}

            {/* ── Contact strip (full-width) ────────────────────────────────── */}
            <motion.div
              variants={cardVariant}
              whileHover="hover"
              className="md:col-span-2 lg:col-span-3 bg-white border border-stone-200 rounded-xl p-6 md:p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">

                <div className="flex items-center gap-4 lg:shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-stone-900 shrink-0">
                    <Phone size={20} strokeWidth={1.2} className="text-white" />
                  </div>
                  <div>
                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-0.5">
                      {t('home.services.contact.quickLine')}
                    </p>
                    <p className="font-serif text-2xl md:text-3xl text-stone-900 font-semibold leading-tight">
                      032 219 08 39

                    </p>
                  </div>
                </div>

                <div className="hidden lg:block w-px h-12 bg-stone-200 shrink-0" />
                <div className="h-px w-full bg-stone-100 lg:hidden" />

                <div className="flex items-center gap-3 lg:shrink-0">
                  <Clock size={16} strokeWidth={1.2} className="text-stone-400 shrink-0" />
                  <div>
                    <p className="text-stone-900 text-sm font-semibold">
                      {t('home.services.contact.hoursLabel')}
                    </p>
                    <p className="text-stone-400 text-xs mt-0.5">
                      {t('home.services.contact.hours')}
                    </p>
                  </div>
                </div>

                <div className="hidden lg:block w-px h-12 bg-stone-200 shrink-0" />

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 min-h-13 bg-stone-800 text-white text-sm font-medium tracking-wide rounded hover:bg-stone-900 transition-colors duration-200 no-underline lg:shrink-0"
                >
                  <ArrowRight size={14} strokeWidth={2} />
                  {t('home.services.contact.cta')}
                </Link>

              </div>
            </motion.div>

          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
