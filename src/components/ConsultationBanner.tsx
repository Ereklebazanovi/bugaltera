import { Link } from 'react-router-dom'
import { ArrowRight, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function ConsultationBanner() {
  const { t, i18n } = useTranslation()

  return (
    <section className="py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto bg-gold-500 relative overflow-hidden rounded-sm">

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10" />

        {/* Subtle diagonal overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-gold-400/35 via-transparent to-gold-700 pointer-events-none" />

        <div className="relative px-8 py-16 md:px-16 flex flex-col items-center text-center gap-8">

          <motion.div
            key={i18n.language}
            className="max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <p className="flex items-center justify-center gap-2 text-[10px] tracking-[0.25em] text-white/30 uppercase mb-4">
              <span className="w-5 h-px bg-white/20 shrink-0" />
              Balance101
              <span className="w-5 h-px bg-white/20 shrink-0" />
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white font-normal mb-4 leading-tight tracking-tight">
              {t('consultationBanner.heading')}
            </h2>
            <p className="text-white/50 text-base font-light leading-relaxed">
              {t('consultationBanner.subCopy')}
            </p>
          </motion.div>

          <motion.div
            key={i18n.language + '_cta'}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white text-gold-700 text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-white/90 transition-colors duration-300 no-underline rounded-sm"
            >
              {t('consultationBanner.cta')}
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                strokeWidth={1.5}
              />
            </Link>
            <a
              href="tel:+995511411604"
              className="inline-flex items-center gap-2 text-white/50 text-[12px] hover:text-gold-400 transition-colors duration-200 no-underline"
            >
              <Phone size={13} strokeWidth={1.5} />
              +995 511 411 604
            </a>
            <a
              href="tel:+995322190839"
              className="inline-flex items-center gap-2 text-white/50 text-[12px] hover:text-gold-400 transition-colors duration-200 no-underline"
            >
              <Phone size={13} strokeWidth={1.5} />
              032 219 08 39
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
