import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import HeroVariant from '../components/HeroVariant'
import BentoGrid from '../components/BentoGrid'
import ConsultationBanner from '../components/ConsultationBanner'
import SEO from '../components/SEO'

// Shape of the Firestore document at pages/home
export interface HomePageCms {
  hero:   Record<string, string>
  bento:  Record<string, string>
  banner: Record<string, string>
}

export default function HomeVariant() {
  const [cms, setCms] = useState<HomePageCms | null>(null)

  useEffect(() => {
    getDoc(doc(db, 'pages', 'home')).then((snap) => {
      if (snap.exists()) setCms(snap.data() as HomePageCms)
    })
  }, [])

  return (
    <>
      <SEO path="/" />
      <HeroVariant   cms={cms?.hero   ?? null} />
      <BentoGrid     cms={cms?.bento  ?? null} />
      <ConsultationBanner />
    </>
  )
}
