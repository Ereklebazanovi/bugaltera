import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { db } from '../lib/firebase'
import SEO from '../components/SEO'
import ConsultationBanner from '../components/ConsultationBanner'

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
}

const ease = [0.22, 1, 0.36, 1] as const

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TeamProfile() {
  const { slug } = useParams<{ slug: string }>()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [otherMembers, setOtherMembers] = useState<Member[]>([])
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const getName  = (m: Member) =>
    lang === 'ru' ? (m.name_ru || m.name_en || m.name_ka) :
    lang === 'en' ? (m.name_en || m.name_ka) : m.name_ka
  const getRole  = (m: Member) =>
    lang === 'ru' ? (m.role_ru || m.role_en || m.role_ka) :
    lang === 'en' ? (m.role_en || m.role_ka) : m.role_ka
  const getBio   = (m: Member) =>
    lang === 'ru' ? (m.bio_ru  || m.bio_en  || m.bio_ka) :
    lang === 'en' ? (m.bio_en  || m.bio_ka) : m.bio_ka
  const getSpecs = (m: Member): string[] => {
    if (lang === 'ru') return (m.specializations_ru?.length ? m.specializations_ru : m.specializations_en?.length ? m.specializations_en : m.specializations_ka) ?? []
    if (lang === 'en') return (m.specializations_en?.length ? m.specializations_en : m.specializations_ka) ?? []
    return m.specializations_ka ?? []
  }

  // Scroll to top whenever the profile slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [slug])

  useEffect(() => {
    if (!slug) return
    const fetchMember = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        // 1. Try Firestore doc ID
        const docSnap = await getDoc(doc(db, 'team', slug))
        if (docSnap.exists()) {
          setMember({ id: docSnap.id, ...(docSnap.data() as Omit<Member, 'id'>) })
          return
        }
        // 2. Fallback: custom slug field
        const q = query(collection(db, 'team'), where('slug', '==', slug), limit(1))
        const snap = await getDocs(q)
        if (!snap.empty) {
          const d = snap.docs[0]
          setMember({ id: d.id, ...(d.data() as Omit<Member, 'id'>) })
        } else {
          setNotFound(true)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchMember()
  }, [slug])

  // Fetch all other team members once the current member's id is known
  useEffect(() => {
    if (!member) return
    const fetchOthers = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'team'), orderBy('createdAt', 'desc')))
        setOtherMembers(
          snap.docs
            .map(d => ({ id: d.id, ...(d.data() as Omit<Member, 'id'>) }))
            .filter(m => m.id !== member.id)
        )
      } catch {
        // non-critical — silently ignore
      }
    }
    fetchOthers()
  }, [member])

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="bg-[#ECEAE5] min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-stone-700 animate-spin" />
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────

  if (notFound || !member) {
    return (
      <div className="bg-[#ECEAE5] min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="font-serif text-2xl text-stone-500 font-normal">
          {lang === 'ru' ? 'Профиль не найден' : lang === 'en' ? 'Profile not found' : 'წევრი ვერ მოიძებნა'}
        </p>
        <Link
          to="/team"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-stone-400 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={10} />
          {t('teamPage.hero.eyebrow')}
        </Link>
      </div>
    )
  }

  const name  = getName(member)
  const role  = getRole(member)
  const bio   = getBio(member)
  const specs = getSpecs(member)

  return (
    <>
      <SEO
        title={name}
        description={bio.slice(0, 160)}
        image={member.photoUrl}
        path={`/team/${slug}`}
        canonical={`https://www.balance101.ge/team/${slug}`}
      />

      <div className="bg-[#ECEAE5] min-h-screen">

        {/* ── Mobile-only header: name + role shown ABOVE portrait ──────── */}
        <motion.div
          className="md:hidden px-6 pt-10 pb-7"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="w-8 h-[2px] bg-gold-500 mb-5" />
          <motion.p
            key={`role-mob-${lang}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="text-xs tracking-[0.30em] uppercase font-semibold text-stone-500 mb-3"
          >
            {role}
          </motion.p>
          <motion.h1
            key={`name-mob-${lang}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="font-serif text-3xl text-stone-900 font-normal leading-tight tracking-tight"
          >
            {name}
          </motion.h1>
        </motion.div>

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 pb-10 md:pt-20 md:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 lg:gap-20 items-start">

            {/* ── Photo column ──────────────────────────────────────────── */}
            <motion.div
              className="max-w-[260px] mx-auto w-full md:max-w-none md:col-span-5 md:sticky md:top-32"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
            >
              <div className="aspect-3/4 overflow-hidden rounded-2xl md:rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.13)] ring-1 ring-black/4">
                <img
                  src={member.photoUrl}
                  alt={name}
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-stone-400 hover:text-stone-800 transition-colors font-medium"
                >
                  <ExternalLink size={10} strokeWidth={1.75} />
                  LinkedIn
                </a>
              )}
            </motion.div>

            {/* ── Content column ────────────────────────────────────────── */}
            <motion.div
              className="md:col-span-7"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.12, ease }}
            >
              {/* Back link — desktop only */}
              <Link
                to="/team"
                className="hidden md:inline-flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-stone-500 hover:text-stone-900 transition-colors group mb-14"
              >
                <ArrowLeft size={13} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                {t('teamPage.hero.eyebrow')}
              </Link>

              {/* Gold bar + Role + Name — desktop only */}
              <div className="hidden md:block">
                <div className="w-8 h-[2px] bg-gold-500 mb-6" />
                <motion.p
                  key={`role-desk-${lang}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="text-xs tracking-[0.30em] uppercase font-semibold text-stone-500 mb-5"
                >
                  {role}
                </motion.p>
                <motion.h1
                  key={`name-desk-${lang}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="font-serif text-5xl md:text-6xl text-stone-900 font-normal leading-none tracking-tight mb-10 md:mb-6 md:mt-6"
                >
                  {name}
                </motion.h1>
              </div>

              {/* Section divider */}
              <div className="border-t border-stone-200 mb-8 md:mb-10" />

              {/* Specializations */}
              {specs.length > 0 && (
                <div className="mb-9 md:mb-11">
                  <p className="text-xs tracking-[0.3em] uppercase font-semibold text-stone-500 mb-4">
                    {lang === 'ru' ? 'Специализации' : lang === 'en' ? 'Areas of Practice' : 'სამართლის სფეროები'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {specs.map((s: string) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 border border-stone-300 bg-white/50 text-stone-600 text-[11px] font-medium rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Biography */}
              <div className="mb-12 md:mb-16">
                <p className="text-xs tracking-[0.3em] uppercase font-semibold text-stone-500 mb-5">
                  {lang === 'ru' ? 'Биография' : lang === 'en' ? 'Biography' : 'ბიოგრაფია'}
                </p>
                <p className="text-stone-700 text-[15px] md:text-base leading-[1.9] whitespace-pre-wrap break-words">
                  {bio}
                </p>
              </div>

              {/* CTAs */}
              <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-stone-900 text-white text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-stone-700 transition-colors duration-200 rounded-lg"
                >
                  {t('teamPage.modal.cta')}
                  <ArrowRight size={13} strokeWidth={2} />
                </Link>
                {/* Back button — desktop only */}
                <Link
                  to="/team"
                  className="hidden sm:inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-stone-300 text-stone-600 text-[11px] font-medium tracking-[0.15em] uppercase hover:border-stone-500 hover:text-stone-900 transition-all duration-200 rounded-lg"
                >
                  <ArrowLeft size={13} strokeWidth={1.75} />
                  {lang === 'ru' ? 'Команда' : lang === 'en' ? 'Back to Team' : 'გუნდი'}
                </Link>
              </div>

              {/* Back link — mobile only, subtle, anchored at bottom */}
           

            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Other Team Members ────────────────────────────────────────────── */}
      {otherMembers.length > 0 && (
        <section className="bg-[#ECEAE5] px-5 md:px-10 py-10 md:py-18 border-t border-stone-200">
          <div className="max-w-5xl mx-auto">

            {/* Heading */}
            <div className="flex items-center gap-3 mb-10 md:mb-14">
              <span className="block w-6 h-px bg-stone-400 shrink-0" />
              <motion.span
                key={lang}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-stone-500 text-[12px] tracking-[0.35em] uppercase font-medium"
              >
                {lang === 'ru' ? 'Другие специалисты' : lang === 'en' ? 'Other Experts' : 'გუნდის სხვა წევრები'}
              </motion.span>
            </div>

            {/* Grid */}
            <motion.div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {otherMembers.map(m => (
                <motion.div key={m.id} variants={cardVariant} className="h-full">
                  <Link
                    to={`/team/${m.slug || m.id}`}
                    className="group flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-lg
                               hover:shadow-xl hover:-translate-y-0.5 no-underline
                               transition-all duration-300"
                  >
                    {/* Portrait */}
                    <div className="aspect-3/4 overflow-hidden shrink-0">
                      <img
                        src={m.photoUrl}
                        alt={getName(m)}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-4 md:p-5 flex flex-col flex-1">
                      <h3 className="font-serif text-lg text-stone-900 font-normal leading-snug">
                        {getName(m)}
                      </h3>
                      <p className="text-stone-500 text-[10px] tracking-[0.20em] uppercase font-medium mt-0.5 mb-3">
                        {getRole(m)}
                      </p>
                      <div className="flex flex-wrap gap-1 flex-1 content-start">
                        {getSpecs(m).slice(0, 2).map(s => (
                          <span
                            key={s}
                            className="self-start px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-medium rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between shrink-0">
                        <span className="text-xs font-medium text-stone-800">
                          {t('teamPage.grid.viewProfile')}
                        </span>
                        <ArrowRight
                          size={13}
                          strokeWidth={1.75}
                          className="text-stone-800 transition-transform duration-300 group-hover:translate-x-1 shrink-0"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </section>
      )}

      <ConsultationBanner />
    </>
  )
}
