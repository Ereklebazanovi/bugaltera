// ScrollToTop.tsx

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Tell the browser not to restore scroll position on back/forward or refresh —
// we handle it ourselves so the behaviour is consistent.
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual'
}

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // When a hash is present the target page handles its own scroll
    if (hash) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname, hash])

  return null
}
