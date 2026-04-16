import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Full-screen "Quiet Luxury" page loader.
 *
 * Shows on every route change (including initial load/refresh):
 *   0 ms  → overlay fades in instantly
 *   80ms  → logo slides up into view
 *  120ms  → thin progress line animates left-to-right
 *  650ms  → setVisible(false) triggers exit
 *  650ms+ → overlay slides up out of frame (550ms ease), revealing new page
 *
 * The #ECEAE5 background matches the Hero section so the transition
 * feels like a single continuous material rather than an alien overlay.
 */
export default function PageLoader() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const tid = setTimeout(() => setVisible(false), 650)
    return () => clearTimeout(tid)
  }, [pathname])

  return (
    <AnimatePresence>
      {visible && (
      <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#ECEAE5]"
        >
          {/* Logo wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <span className="font-sans text-[13px] font-semibold tracking-[0.25em] text-stone-900 uppercase">
              DARCHIA <span className="text-stone-400">&amp;</span> PARTNERS
            </span>
            <span className="text-[7px] font-medium tracking-[0.45em] text-stone-400 mt-1.5 uppercase">
              Attorneys at Law
            </span>
          </motion.div>

          {/* Progress line — grows left → right */}
          <motion.div
            className="mt-7 h-px bg-stone-400 w-14"
            style={{ transformOrigin: 'left center' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.52, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
