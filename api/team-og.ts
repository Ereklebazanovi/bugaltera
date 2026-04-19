// api/team-og.ts — Vercel Edge Function
// Serves a minimal HTML shell with correct Open Graph meta tags for social
// media crawlers that cannot execute JavaScript.
// Called by middleware.ts when a bot hits /team/:slug.

export const config = { runtime: 'edge' }

const SITE_NAME    = 'ბალანსი 101'
const DEFAULT_TITLE = `${SITE_NAME} - საბუღალტრო კომპანია`
const DEFAULT_DESC  =
  'ბალანსი 101 - საქართველოში ბუღალტრული მომსახურების, საგადასახადო კონსულტაციის, აუდიტისა და ფინანსური მრჩეველობის სფეროში პროფესიონალური დახმარება.'

function esc(s: string): string {
  return s
    .replace(/&/g,  '&amp;')
    .replace(/"/g,  '&quot;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
}

interface TeamFields {
  name_ka?:  { stringValue?: string }
  name_en?:  { stringValue?: string }
  role_ka?:  { stringValue?: string }
  role_en?:  { stringValue?: string }
  bio_ka?:   { stringValue?: string }
  bio_en?:   { stringValue?: string }
  photoUrl?: { stringValue?: string }
  slug?:     { stringValue?: string }
}

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') ?? ''

  const SITE_URL   = ((process.env.VITE_SITE_URL   as string | undefined) ?? 'https://www.balance101.ge').replace(/\/$/, '')
  const API_KEY    = process.env.VITE_FIREBASE_API_KEY    as string
  const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID as string

  const pageUrl = `${SITE_URL}/team/${encodeURIComponent(slug)}`
  let title       = DEFAULT_TITLE
  let description = DEFAULT_DESC
  let image       = `${SITE_URL}/og-default.jpg`
  let imageIsPortrait = false   // portrait photos must NOT declare width/height

  if (slug && API_KEY && PROJECT_ID) {
    try {
      const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

      // Strategy 1: try slug as a Firestore document ID (fast, single read)
      let fields = await fetchById(base, slug, API_KEY)

      // Strategy 2: fallback — query the 'slug' field
      if (!fields) {
        fields = await queryBySlug(base, slug, API_KEY)
      }

      if (fields) {
        const nameEn = fields.name_en?.stringValue ?? ''
        const nameKa = fields.name_ka?.stringValue ?? ''
        const roleEn = fields.role_en?.stringValue ?? ''
        const roleKa = fields.role_ka?.stringValue ?? ''
        const bioEn  = fields.bio_en?.stringValue  ?? ''
        const bioKa  = fields.bio_ka?.stringValue  ?? ''
        const photo  = fields.photoUrl?.stringValue ?? ''

        // Prioritise Georgian — the firm's primary market.
        const name = nameKa || nameEn
        const role = roleKa || roleEn
        const bio  = (bioKa  || bioEn).slice(0, 300)

        if (name) title       = `${name}${role ? ` — ${role}` : ''} | ${SITE_NAME}`
        if (bio)  description = bio
        if (photo) {
          image = photo
          imageIsPortrait = true   // Firebase Storage portrait — don't declare dims
        }
      }
    } catch {
      // Network or parse error — fall back to site-level defaults
    }
  }

  const html = `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />

  <!-- Open Graph -->
  <meta property="og:type"             content="website" />
  <meta property="og:url"              content="${esc(pageUrl)}" />
  <meta property="og:site_name"        content="${esc(SITE_NAME)}" />
  <meta property="og:title"            content="${esc(title)}" />
  <meta property="og:description"      content="${esc(description)}" />
  <meta property="og:image"            content="${esc(image)}" />
  <meta property="og:image:secure_url" content="${esc(image)}" />
  <meta property="og:image:alt"        content="${esc(title)}" />${imageIsPortrait ? '' : `
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />`}

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
      // Cache at the edge for 1 hour; stale-while-revalidate for up to 24 h.
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

// ── Firestore helpers ──────────────────────────────────────────────────────────

async function fetchById(
  base: string,
  id: string,
  apiKey: string,
): Promise<TeamFields | null> {
  const url = `${base}/team/${encodeURIComponent(id)}?key=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) return null
  const doc = (await res.json()) as { fields?: TeamFields }
  return doc.fields ?? null
}

async function queryBySlug(
  base: string,
  slug: string,
  apiKey: string,
): Promise<TeamFields | null> {
  const url = `${base}:runQuery?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'team' }],
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
  if (!res.ok) return null
  const rows = (await res.json()) as Array<{ document?: { fields?: TeamFields } }>
  return rows?.[0]?.document?.fields ?? null
}
