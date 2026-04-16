// middleware.ts — Vercel Edge Middleware
// Intercepts social-media crawler requests on dynamic routes and internally
// rewrites them to server-side Edge Functions that return proper OG meta tags.
// Human browsers pass through normally to the SPA (index.html).

import { rewrite } from '@vercel/edge'

const BOT_UA =
  /facebookexternalhit|Facebot|twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Pinterest/i

export const config = {
  matcher: ['/blog/:path+', '/team/:path+'],
}

export default function middleware(request: Request): Response | undefined {
  const ua = request.headers.get('user-agent') ?? ''
  if (!BOT_UA.test(ua)) return // humans: fall through to SPA rewrite

  const { pathname, searchParams } = new URL(request.url)

  // ── Team member profiles ───────────────────────────────────────────────
  if (pathname.startsWith('/team/')) {
    const slug = pathname.split('/team/')[1]?.split('/')[0]
    if (!slug) return
    const target = new URL(request.url)
    target.pathname = '/api/team-og'
    target.search = `?slug=${encodeURIComponent(slug)}`
    return rewrite(target)
  }

  // ── Blog posts ─────────────────────────────────────────────────────────
  const slug = pathname.split('/blog/')[1]?.split('/')[0]
  if (!slug) return
  const lang = searchParams.get('lang') ?? 'ka'
  const target = new URL(request.url)
  target.pathname = '/api/og'
  target.search = `?slug=${encodeURIComponent(slug)}&lang=${encodeURIComponent(lang)}`
  return rewrite(target)
}
