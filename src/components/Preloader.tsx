import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logoBalance from '../assets/logoBalance.png'

const SESSION_KEY = 'preloader_shown'

export default function Preloader() {
  const [visible, setVisible] = useState(() => {
    if (import.meta.env.DEV) sessionStorage.removeItem(SESSION_KEY)
    return sessionStorage.getItem(SESSION_KEY) !== 'true'
  })
  const [logoSettled, setLogoSettled] = useState(false)

  useEffect(() => {
    if (!visible) return
    sessionStorage.setItem(SESSION_KEY, 'true')
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center"
          style={{ backgroundColor: '#EEF4F4' }}
          initial={{ opacity: 1 }}

          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Logo */}
          <motion.img
            src={logoBalance}
            alt="Balance 101"
            className="w-52 select-none pointer-events-none"
            initial={{ y: 32, scale: 0.85, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              setLogoSettled(true)
              setTimeout(() => setVisible(false), 900)
            }}
          />

          {/* Thin animated line */}
          <div className="mt-8 h-0.5 overflow-hidden rounded-full" style={{ width: 56, backgroundColor: '#e2e8e8' }}>
            <AnimatePresence>
              {logoSettled && (
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#0D1F3C' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
