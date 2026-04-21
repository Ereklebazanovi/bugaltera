import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logoBalance from '../assets/logoBalance.png'

export default function PageLoader() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setVisible(true)
    const tid = setTimeout(() => setVisible(false), 400)
    return () => clearTimeout(tid)
  }, [pathname])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        >
          <motion.img
            src={logoBalance}
            alt="Balance 101"
            className="w-36 select-none pointer-events-none"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
