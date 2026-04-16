import { Link, useLocation } from 'react-router-dom'
import { Home, Briefcase, Users, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// ── Nav items (icons + routes only — labels come from translations) ────────────

const NAV_ITEMS = [
  { to: '/',         Icon: Home,      key: 'nav.home'     },
  { to: '/services', Icon: Briefcase, key: 'nav.services' },
  { to: '/team',     Icon: Users,     key: 'nav.team'     },
  
  { to: '/partners', Icon: Users,     key: 'nav.partners' },
  { to: '/blog',     Icon: FileText,  key: 'nav.blog'     },
] as const

// ── Component ─────────────────────────────────────────────────────────────────

export default function BottomNav() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe"
      aria-label={t('layout.bottomNav.ariaLabel')}
    >
      <div className="grid grid-cols-5 w-full h-16">
        {NAV_ITEMS.map(({ to, Icon, key }) => {
          const isActive = pathname === to
          return (
            <Link
              key={to}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'relative flex flex-col items-center justify-center gap-1',
                'px-1 py-2 no-underline transition-colors duration-200 min-h-11',
                isActive
                  ? 'text-stone-900'
                  : 'text-stone-500 hover:text-stone-700',
              ].join(' ')}
            >
              {/* Active tab background hint */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-1.5 inset-y-1 bg-stone-100 rounded-lg -z-10"
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
                aria-hidden="true"
              />

              <motion.span
                key={i18n.language}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className={[
                  'text-[9px] leading-tight tracking-wide uppercase w-full text-center line-clamp-2 wrap-break-word',
                  isActive ? 'font-semibold' : 'font-normal',
                ].join(' ')}
              >
                {t(key)}
              </motion.span>

              {/* Active indicator — small dot below label */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="w-1 h-1 bg-gold-600 rounded-full mt-0.5"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
