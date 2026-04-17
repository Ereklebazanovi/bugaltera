// api/sitemap.ts — Vercel Edge Function
// Generates a dynamic sitemap.xml that includes static pages plus all
// blog posts and team members fetched from Firebase at request time.
// Each entry gets ka / en / ru hreflang alternates.

export const config = { runtime: 'edge' }

const SITE = 'https://www.balance101.ge'

// ── Static pages ──────────────────────────────────────────────────────────────

interface StaticPage {
  path: string
  changefreq: string
  priority: string
}

const STATIC_PAGES: StaticPage[] = [
  { path: '/',         changefreq: 'weekly',  priority: '1.0' },
  { path: '/index.html', changefreq: 'weekly',  priority: '1.0' },
  { path: '/services', changefreq: 'monthly', priority: '0.9' },
  { path: '/contact',  changefreq: 'monthly', priority: '0.9' },
  { path: '/about',    changefreq: 'monthly', priority: '0.8' },
  { path: '/team',     changefreq: 'weekly',  priority: '0.8' },
  { path: '/blog',     changefreq: 'weekly',  priority: '0.7' },
  { path: '/partners', changefreq: 'monthly', priority: '0.6' },
  { path: '/terms',    changefreq: 'yearly',  priority: '0.3' },
  { path: '/privacy',  changefreq: 'yearly',  priority: '0.3' },
]

// ── Firestore REST helpers ────────────────────────────────────────────────────

interface FirestoreDoc {
  document?: {
    fields?: Record<string, { stringValue?: string; timestampValue?: string }>
    updateTime?: string
  }
}

async function firestoreQuery(
  projectId: string,
  apiKey: string,
  collectionId: string,
  selectFields: string[],
): Promise<FirestoreDoc[]> {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        select: { fields: selectFields.map(f => ({ fieldPath: f })) },
        orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
        limit: 500,
      },
    }),
  })

  if (!res.ok) return []
  return (await res.json()) as FirestoreDoc[]
}

// ── XML helpers ───────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Build hreflang alternates for ka, en, ru */
function hreflangs(path: string): string {
  const href = `${SITE}${path}`
  return [
    `    <xhtml:link rel="alternate" hreflang="ka"        href="${esc(href)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="en"        href="${esc(href)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="ru"        href="${esc(href)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(href)}"/>`,
  ].join('\n')
}

function urlEntry(
  path: string,
  lastmod: string,
  changefreq: string,
  priority: string,
): string {
  return `  <url>
    <loc>${esc(`${SITE}${path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangs(path)}
  </url>`
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(): Promise<Response> {
  const API_KEY    = process.env.VITE_FIREBASE_API_KEY    as string
  const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID as string

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  // Start with static pages
  const entries: string[] = STATIC_PAGES.map(p =>
    urlEntry(p.path, today, p.changefreq, p.priority),
  )

  // Fetch dynamic content from Firebase in parallel
  if (API_KEY && PROJECT_ID) {
    const [blogDocs, teamDocs] = await Promise.all([
      firestoreQuery(PROJECT_ID, API_KEY, 'posts', ['slug', 'createdAt']),
      firestoreQuery(PROJECT_ID, API_KEY, 'team',  ['slug', 'createdAt']),
    ])

    // Blog posts → /blog/:slug
    for (const row of blogDocs) {
      const fields = row.document?.fields
      if (!fields) continue
      const slug = fields.slug?.stringValue
      if (!slug) continue
      const lastmod = fields.createdAt?.timestampValue
        ? fields.createdAt.timestampValue.slice(0, 10)
        : today
      entries.push(urlEntry(`/blog/${slug}`, lastmod, 'monthly', '0.6'))
    }

    // Team members → /team/:slug (use slug field, fall back to doc ID)
    for (const row of teamDocs) {
      const fields = row.document?.fields
      if (!fields) continue
      const slug = fields.slug?.stringValue
        || row.document?.updateTime?.split('/').pop() // doc ID from path
      if (!slug) continue
      const lastmod = fields.createdAt?.timestampValue
        ? fields.createdAt.timestampValue.slice(0, 10)
        : today
      entries.push(urlEntry(`/team/${slug}`, lastmod, 'monthly', '0.6'))
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache for 1 hour at edge; serve stale for up to 24h while revalidating.
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
