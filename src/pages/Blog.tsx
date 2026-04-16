//Blog.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import ConsultationBanner from '../components/ConsultationBanner'
import SEO from '../components/SEO'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Post {
  id: string
  title_ka: string
  title_en?: string
  excerpt_ka: string
  excerpt_en?: string
  coverUrl: string
  slug: string
  createdAt: { toDate: () => Date } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date, lang: string): string {
  return date.toLocaleDateString(lang === 'ge' ? 'ka-GE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── Animation variants ────────────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-video bg-stone-200" />
      <div className="p-6 flex flex-col gap-3">
        <div className="h-3 w-24 bg-stone-200 rounded" />
        <div className="h-5 w-full bg-stone-200 rounded" />
        <div className="h-5 w-4/5 bg-stone-200 rounded" />
        <div className="h-3 w-full bg-stone-100 rounded mt-1" />
        <div className="h-3 w-3/4 bg-stone-100 rounded" />
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Blog() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
const getTitle = (p: Post) => i18n.language === 'en' ? (p.title_en || p.title_ka) : p.title_ka;
  const getExcerpt = (p: Post) => i18n.language === 'en' ? (p.excerpt_en || p.excerpt_ka) : p.excerpt_ka;
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setPosts(
          snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Post, 'id'>) }))
        )
      } catch (err) {
        console.error('Firestore fetch failed:', err)
        setError('სტატიების ჩატვირთვა ვერ მოხერხდა. სცადეთ გვერდის განახლება.')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <>
      <SEO
        title="იურიდიული სტატიები და სიახლეები — Darchia & Partners"
        description="წაიკითხეთ საინტერესო სტატიები სამართლის სხვადასხვა სფეროზე Darchia & Partners-ის ადვოკატებისგან. სამოქალაქო, სისხლის, კორპორატიული და ადმინისტრაციული სამართალი."
        keywords="legal blog georgia, law articles tbilisi, georgian law analysis, civil law blog, criminal law news georgia, legal news 2025, darchia blog"
        path="/blog"
        canonical="https://www.darchiapartners.ge/blog"
      />

      {/* ── Typographic hero ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-200 px-4 md:px-8 pt-12 pb-8 md:pt-16 md:pb-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="flex items-center gap-3 mb-4 md:mb-5">
              <span className="block w-5 h-px bg-stone-400 shrink-0" />
              <span className="text-stone-500 text-[10px] tracking-[0.35em] uppercase font-medium">
                {t('blogPage.hero.eyebrow')}
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 font-normal leading-none tracking-tight">
              {t('blogPage.hero.heading')}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ── Articles grid ─────────────────────────────────────────────────── */}
      <div className="bg-[#ECEAE5]">
        <section className="px-4 md:px-8 py-10 md:py-16">
          <div className="max-w-6xl mx-auto">

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
              </div>
            ) : error ? (
              <p className="text-stone-400 text-sm text-center py-16">{error}</p>
            ) : posts.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-16">სტატიები ვერ მოიძებნა.</p>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={gridVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {posts.map((post) => (
                  <motion.article
                    key={post.id}
                    variants={cardVariant}
                    className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <Link to={`/blog/${post.slug}`} className="aspect-video overflow-hidden shrink-0 block">
                      <img
                        src={post.coverUrl}
                        alt={getTitle(post)}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </Link>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex flex-col flex-1">
                        {/* Date */}
                        <p className="text-[11px] tracking-[0.22em] uppercase text-stone-400 font-medium mb-4">
                          {post.createdAt?.toDate
                            ? formatDate(post.createdAt.toDate(), lang)
                            : '—'}
                        </p>

                        {/* Title */}
                        <h3 className="font-serif text-xl text-stone-900 font-normal leading-snug mb-3">
                          {getTitle(post)}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-stone-500 text-sm font-light leading-relaxed line-clamp-3 flex-1">
                          {getExcerpt(post)}
                        </p>

                        {/* Footer */}
                        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-end">
                          <Link
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-1.5 text-stone-600 text-sm font-medium hover:gap-2.5 transition-all duration-200 no-underline"
                          >
                            {t('blogPage.readMore')}
                            <ArrowRight
                              size={13}
                              strokeWidth={1.75}
                              className="transition-transform duration-300 group-hover:translate-x-0.5"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
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
