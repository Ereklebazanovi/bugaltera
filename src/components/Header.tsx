import { useState, useEffect, Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Phone, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import logoBalance from '../assets/logoBalance.png'

const NAV_LINKS = [
  { key: 'nav.home',     to: '/'         },
  { key: 'nav.services', to: '/services' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.team',     to: '/team'     },
  { key: 'nav.blog',     to: '/blog'     },
  { key: 'nav.partners', to: '/partners' },
]

export default function Header() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  // Scroll-aware header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  // Close menu on route change
  useEffect(() => {
    const tid = window.setTimeout(() => setMobileMenuOpen(false), 0)
    return () => window.clearTimeout(tid)
  }, [location.pathname])

  return (
    <>
      {/* ── Fixed Header ──────────────────────────────────────────────────── */}
      
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-[0_1px_12px_rgba(0,0,0,0.07)] border-b border-stone-200'
          : 'bg-white/90 backdrop-blur-md border-b border-stone-200/60'
      }`}>
        <nav className="relative max-w-7xl mx-auto px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between">

          {/* Left: Logo */}
          <Link to="/" className="flex items-center no-underline shrink-0 hover:opacity-80 transition-opacity duration-200">
            <img src={logoBalance} alt="Balance101" className="h-24 md:h-24 w-auto object-contain lg:mt-3 md:mt-2 sm:mt-3" />
          </Link>

          {/* Center: Nav links — absolutely centered, desktop only */}
          <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map(({ key, to }) => (
              <li key={key}>
                <Link
                  to={to}
                  className={`group relative text-[12px] md:text-[13px] font-medium tracking-wide transition-colors duration-300 no-underline py-2 ${
                    isActive(to) ? 'text-gold-500' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t(key)}
                  {!isActive(to) && (
                    <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-stone-300 transition-all duration-300 group-hover:w-full" />
                  )}
                  {isActive(to) && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute -bottom-1.5 left-0 w-full h-px bg-gold-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right: Language switcher + Mobile controls + Desktop CTA */}
          <div className="flex items-center gap-2 lg:gap-4 shrink-0">

            {/* Language switcher — all screens */}
            <div className="flex items-center gap-1 text-[10px] font-medium tracking-widest select-none">
              {(['ge', 'en'] as const).map((lng, idx) => (
                <Fragment key={lng}>
                  {idx > 0 && <span className="text-stone-300 mx-0.5">|</span>}
                  <button
                    type="button"
                    onClick={() => i18n.changeLanguage(lng)}
                    className={`uppercase transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 ${
                      i18n.language === lng
                        ? 'text-gold-600 font-semibold'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {lng}
                  </button>
                </Fragment>
              ))}
            </div>

            {/* Mobile: phone */}
            <a
              href="tel:0322190839"
              className="lg:hidden flex items-center justify-center w-8 h-8 border border-stone-300 rounded-full text-stone-700 hover:border-stone-500 hover:text-stone-900 transition-all duration-200"
              aria-label={t('layout.header.callAriaLabel')}
            >
              <Phone size={14} strokeWidth={1.5} />
            </a>

            {/* Mobile: WhatsApp */}
            <a
              href="https://wa.me/995511411604"
              target="_blank"
              rel="noopener noreferrer"
              className="lg:hidden flex items-center justify-center w-8 h-8 border border-[#25D366] rounded-full text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200"
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>

            {/* Mobile: hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden flex items-center gap-1.5 px-3 h-8 border border-stone-300 rounded-full text-stone-800 hover:border-stone-500 hover:bg-stone-50 transition-all duration-200 cursor-pointer bg-transparent text-[10px] font-medium tracking-wide"
            >
              <Menu size={13} strokeWidth={1.5} />
              {t('layout.header.mobileMenuOpen')}
            </button>

            {/* Desktop CTA */}
            <Link
              to="/contact"
              className="hidden lg:inline-flex items-center px-6 py-2.5 bg-gold-500 text-white text-[11px] font-semibold tracking-[0.15em] uppercase hover:bg-gold-400 transition-all duration-300 no-underline rounded-sm shrink-0 shadow-sm"
            >
              {t('nav.cta')}
            </Link>

          </div>

        </nav>
      </header>

      {/* ── Mobile Full-Screen Overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] bg-stone-950 lg:hidden flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 h-14 border-b border-white/8 shrink-0">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center no-underline"
              >
                <img src={logoBalance} alt="Balance101" className="h-8 w-auto object-contain brightness-0 invert" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="flex items-center gap-2 px-3 py-1.5 border border-stone-700 rounded-full text-stone-300 text-[10px] uppercase tracking-wider hover:border-stone-500 hover:text-white transition-all duration-200 bg-transparent cursor-pointer"
              >
                <X size={13} strokeWidth={1.5} />
                {t('layout.header.mobileMenuClose')}
              </button>
            </div>

            {/* Nav links — staggered reveal */}
            <nav className="flex-1 flex flex-col justify-center px-8 overflow-y-auto">
              {NAV_LINKS.map(({ key, to }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: i * 0.06 + 0.1, duration: 0.35, ease: 'easeOut' }}
                >
                  <Link
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-baseline gap-5 py-5 no-underline transition-colors duration-300"
                  >
                    <span className={`text-[10px] font-sans w-5 shrink-0 tabular-nums transition-colors duration-300 ${
                      isActive(to) ? 'text-gold-500/90' : 'text-gold-500/45'
                    }`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-3xl font-serif font-medium leading-none tracking-tight transition-colors duration-300 ${
                      isActive(to) ? 'text-gold-400' : 'text-stone-100 group-hover:text-gold-400'
                    }`}>
                      {t(key)}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom CTA */}
            <div className="shrink-0 px-8 pb-10 pt-6 flex items-center justify-center border-t border-white/5">
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full max-w-xs py-3.5 bg-gold-500 text-stone-950 text-[11px] font-bold tracking-wide uppercase no-underline hover:bg-gold-400 transition-colors duration-300"
              >
                {t('nav.cta')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
