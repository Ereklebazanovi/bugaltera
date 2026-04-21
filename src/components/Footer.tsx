import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logoBalance from '../assets/logoBalance.png'

export default function Footer() {
  const { t } = useTranslation()

  const navLinks  = t('layout.footer.navLinks',    { returnObjects: true }) as string[]
  const navRoutes = t('layout.footer.navRoutes',   { returnObjects: true }) as string[]
  const services  = t('layout.footer.servicesList',{ returnObjects: true }) as string[]
  const phones    = t('layout.footer.phones',      { returnObjects: true }) as Array<{ display: string; href: string }>

  return (
    <footer className="bg-navy-900 border-t-2 border-t-gold-500">

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">

        {/* Col 1 — Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-flex no-underline mb-5 hover:opacity-80 transition-opacity duration-200">
            <img src={logoBalance} alt="Balance101" className="h-16 w-auto object-contain brightness-0 invert" />
          </Link>
          <p className="text-[13px] text-white/50 leading-relaxed max-w-88">
            {t('layout.footer.tagline')}
          </p>
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
                <Phone size={13} className={`shrink-0 ${i === 0 ? 'text-gold-500' : 'text-transparent'}`} strokeWidth={1.8} />
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
