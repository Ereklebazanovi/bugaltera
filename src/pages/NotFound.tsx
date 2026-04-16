// NotFound.tsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'

export default function NotFound() {
  const { i18n } = useTranslation()
  const isEn = i18n.language === 'en'

  return (
    <div className="min-h-[72vh] flex flex-col items-center justify-center px-4 py-24 bg-stone-50">
      <SEO
        title="404 — გვერდი ვერ მოიძებნა | Darchia & Partners"
        description="გვერდი, რომელსაც ეძებთ, არ არსებობს. დაბრუნდით მთავარ გვერდზე."
        noindex
      />
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Ghost number + real number layered for depth */}
        <div className="relative inline-flex items-center justify-center mb-6 select-none">
          <span className="font-serif text-[10rem] md:text-[13rem] leading-none font-normal tracking-tighter text-navy-900/[0.06]">
            404
          </span>
          <span className="absolute font-serif text-5xl md:text-6xl font-normal text-navy-900 tracking-tight">
            404
          </span>
        </div>
        {/* Gold rule + eyebrow label */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="block h-px w-8 bg-gold-500/60" />
          <p className="text-[10px] tracking-[0.4em] uppercase font-semibold text-gold-500">
            {isEn ? 'Page Not Found' : 'გვერდი ვერ მოიძებნა'}
          </p>
          <span className="block h-px w-8 bg-gold-500/60" />
        </div>

        {/* Description */}
        <p className="text-stone-500 text-base md:text-lg font-light leading-relaxed mb-10 max-w-xs mx-auto">
          {isEn
            ? "The page you're looking for doesn't exist or has been moved."
            : 'გვერდი, რომელსაც ეძებთ, არ არსებობს ან გადატანილია.'}
        </p>

        {/* CTA */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 bg-navy-900 text-cream-50 px-7 py-3.5 rounded-xl text-sm font-medium tracking-wide hover:bg-navy-800 transition-colors duration-200 no-underline"
        >
          <Home size={15} strokeWidth={2} aria-hidden="true" />
          {isEn ? 'Back to Home' : 'მთავარ გვერდზე'}
        </Link>
      </motion.div>
    </div>
  )
}
