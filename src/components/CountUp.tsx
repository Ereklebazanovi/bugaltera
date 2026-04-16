import { useRef, useEffect, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
  num: number
  suffix: string
  duration?: number
  /** ms to wait before starting (useful for staggered hero reveals) */
  delay?: number
}

/**
 * Animates a number from 0 → num once the element scrolls into view.
 * Uses ease-out cubic so it decelerates at the end — feels precise, not bouncy.
 */
export default function CountUp({ num, suffix, duration = 1600, delay = 0 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let rafId: number
    const tid = setTimeout(() => {
      let t0: number | null = null
      const step = (ts: number) => {
        if (!t0) t0 = ts
        const p = Math.min((ts - t0) / duration, 1)
        setCount(Math.round((1 - (1 - p) ** 3) * num)) // ease-out cubic
        if (p < 1) rafId = requestAnimationFrame(step)
      }
      rafId = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(tid); cancelAnimationFrame(rafId) }
  }, [isInView, num, duration, delay])

  return <span ref={ref}>{count}{suffix}</span>
}
