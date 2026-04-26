// BlogPost.tsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarDays, Link2, Check, Sun, Moon } from 'lucide-react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'
import { db } from '../lib/firebase'
import ConsultationBanner from '../components/ConsultationBanner'
import SEO from '../components/SEO'

interface Post {
  id: string
  title_ka: string
  title_en?: string
  title_ru?: string
  excerpt_ka: string
  excerpt_en?: string
  excerpt_ru?: string
  content_ka: string
  content_en?: string
  content_ru?: string
  coverUrl: string
  slug: string
  createdAt: { toDate: () => Date } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date, lang: string): string {
  const locale = lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : 'ka-GE'
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Smart content renderer ────────────────────────────────────────────────────

function classifyParagraph(para: string): 'body' | 'meta' | 'quote' {
  const t = para.trim()
  // Blockquote: explicit > marker or Georgian/Unicode opening quote
  if (t.startsWith('>') || t.startsWith('„') || t.startsWith('\u201C')) return 'quote'
  // Single-line standard-quoted string
  if (t.startsWith('"') && !t.slice(1).includes('"') === false && t.split('\n').length === 1) return 'quote'
  // Metadata: every non-empty line is a short "label: value" pair
  const lines = t.split('\n').map(l => l.trim()).filter(Boolean)
  const isMeta = lines.length >= 1 && lines.length <= 6 && lines.every(line => {
    const c = line.indexOf(':')
    return c > 0 && c <= 30 && line.length > c + 1
  })
  return isMeta ? 'meta' : 'body'
}

function renderContent(
  content: string,
  isDark: boolean,
  divider: string,
  metaColor: string,
  firstParaCls: string,
) {
  let firstBodySeen = false
  return content.split(/\n\n+/).map((raw, i) => {
    const para = raw.trim()
    if (!para) return null

    switch (classifyParagraph(para)) {
      case 'quote': {
        const text = para.replace(/^[>„"\u201C]\s*/, '').replace(/["\u201D]$/, '').trim()
        return (
          <blockquote key={i}>
            <p>{text}</p>
          </blockquote>
        )
      }

      case 'meta': {
        const lines = para.split('\n').map(l => l.trim()).filter(Boolean)
        return (
          <div key={i} className={`not-prose py-5 border-y transition-colors duration-500 ${divider}`}>
            {lines.map((line, j) => {
              const c = line.indexOf(':')
              if (c < 1) return (
                <p key={j} className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{line}</p>
              )
              const label = line.substring(0, c)
              const value = line.substring(c + 1).trim()
              return (
                <div key={j} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-0.5">
                  <span className={`text-[10px] tracking-[0.25em] uppercase font-semibold shrink-0 transition-colors duration-500 ${metaColor}`}>
                    {label}:
                  </span>
                  <span className={`text-sm transition-colors duration-500 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    {value}
                  </span>
                </div>
              )
            })}
          </div>
        )
      }

      default: {
        const isFirst = !firstBodySeen
        if (isFirst) firstBodySeen = true
        return <p key={i} className={isFirst ? firstParaCls : undefined}>{para}</p>
      }
    }
  })
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { i18n } = useTranslation()
  const lang = i18n.language

  const getTitle   = (p: Post) =>
    lang === 'ru' ? (p.title_ru   || p.title_en   || p.title_ka)   :
    lang === 'en' ? (p.title_en   || p.title_ka)   : p.title_ka
  const getExcerpt = (p: Post) =>
    lang === 'ru' ? (p.excerpt_ru || p.excerpt_en || p.excerpt_ka) :
    lang === 'en' ? (p.excerpt_en || p.excerpt_ka) : p.excerpt_ka
  const getContent = (p: Post) =>
    lang === 'ru' ? (p.content_ru || p.content_en || p.content_ka) :
    lang === 'en' ? (p.content_en || p.content_ka) : p.content_ka

  const [post,        setPost]        = useState<Post | null>(null)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [copied,      setCopied]      = useState(false)
  const [isDark,      setIsDark]      = useState(false)
  const [showTop,     setShowTop]     = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!slug) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const q    = query(collection(db, 'posts'), where('slug', '==', slug))
        const snap = await getDocs(q)

        if (snap.empty) { setNotFound(true); setLoading(false); return }

        const d           = snap.docs[0]
        const currentPost = { id: d.id, ...(d.data() as Omit<Post, 'id'>) }
        setPost(currentPost)

        const recentQ    = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(4))
        const recentSnap = await getDocs(recentQ)
        const all        = recentSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Post, 'id'>) }))
        setRecentPosts(all.filter(p => p.id !== currentPost.id).slice(0, 3))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto animate-pulse space-y-5">
          <div className="h-3 w-24 bg-stone-200 rounded" />
          <div className="h-8 w-full bg-stone-200 rounded" />
          <div className="h-8 w-3/4 bg-stone-200 rounded" />
          <div className="h-5 w-full bg-stone-100 rounded mb-2" />
          <div className="w-full aspect-video bg-stone-200 rounded-2xl" />
          <div className="max-w-2xl mx-auto space-y-4 pt-4">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className={`h-4 bg-stone-100 rounded ${n % 4 === 0 ? 'w-2/3' : 'w-full'}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (notFound || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 bg-stone-50">
        <p className="font-serif text-2xl text-stone-700">სტატია ვერ მოიძებნა</p>
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
          <ArrowLeft size={14} />
          {lang === 'ru' ? 'Назад к блогу' : lang === 'en' ? 'Back to Blog' : 'ბლოგზე დაბრუნება'}
        </Link>
      </div>
    )
  }

  const formattedDate = post.createdAt?.toDate ? formatDate(post.createdAt.toDate(), lang) : null
  const shareUrl      = `${window.location.origin}/blog/${post.slug}?lang=${lang}`
  const openShare     = (url: string) => window.open(url, '_blank', 'noopener,noreferrer,width=640,height=500')
  const handleCopy    = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Derived theme tokens ────────────────────────────────────────────────────
  const pageBg        = isDark ? 'bg-stone-900'   : 'bg-stone-50'
  const titleColor    = isDark ? 'text-stone-100'  : 'text-navy-900'
  const metaColor     = isDark ? 'text-stone-500'  : 'text-stone-400'
  const excerptColor  = isDark ? 'text-stone-400'  : 'text-stone-500'
  const excerptBorder = isDark ? 'border-stone-700' : 'border-stone-300'
  const divider       = isDark ? 'border-stone-800' : 'border-stone-100'
  const cardBg        = isDark ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'
  const firstParaCls  = isDark
    ? '!text-xl md:!text-2xl !leading-relaxed !text-stone-100 !font-normal'
    : '!text-xl md:!text-2xl !leading-relaxed !text-stone-800 !font-normal'
  const backLinkCls   = isDark
    ? 'text-stone-500 hover:text-stone-200'
    : 'text-stone-400 hover:text-stone-900'
  const shareBtnCls   = isDark
    ? 'bg-stone-800 text-stone-400 hover:bg-stone-100 hover:text-stone-900'
    : 'bg-stone-100 text-stone-500 hover:bg-navy-900 hover:text-white'
  const toggleCls     = isDark
    ? 'border-stone-700 text-stone-400 bg-stone-800 hover:bg-stone-700'
    : 'border-stone-200 text-stone-500 bg-white hover:bg-stone-100'

  // ── Article ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title={getTitle(post)}
        description={getExcerpt(post)}
        image={post.coverUrl}
        path={`/blog/${post.slug}`}
        type="article"
        publishedTime={post.createdAt?.toDate?.()?.toISOString()}
      />

      <div className={`min-h-screen pb-20 transition-colors duration-500 ${pageBg}`}>

        {/* ── Top bar: back link + dark mode toggle ── */}
        <div className="max-w-3xl mx-auto px-4 md:px-6 pt-8 md:pt-12 flex items-center justify-between">
          <Link
            to="/blog"
            className={`inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-medium transition-colors duration-300 no-underline ${backLinkCls}`}
          >
            <ArrowLeft size={12} strokeWidth={2} />
            {lang === 'ru' ? 'Блог' : lang === 'en' ? 'Blog' : 'ბლოგი'}
          </Link>

          <button
            type="button"
            onClick={() => setIsDark(prev => !prev)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium tracking-wide transition-all duration-300 cursor-pointer border ${toggleCls}`}
            aria-label="Toggle reading mode"
          >
            {isDark
              ? <Sun  size={13} strokeWidth={2} aria-hidden="true" />
              : <Moon size={13} strokeWidth={2} aria-hidden="true" />
            }
            {isDark
              ? (lang === 'ru' ? 'Светлый' : lang === 'en' ? 'Light' : 'ნათელი')
              : (lang === 'ru' ? 'Тёмный'  : lang === 'en' ? 'Dark'  : 'მუქი')
            }
          </button>
        </div>

        {/* ── Article header ── */}
        <motion.header
          className="max-w-3xl mx-auto px-4 md:px-6 pt-10 pb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Date */}
          {formattedDate && (
            <div className={`flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-5 transition-colors duration-500 ${metaColor}`}>
              <CalendarDays size={13} strokeWidth={2} aria-hidden="true" />
              <span>{formattedDate}</span>
            </div>
          )}

          {/* Title */}
          <h1 className={`font-serif text-4xl md:text-5xl font-normal leading-tight tracking-tight mb-6 transition-colors duration-500 ${titleColor}`}>
            {getTitle(post)}
          </h1>

          {/* Excerpt / lead */}
          <p className={`text-lg md:text-xl font-light leading-relaxed border-l-2 pl-5 mb-8 transition-colors duration-500 ${excerptColor} ${excerptBorder}`}>
            {getExcerpt(post)}
          </p>

          {/* Share row */}
          <div>
            <p className={`text-[10px] tracking-[0.3em] uppercase font-semibold mb-3 transition-colors duration-500 ${metaColor}`}>
              {lang === 'ru' ? 'Поделиться' : lang === 'en' ? 'Share' : 'გაზიარება'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {/* Facebook */}
              <button
                type="button"
                onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-medium tracking-wide transition-all duration-200 cursor-pointer border-none ${shareBtnCls}`}
                aria-label="Share on Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Facebook
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-medium tracking-wide transition-all duration-200 cursor-pointer border-none ${shareBtnCls}`}
                aria-label="Share on LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </button>

              {/* Copy link */}
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-medium tracking-wide transition-all duration-200 cursor-pointer border-none ${
                  copied ? 'bg-stone-900 text-white' : shareBtnCls
                }`}
                aria-label="Copy link"
              >
                {copied
                  ? <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                  : <Link2 size={13} strokeWidth={2}   aria-hidden="true" />
                }
                {copied
                  ? (lang === 'ru' ? 'Скопировано!'   : lang === 'en' ? 'Copied!'    : 'კოპირებულია!')
                  : (lang === 'ru' ? 'Копировать ссылку' : lang === 'en' ? 'Copy Link' : 'ლინკის კოპირება')
                }
              </button>
            </div>
          </div>
        </motion.header>

        {/* ── Hero image — wider than text column ── */}
        <motion.div
          className="max-w-5xl mx-auto px-4 md:px-6 pb-12"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-stone-200">
            <img
              src={post.coverUrl}
              alt={getTitle(post)}
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </motion.div>

        {/* ── Article body — reading column ── */}
        <motion.article
          className="max-w-3xl mx-auto px-4 md:px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={[
            'prose prose-lg md:prose-xl prose-stone max-w-none',
            'prose-p:leading-loose prose-p:font-sans prose-p:whitespace-pre-wrap',
            'prose-blockquote:not-italic prose-blockquote:border-l-4',
            'prose-headings:font-serif prose-headings:font-normal',
            'transition-colors duration-500',
            isDark ? 'prose-invert [--tw-prose-invert-body:#e7e5e4]' : '',
          ].join(' ')}>
            {renderContent(getContent(post), isDark, divider, metaColor, firstParaCls)}
          </div>

          {/* Bottom: back link */}
          <div className={`mt-14 pt-8 border-t transition-colors duration-500 ${divider}`}>
            <Link
              to="/blog"
              className={`inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-medium transition-colors duration-300 no-underline ${backLinkCls}`}
            >
              <ArrowLeft size={12} strokeWidth={2} />
              {lang === 'ru' ? 'Назад к блогу' : lang === 'en' ? 'Back to Blog' : 'ბლოგზე დაბრუნება'}
            </Link>
          </div>
        </motion.article>

        {/* ── Related posts ── */}
        {recentPosts.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 md:px-8 pt-20 md:pt-28">
            <div className={`flex items-center gap-3 mb-8 border-b pb-4 transition-colors duration-500 ${divider}`}>
              <h2 className={`text-[10px] tracking-[0.35em] uppercase font-medium transition-colors duration-500 ${metaColor}`}>
                {lang === 'ru' ? 'Другие статьи' : lang === 'en' ? 'Recent Articles' : 'სხვა სტატიები'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {recentPosts.map(rp => (
                <Link
                  key={rp.id}
                  to={`/blog/${rp.slug}`}
                  className={`group rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col border ${cardBg}`}
                >
                  <div className="aspect-video overflow-hidden bg-stone-100">
                    <img
                      src={rp.coverUrl}
                      alt={getTitle(rp)}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className={`text-[10px] tracking-[0.2em] uppercase font-medium mb-2 transition-colors duration-500 ${metaColor}`}>
                      {rp.createdAt?.toDate ? formatDate(rp.createdAt.toDate(), lang) : '—'}
                    </p>
                    <h3 className={`font-serif text-base leading-snug mb-3 line-clamp-2 transition-colors duration-500 ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                      {getTitle(rp)}
                    </h3>
                    <div className={`mt-auto pt-3 border-t flex items-center justify-end transition-colors duration-500 ${divider}`}>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium transition-all duration-200 ${metaColor}`}>
                        {lang === 'ru' ? 'Читать далее' : lang === 'en' ? 'Read More' : 'სრულად ნახვა'}
                        <ArrowRight size={12} strokeWidth={1.75} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <ConsultationBanner />

      {/* ── Back to top ── */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-5 md:bottom-8 md:right-8 z-50 w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg hover:bg-stone-700 transition-colors duration-200 cursor-pointer"
            aria-label={lang === 'en' ? 'Back to top' : 'დასაწყისში დაბრუნება'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
