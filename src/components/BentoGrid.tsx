import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

// ── Animation variants ──────────────────────────────────────────────────────

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Component ───────────────────────────────────────────────────────────────

export default function BentoGrid() {
  const { t, i18n } = useTranslation()
  const languages = t('aboutPage.languages.list', { returnObjects: true }) as string[]

  return (
    <section id="services" className="bg-stone-200 pt-12 pb-8 md:py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        <motion.div
          key={i18n.language}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >

       
           <section className="bg-white py-16 md:py-20 px-5 md:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20">

          {/* Languages */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-3 mb-3">
                <span className="block w-5 h-px bg-stone-300 shrink-0" />
                <span className="text-stone-400 text-[10px] tracking-[0.35em] uppercase font-medium">
                  {t('aboutPage.languages.eyebrow')}
                </span>
              </div>
              <h2 className="font-serif text-2xl text-stone-900 font-normal mb-6">
                {t('aboutPage.languages.heading')}
              </h2>
              <motion.div
                key={i18n.language}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap gap-2.5"
              >
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-700 text-sm font-medium rounded-full transition-colors duration-200 hover:bg-stone-800 hover:text-white hover:border-stone-800 cursor-default"
                  >
                    <Globe size={13} strokeWidth={1.5} className="text-stone-400 group-hover:text-white" />
                    {lang}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-5 h-px bg-stone-300 shrink-0" />
              <span className="text-stone-400 text-[10px] tracking-[0.35em] uppercase font-medium">
                {t('aboutPage.mission.eyebrow')}
              </span>
            </div>
            <motion.p
              key={i18n.language}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="font-serif text-xl text-stone-800 leading-relaxed font-normal"
            >
              {t('aboutPage.mission.body')}
            </motion.p>
          </motion.div>

        </div>
      </section>
        </motion.div>

      </div>
    </section>
  )
}
