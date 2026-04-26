import HeroVariant from '../components/HeroVariant'
import BentoGrid from '../components/BentoGrid'
import ConsultationBanner from '../components/ConsultationBanner'
import SEO from '../components/SEO'

export default function HomeVariant() {
  return (
    <>
      <SEO path="/" />
      <HeroVariant />
      <BentoGrid />
      <ConsultationBanner />
    </>
  )
}
