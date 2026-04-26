import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import ConsultationBanner from '../components/ConsultationBanner'
import teamPhoto from '../assets/team-photo.webp'
import SEO from '../components/SEO'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Member {
  id: string
  name_ka: string
  name_en?: string
  name_ru?: string
  role_ka: string
  role_en?: string
  role_ru?: string
  bio_ka: string
  bio_en?: string
  bio_ru?: string
  linkedin?: string
  specializations_ka?: string[]
  specializations_en?: string[]
  specializations_ru?: string[]
  slug?: string
  photoUrl: string
  createdAt: { toDate: () => Date } | null
}

// ── Animations ────────────────────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Team() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const { t, i18n } = useTranslation()

  const getName  = (m: Member) =>
    i18n.language === 'ru' ? (m.name_ru || m.name_en || m.name_ka) :
    i18n.language === 'en' ? (m.name_en || m.name_ka) : m.name_ka
  const getRole  = (m: Member) =>
    i18n.language === 'ru' ? (m.role_ru || m.role_en || m.role_ka) :
    i18n.language === 'en' ? (m.role_en || m.role_ka) : m.role_ka
  const getSpecs = (m: Member): string[] => {
    if (i18n.language === 'ru') return (m.specializations_ru?.length ? m.specializations_ru : m.specializations_en?.length ? m.specializations_en : m.specializations_ka) ?? []
    if (i18n.language === 'en') return (m.specializations_en?.length ? m.specializations_en : m.specializations_ka) ?? []
    return m.specializations_ka ?? []
  }

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, 'team'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setMembers(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Member, 'id'>) }))
        )
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  return (
    <>
      <SEO
        title={"გუნდი — Balance101 • ბალანსი 101"}
        description={"გაიცანით Balance101-ის გამოცდილი ბუღალტრები და ფინანსური კონსულტანტები. პროფესიონალი სპეციალისტები თბილისში, ბიზნესის ფინანსური სტაბილურობისთვის."}
        keywords={"ბუღალტრები თბილისში, ფინანსური კონსულტანტები, ბუღალტერიის გუნდი, accountants tbilisi, financial consultants georgia, balance101 team, accounting specialists tbilisi"}
        path="/team"
      />

      {/* ── Page hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-32 md:pb-44 min-h-[60vh] md:min-h-[68vh] flex flex-col justify-end bg-stone-900">

        <img
          src={teamPhoto}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-b from-stone-900/50 via-stone-900/80 to-stone-900/95" />

        <motion.div
          className="relative px-5 md:px-8 pt-20 md:pt-44 max-w-6xl mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-6 h-px bg-white/50 shrink-0" />
              <span className="text-white/60 text-[10px] tracking-[0.35em] uppercase font-medium">
                {t('teamPage.hero.eyebrow')}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-white font-normal leading-[1.15] mb-4 max-w-xl">
              {t('teamPage.hero.heading1')}<br className="hidden md:block" /> {t('teamPage.hero.heading2')}
            </h1>
            <p className="text-stone-300 text-sm md:text-base font-light leading-relaxed max-w-lg">
              {t('teamPage.hero.subCopy')}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <ChevronDown size={18} strokeWidth={1.2} className="text-white opacity-40" />
        </motion.div>
      </section>

      {/* ── Team grid — overlaps hero ──────────────────────────────────────── */}
      <div id="team-content" className="-mt-20 md:-mt-28 relative z-10">
        <section className="bg-[#ECEAE5] px-4 md:px-8 pt-8 md:pt-12 pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto">

            <div className="flex items-center gap-3 mb-10 md:mb-12">
              <span className="block w-6 h-px bg-stone-400 shrink-0" />
              <motion.span
                key={i18n.language}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="text-stone-500 text-[10px] tracking-[0.35em] uppercase font-medium"
              >
                {t('teamPage.grid.eyebrow')}
              </motion.span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-xl overflow-hidden shadow-xl animate-pulse">
                    <div className="aspect-3/4 bg-stone-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-5 w-3/4 bg-stone-200 rounded" />
                      <div className="h-3 w-1/2 bg-stone-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-16">გუნდის წევრები ვერ მოიძებნა.</p>
            ) : (
              <motion.div
                className="grid grid-cols-1 gap-8 md:gap-12 sm:grid-cols-2"
                variants={gridVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
              >
                {members.map(member => (
                  <motion.div key={member.id} variants={cardVariant} className="h-full max-w-sm mx-auto sm:max-w-none w-full">
                    <Link
                      to={`/team/${member.slug || member.id}`}
                      className="group flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-xl
                                 hover:shadow-2xl hover:-translate-y-1 no-underline
                                 transition-all duration-300"
                    >
                      {/* Portrait */}
                      <div className="aspect-3/4 overflow-hidden">
                        <img
                          src={member.photoUrl}
                          alt={getName(member)}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-[1.04]"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-6 md:p-7 flex flex-col flex-1">
                        <h3 className="font-serif text-xl text-stone-900 font-normal leading-snug mb-1">
                          {getName(member)}
                        </h3>
                        <p className="text-stone-500 text-[10px] tracking-[0.18em] uppercase font-medium mb-4">
                          {getRole(member)}
                        </p>

                        {getSpecs(member).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 border-t border-stone-100 pt-4">
                            {getSpecs(member).map((s: string) => (
                              <span
                                key={s}
                                className="px-2.5 py-1 bg-stone-100 text-stone-600 text-[11px] font-medium rounded-full"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* View profile CTA */}
                        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between min-h-11">
                          <motion.span
                            key={i18n.language}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="text-sm font-medium text-stone-900 py-3 pr-4 inline-block"
                          >
                            {t('teamPage.grid.viewProfile')}
                          </motion.span>
                          <ArrowRight
                            size={15}
                            strokeWidth={1.75}
                            className="text-stone-900 transition-transform duration-300 group-hover:translate-x-1 shrink-0"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </div>
        </section>
      </div>

      <ConsultationBanner />
    </>
  )
}
