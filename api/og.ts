// api/og.ts — Vercel Edge Function
// Serves a static HTML shell with correct Open Graph meta tags for social
// media crawlers that cannot execute JavaScript.
// Called by middleware.ts when a bot hits /blog/:slug.

export const config = { runtime: 'edge' }

const SITE_NAME = 'Darchia & Partners'
const DEFAULT_TITLE = `${SITE_NAME} — Attorneys at Law`
const DEFAULT_DESC =
  'Darchia & Partners — Expert legal counsel in corporate law, dispute resolution, and real estate in Georgia.'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

interface FirestoreFields {
  title_ka?: { stringValue?: string }
  title_en?: { stringValue?: string }
  excerpt_ka?: { stringValue?: string }
  excerpt_en?: { stringValue?: string }
  coverUrl?: { stringValue?: string }
}

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') ?? ''
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'ka'

  // These are available in Vercel's Edge Runtime from the project's env vars.
  const SITE_URL =
    ((process.env.VITE_SITE_URL as string | undefined) ?? 'https://www.darchiapartners.ge').replace(/\/$/, '')
  const API_KEY = process.env.VITE_FIREBASE_API_KEY as string
  const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID as string

  // Include ?lang= so Facebook treats each language version as a distinct URL
  // and caches them separately.
  const pageUrl = `${SITE_URL}/blog/${encodeURIComponent(slug)}?lang=${lang}`
  let title = DEFAULT_TITLE
  let description = DEFAULT_DESC
  let image = `${SITE_URL}/og-default.jpg`

  if (slug && API_KEY && PROJECT_ID) {
    try {
      // Firestore REST runQuery — no firebase-admin or service account required.
      const endpoint = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'posts' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'slug' },
                op: 'EQUAL',
                value: { stringValue: slug },
              },
            },
            limit: 1,
          },
        }),
      })

      const rows = (await resp.json()) as Array<{
        document?: { fields?: FirestoreFields }
      }>
      const fields = rows?.[0]?.document?.fields

      if (fields) {
        const titleKa = fields.title_ka?.stringValue ?? ''
        const titleEn = fields.title_en?.stringValue ?? ''
        const excerptKa = fields.excerpt_ka?.stringValue ?? ''
        const excerptEn = fields.excerpt_en?.stringValue ?? ''
        const coverUrl = fields.coverUrl?.stringValue

        // Strictly match the requested language; only fall back to Georgian
        // for English when no English translation exists yet.
        if (lang === 'en') {
          title = `${titleEn || titleKa} | ${SITE_NAME}`
          description = (excerptEn || excerptKa).slice(0, 200) || DEFAULT_DESC
        } else {
          title = `${titleKa} | ${SITE_NAME}`
          description = excerptKa.slice(0, 200) || DEFAULT_DESC
        }
        if (coverUrl) image = coverUrl
      }
    } catch {
      // Network or parse error — fall back to site-level defaults.
    }
  }

  // Only declare fixed dimensions for our own default image (1200×630).
  // Firebase Storage cover images vary — omitting prevents distorted previews.
  const isDefaultImage = image.endsWith('/og-default.jpg')

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />

  <!-- Open Graph -->
  <meta property="og:type"             content="article" />
  <meta property="og:url"              content="${esc(pageUrl)}" />
  <meta property="og:site_name"        content="${esc(SITE_NAME)}" />
  <meta property="og:title"            content="${esc(title)}" />
  <meta property="og:description"      content="${esc(description)}" />
  <meta property="og:image"            content="${esc(image)}" />
  <meta property="og:image:secure_url" content="${esc(image)}" />
  <meta property="og:image:alt"        content="${esc(title)}" />${isDefaultImage ? `
  <meta property="og:image:width"      content="1200" />
  <meta property="og:image:height"     content="630" />` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image"       content="${esc(image)}" />
  <meta name="twitter:image:alt"   content="${esc(title)}" />

  <link rel="canonical" href="${esc(pageUrl)}" />
</head>
<body></body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Cache at the edge for 1 hour; serve stale for up to 24 h while revalidating.
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
