import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { Phone, Mail, CheckCircle, ChevronDown, MapPin, ExternalLink } from 'lucide-react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'

// ── Shared styles ────────────────────────────────────────────────────────────

const fieldCls =
  'w-full bg-stone-100/50 rounded-lg px-4 py-3 text-[14px] font-normal text-stone-900 placeholder:text-stone-500 outline-none focus:bg-white focus:ring-1 focus:ring-stone-900/10 transition-all duration-200'

const labelCls =
  'block text-[10px] tracking-[0.15em] uppercase font-semibold text-stone-700 mb-1.5'

// ── Phone helpers ────────────────────────────────────────────────────────────

/** Format 9 Georgian digits as 5XX XX XX XX (partial values handled). */
function formatNineDigits(d: string): string {
  if (!d) return ''
  let out = d.slice(0, 3)
  if (d.length > 3) out += ' ' + d.slice(3, 5)
  if (d.length > 5) out += ' ' + d.slice(5, 7)
  if (d.length > 7) out += ' ' + d.slice(7, 9)
  return out
}

/**
 * Extract up to 9 user-typed digits from any phone string, stripping the
 * +995 country code if the user pastes a full number.
 */
function parsePhoneInput(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('995')) d = d.slice(3)  // +995 5XX... → 5XX...
  return d.slice(0, 9)
}

// ── PhoneInput component ─────────────────────────────────────────────────────
function PhoneInput({
  digits,
  onChange,
  shakeKey,
  error,
}: {
  digits: string
  onChange: (d: string) => void
  shakeKey: number
  error?: string
}) {
  const controls = useAnimationControls()

  // Trigger shake whenever shakeKey increments
  useEffect(() => {
    if (shakeKey === 0) return
    controls.start({
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.38, ease: 'easeInOut' },
    })
  }, [shakeKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const complete = digits.length === 9
  const hasTyped  = digits.length > 0

  return (
    <div>
      <motion.div animate={controls}>
        {/* Prefix lock + input row */}
        <div className="flex items-center bg-stone-100/50 rounded-lg px-4 py-3 focus-within:bg-white focus-within:ring-1 focus-within:ring-stone-900/10 transition-all duration-200">
          <span className="text-[14px] font-light text-stone-500 select-none shrink-0 mr-0.5">
            +995
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={formatNineDigits(digits)}
            onChange={e => onChange(parsePhoneInput(e.target.value))}
            placeholder="XXX XX XX XX"
            className="flex-1 bg-transparent outline-none text-[14px] font-normal text-stone-900 placeholder:text-stone-500 min-w-0"
          />
        </div>

        {/* Progress bar — only visible once user starts typing */}
        {hasTyped && (
          <div className="mt-1.5 h-0.5 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className={complete ? 'h-full bg-stone-900' : 'h-full bg-orange-400'}
              initial={{ width: 0 }}
              animate={{ width: `${(digits.length / 9) * 100}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>
        )}
      </motion.div>

      {/* Validation error */}
      {error && (
        <p className="text-red-400 text-[11px] font-light mt-1.5">{error}</p>
      )}
    </div>
  )
}

// ── Custom Select ────────────────────────────────────────────────────────────

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-stone-100/50 rounded-lg px-4 py-3 text-[14px] font-light text-left outline-none focus:bg-white focus:ring-1 focus:ring-stone-900/10 transition-all duration-200 flex items-center justify-between gap-3"
      >
        <span className={value ? 'text-stone-900' : 'text-stone-400'}>
          {value || placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <ChevronDown size={14} strokeWidth={1.5} className="text-stone-500" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 w-full mt-1.5 bg-white border border-stone-100 rounded-lg shadow-2xl z-50 overflow-hidden py-1"
          >
            {options.map(opt => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] font-light transition-colors duration-150 hover:bg-stone-50 hover:text-stone-900 ${
                    value === opt ? 'bg-stone-50 text-stone-900' : 'text-stone-600'
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Contact() {
  const { t, i18n } = useTranslation()

  // topics come from i18n JSON — returnObjects:true gets the array
  const topics = t('contact.topics', { returnObjects: true }) as string[]

  const [submitted, setSubmitted]         = useState(false)
  const [confirming, setConfirming]       = useState(false)
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [phoneShakeKey, setPhoneShakeKey] = useState(0)
  // errors store i18n keys, translated at render time
  const [errors, setErrors]               = useState<{ name?: string; phone?: string; email?: string }>({})
  const [form, setForm] = useState({ name: '', phone: '', email: '', topic: '', message: '' })

  // Reset topic selection on language switch — stored value won't match new options
  useEffect(() => {
    setForm(f => ({ ...f, topic: '' }))
  }, [i18n.language])

  function validate(): boolean {
    const errs: { name?: string; phone?: string; email?: string } = {}

    if (!form.name.trim()) {
      errs.name = 'contact.errors.nameRequired'
    }

    if (form.phone.length === 0) {
      errs.phone = 'contact.errors.phoneRequired'
      setPhoneShakeKey(k => k + 1)
    } else if (form.phone.length < 9 || !form.phone.startsWith('5')) {
      errs.phone = 'contact.errors.phoneInvalid'
      setPhoneShakeKey(k => k + 1)
    }

    const email = form.email.trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'contact.errors.emailInvalid'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (validate()) setConfirming(true)
  }
async function handleConfirm() {
    setIsSubmitting(true)
    try {
      // 1. ინახავს მესიჯს შენი ბაზის contacts კოლექციაში
      await addDoc(collection(db, 'contacts'), {
        name: form.name,
        phone: fullPhone,
        email: form.email.trim() || null,
        topic: form.topic || null,
        message: form.message.trim() || null,
        createdAt: new Date(),
        read: false,
      })

      // 2. ვამზადებთ ლამაზ HTML-ს ადმინისთვის
      const adminHtml = `
        <div style="font-family: sans-serif; color: #1c1917; line-height: 1.6;">
          <h3 style="margin-bottom: 20px;">ახალი მოთხოვნა საიტიდან</h3>
          <p><strong>სახელი:</strong> ${form.name}</p>
          <p><strong>ტელეფონი:</strong> ${fullPhone}</p>
          ${form.email.trim() ? `<p><strong>ელ-ფოსტა:</strong> ${form.email.trim()}</p>` : ''}
          ${form.topic ? `<p><strong>თემა:</strong> ${form.topic}</p>` : ''}
          ${form.message.trim() ? `<p><strong>შეტყობინება:</strong><br><span style="color: #57534e;">${form.message.trim()}</span></p>` : ''}
        </div>
      `;
      // 3. ვამზადებთ ექსთენშენისთვის პირველ დავალებას (ადმინთან გაგზავნა)
      const mailPromises: Promise<unknown>[] = [
        addDoc(collection(db, 'mail'), {
          to: 'Balance.101@Outlook.com', // ეს გადასაცვლელია იმ ადმინის მეილზე, ვინც უნდა მიიღოს შეტყობინება

          message: {
            subject: `ახალი შეტყობინება საიტიდან: ${form.name}`,
            html: adminHtml,
          },
        }),
      ]

      // 4. თუ მომხმარებელმა მეილი ჩაწერა, ვამზადებთ მისთვისაც ლამაზ პასუხს
      const userEmail = form.email.trim()
      if (userEmail) {
        const userHtml = `
          <div style="font-family: sans-serif; color: #1c1917; line-height: 1.6;">
            <p>მოგესალმებით <strong>${form.name}</strong>,</p>
            <p>თქვენი შეტყობინება წარმატებით მივიღეთ. ჩვენი გუნდის წევრი გაეცნობა თქვენს საკითხს და უმოკლეს დროში დაგიკავშირდებათ მითითებულ ნომერზე ან ელ-ფოსტაზე.</p>
            <br>
            <p style="margin-bottom: 5px;">პატივისცემით,</p>
            <p style="margin-top: 0;"><strong>Balance101</strong><br>
            <span style="font-size: 12px; color: #78716c;">საბუღალტრო და ფინანსური მომსახურება</span></p>
          </div>
        `;


mailPromises.push(
          addDoc(collection(db, 'mail'), {
            to: userEmail,
            replyTo: 'Balance.101@Outlook.com', // ეს გადასაცვლელია იმ მეილზე, საიდანაც გინდა რომ პასუხი მოვიდეს (შეიძლება იგივე იყოს, რაც ადმინის მეილი) ანუ მათ რეალურ ბიუროს მეილი უნდა შევიყვანო რომ რეფლი პირდაპირ იქ წავიდეს
            message: {
              subject: 'Balance101 - შეტყობინება მიღებულია',
              html: userHtml,
            },
          }),
        )
      }

      // 5. ვუშვებთ ორივე მეილს ერთდროულად
      await Promise.all(mailPromises)

      setConfirming(false)
      setSubmitted(true)
    } catch (err) {
      console.error('Firestore submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }
  // Full formatted number for modal/backend: "+995 5XX XX XX XX"
  const fullPhone = form.phone.length > 0
    ? '+995 ' + formatNineDigits(form.phone)
    : ''

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="დაგვიკავშირდით — Balance101 • ბალანსი 101"
        description="დაუკავშირდით Balance101-ის გუნდს. მიიღეთ პროფესიონალური საბუღალტრო და ფინანსური კონსულტაცია თბილისში."
        keywords="contact accountant tbilisi, accounting consultation georgia, bookkeeping services tbilisi, balance101 contact, financial services phone tbilisi"
        path="/contact"
      />

      {/* key={i18n.language} remounts this div on language switch → triggers fade-in */}
     <motion.div
        key={i18n.language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }} // 👈 აქ შევცვალეთ
        className="max-w-xl mx-auto px-5 md:px-8 pt-6 pb-16"
      >

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-9 pb-6 border-b border-stone-100">
          <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-stone-400 mb-3 block">
            {t('contact.eyebrow')}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-stone-900 font-normal leading-snug mb-3">
            {t('contact.title')}
          </h1>
          <p className="text-stone-500 text-[14px] md:text-[15px] font-normal leading-relaxed max-w-prose">
            {t('contact.description')}
          </p>
        </div>

        {/* ── Form / Success ───────────────────────────────────────────────── */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-14 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
              className="w-14 h-14 rounded-full bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center mb-6"
            >
              <CheckCircle size={22} strokeWidth={1.5} className="text-emerald-700" />
            </motion.div>
            <h2 className="font-serif text-xl text-stone-900 font-normal mb-2">
              {t('contact.success.title')}
            </h2>
            <p className="text-stone-400 text-sm font-light leading-relaxed">
              {t('contact.success.body')}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className={labelCls}>{t('contact.fields.name')}</label>
              <input
                type="text"
                value={form.name}
                onChange={e => {
                  setForm(f => ({ ...f, name: e.target.value }))
                  setErrors(er => ({ ...er, name: undefined }))
                }}
                className={`${fieldCls}${errors.name ? ' ring-1 ring-red-300' : ''}`}
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="text-red-400 text-[11px] font-light mt-1.5"
                  >
                    {t(errors.name)}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Phone — locked prefix + progress bar + shake */}
            <div>
              <label className={labelCls}>
                {t('contact.fields.phone')}{' '}
                <span className="text-stone-400 normal-case font-light">*</span>
              </label>
              <PhoneInput
                digits={form.phone}
                onChange={phone => {
                  setForm(f => ({ ...f, phone }))
                  setErrors(er => ({ ...er, phone: undefined }))
                }}
                shakeKey={phoneShakeKey}
                error={errors.phone ? t(errors.phone) : undefined}
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label className={labelCls}>
                {t('contact.fields.email')}{' '}
                <span className="text-stone-400 normal-case font-light">{t('contact.optional')}</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => {
                  setForm(f => ({ ...f, email: e.target.value }))
                  setErrors(er => ({ ...er, email: undefined }))
                }}
                placeholder="example@gmail.com"
                className={`${fieldCls}${errors.email ? ' ring-1 ring-red-200' : ''}`}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="text-red-400 text-[11px] font-light mt-1.5"
                  >
                    {t(errors.email)}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Practice area */}
            <div>
              <label className={labelCls}>
                {t('contact.fields.topic')}{' '}
                <span className="text-stone-400 normal-case font-light">{t('contact.optional')}</span>
              </label>
              <CustomSelect
                value={form.topic}
                onChange={topic => setForm(f => ({ ...f, topic }))}
                options={topics}
                placeholder={t('contact.fields.topicPlaceholder')}
              />
            </div>

            {/* Message */}
            <div>
              <label className={labelCls}>
                {t('contact.fields.message')}{' '}
                <span className="text-stone-400 normal-case font-light">{t('contact.optional')}</span>
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder={t('contact.fields.messagePlaceholder')}
                className={`${fieldCls} resize-none h-28 leading-relaxed`}
              />
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full bg-stone-900 text-white py-3.5 rounded-lg text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-stone-800 transition-colors duration-200"
              >
                {t('contact.submit')}
              </button>
            </div>

          </form>
        )}

        {/* ── Contact strip ────────────────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-stone-100 flex flex-col sm:flex-row gap-3 sm:gap-8">
          <a href="tel:+995511411604" className="flex items-center gap-2.5 no-underline group">
            <Phone size={13} strokeWidth={1.5} className="text-stone-400 shrink-0" />
            <span className="text-stone-700 text-sm font-light group-hover:text-stone-900 transition-colors duration-200">
             032 219 08 39

            </span>
          </a>
          <a href="mailto:Balance.101@Outlook.com" className="flex items-center gap-2.5 no-underline group">
            <Mail size={13} strokeWidth={1.5} className="text-stone-400 shrink-0" />
            <span className="text-stone-700 text-sm font-light group-hover:text-stone-900 transition-colors duration-200">
              Balance.101@Outlook.com
            </span>
          </a>
        </div>

      </motion.div>

      {/* ── Map section ──────────────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-t border-stone-100 px-5 md:px-8 py-2 md:py-16">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="block w-5 h-px bg-stone-300 shrink-0" />
              <span className="text-stone-400 text-[10px] tracking-[0.35em] uppercase font-medium">
                {t('contact.location.eyebrow')}
              </span>
              <span className="block w-5 h-px bg-stone-300 shrink-0" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 font-normal">
              {t('contact.location.heading')}
            </h2>
          </div>

          {/* Card: map + info bar */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-200 overflow-hidden">
            {/* Map */}
            <div className="w-full aspect-square sm:aspect-16/10 md:aspect-video">
              <iframe
                title="Balance101"
                src="[PLACEHOLDER_MAPS_EMBED_URL]"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block w-full h-full border-0"
                allowFullScreen
              />
            </div>

            {/* Info bar */}
            <div className="px-5 md:px-7 py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 sm:justify-between border-t border-stone-100">
              {/* Address */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/10 shrink-0">
                  <MapPin size={14} strokeWidth={1.8} className="text-gold-600" />
                </div>
                <div>
                  <p className="text-stone-900 text-sm font-medium leading-snug">
                    {t('contact.location.address')}
                  </p>
                  <p className="text-stone-400 text-xs font-light">
                    {t('contact.location.city')}
                  </p>
                </div>
              </div>

              {/* Directions button */}
              <a
                href="[PLACEHOLDER_MAPS_URL]"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-[10px] tracking-[0.18em] uppercase font-semibold rounded-lg hover:bg-stone-800 transition-colors duration-200 no-underline shrink-0"
              >
                <ExternalLink size={11} strokeWidth={2} />
                {t('contact.location.directions')}
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── Confirmation modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirming && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setConfirming(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="w-full max-w-sm bg-white rounded-2xl px-6 pt-7 pb-7 shadow-2xl pointer-events-auto"
              >

                <h3 className="font-serif text-lg text-stone-900 font-normal mb-1">
                  {t('contact.modal.title')}
                </h3>
                <p className="text-stone-500 text-xs font-normal mb-6 leading-relaxed">
                  {t('contact.modal.body')}
                </p>

                <div className="space-y-2 mb-8">
                  <div className="flex items-center gap-3 bg-stone-50 rounded-lg px-4 py-3">
                    <Phone size={13} strokeWidth={1.5} className="text-stone-400 shrink-0" />
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase font-semibold text-stone-500 mb-0.5">
                        {t('contact.modal.phone')}
                      </p>
                      <p className="text-stone-900 text-sm font-light">{fullPhone}</p>
                    </div>
                  </div>
                  {form.email.trim() && (
                    <div className="flex items-center gap-3 bg-stone-50 rounded-lg px-4 py-3">
                      <Mail size={13} strokeWidth={1.5} className="text-stone-400 shrink-0" />
                      <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase font-semibold text-stone-500 mb-0.5">
                          {t('contact.modal.email')}
                        </p>
                        <p className="text-stone-900 text-sm font-light">{form.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="py-3 rounded-lg border border-stone-200 text-stone-600 text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-stone-50 transition-colors duration-200"
                  >
                    {t('contact.modal.back')}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="py-3 rounded-lg bg-stone-900 text-white text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-stone-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '...' : t('contact.modal.confirm')}
                  </button>
                </div>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
