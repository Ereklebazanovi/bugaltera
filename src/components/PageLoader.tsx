import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logoBalance from '../assets/logoBalance.png'

export default function PageLoader() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const tid = setTimeout(() => setVisible(false), 700)
    return () => clearTimeout(tid)
  }, [pathname])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-navy-900"
        >
          {/* Logo */}
          <img
            src={logoBalance}
            alt="Balance101"
            className="h-20 w-auto object-contain brightness-0 invert"
          />

          {/* Pulse dots */}
          <motion.div
            className="flex items-center gap-1.5 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 h-1 rounded-full bg-gold-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
