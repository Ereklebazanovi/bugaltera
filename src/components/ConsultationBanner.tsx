import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function ConsultationBanner() {
  const { t, i18n } = useTranslation()

  return (
    <section className="py-12 px-4 md:px-8">
      {/* გრაფიტისფერი მუქი ფონი, აბსოლუტურად სწორი კუთხეებით და მინიმალისტური ჩრდილით */}
      <div className="max-w-6xl mx-auto bg-zinc-950 border border-zinc-800 relative overflow-hidden">
        
        {/* ძალიან ნაზი, თანამედროვე გრადიენტი ფონზე, რომელიც სიმკაცრეს არ კარგავს */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 opacity-50 pointer-events-none" />

        <div className="relative px-8 py-16 md:px-16 flex flex-col md:flex-row md:items-center justify-between gap-10">
          
          {/* Text Content */}
          <motion.div
            key={i18n.language}
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-zinc-100 font-normal mb-4 leading-tight tracking-tight">
              {t('consultationBanner.heading')}
            </h2>
            <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed max-w-xl">
              {t('consultationBanner.subCopy')}
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            key={i18n.language + '_cta'}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="shrink-0"
          >
            {/* ღილაკი: სუფთა თეთრი (Ivory), შავი ტექსტით. მაქსიმალური კონტრასტი და თანამედროვეობა */}
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-4 px-8 py-4 w-full md:w-auto bg-zinc-100 text-zinc-950 text-sm font-medium hover:bg-white hover:scale-[1.02] transition-all duration-300 no-underline rounded-sm"
            >
              {t('consultationBanner.cta')}
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                strokeWidth={1.5}
              />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  )
}