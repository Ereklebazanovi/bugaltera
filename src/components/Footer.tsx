import { Link } from 'react-router-dom'
import { Phone, PhoneCall, Mail, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logoBalance from '../assets/logoBalance.png'

export default function Footer() {
  const { t } = useTranslation()

  const navLinks  = t('layout.footer.navLinks',    { returnObjects: true }) as string[]
  const navRoutes = t('layout.footer.navRoutes',   { returnObjects: true }) as string[]
  const services  = t('layout.footer.servicesList',{ returnObjects: true }) as string[]
  const phones    = t('layout.footer.phones',      { returnObjects: true }) as Array<{ display: string; href: string }>

  return (
    <footer className="bg-gold-700 border-t-2 border-t-gold-500">

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">

        {/* Col 1 — Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-flex no-underline mb-5 hover:opacity-80 transition-opacity duration-200">
            <img src={logoBalance} alt="Balance101" className="h-32 w-auto object-contain brightness-0 invert" />
          </Link>
          <p className="text-[13px] text-white/50 leading-relaxed max-w-88">
            {t('layout.footer.tagline')}
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-3 mt-5">
            <a
              href="https://www.facebook.com/profile.php?id=61587802523387"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[#1877F2]/40 text-[#1877F2]/70 hover:border-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/balance___101"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E1306C]/40 text-[#E1306C]/70 hover:border-[#E1306C] hover:text-[#E1306C] hover:bg-[#E1306C]/10 transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white mb-5">
            {t('layout.footer.navHeading')}
          </p>
          <ul className="space-y-3 list-none p-0 m-0">
            {navLinks.map((label, i) => (
              <li key={i}>
                <Link
                  to={navRoutes[i] ?? '/'}
                  className="text-[13px] text-white/50 hover:text-gold-400 transition-colors duration-200 no-underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Services */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white mb-5">
            {t('layout.footer.servicesHeading')}
          </p>
          <ul className="space-y-3 list-none p-0 m-0">
            {services.map((label, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className="w-1 h-1 rounded-full bg-gold-500 shrink-0" />
                <span className="text-[13px] text-white/50">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Contact */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white mb-5">
            {t('layout.footer.contactHeading')}
          </p>
          <ul className="space-y-4 list-none p-0 m-0">
            <li className="flex items-start gap-3">
              <MapPin size={13} className="text-gold-500 mt-0.5 shrink-0" strokeWidth={1.8} />
              <span className="text-[13px] text-white/50 leading-snug">
                {t('layout.footer.location')}
              </span>
            </li>
            {phones.map((p, i) => (
              <li key={i} className="flex items-center gap-3">
                {i === 0
                  ? <Phone size={13} className="text-gold-500 shrink-0" strokeWidth={1.8} />
                  : <PhoneCall size={13} className="text-gold-500 shrink-0" strokeWidth={1.8} />
                }
                <a
                  href={p.href}
                  className="text-[13px] text-white/50 hover:text-gold-400 transition-colors duration-200 no-underline"
                >
                  {p.display}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-3">
              <Mail size={13} className="text-gold-500 shrink-0" strokeWidth={1.8} />
              <a
                href={`mailto:${t('layout.footer.email')}`}
                className="text-[13px] text-white/50 hover:text-gold-400 transition-colors duration-200 no-underline"
              >
                {t('layout.footer.email')}
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-[11px] text-white/30 tracking-wide">
            &copy; {new Date().getFullYear()} Balance101. {t('layout.footer.copyright')}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-white/30">
            <Link to="/terms"   className="hover:text-white/60 transition-colors no-underline">{t('layout.footer.terms')}</Link>
            <span className="text-white/20">·</span>
            <Link to="/privacy" className="hover:text-white/60 transition-colors no-underline">{t('layout.footer.privacy')}</Link>
            <span className="text-white/20">·</span>
            <span>{t('layout.footer.credit')}</span>
          </div>

        </div>
      </div>

    </footer>
  )
}
