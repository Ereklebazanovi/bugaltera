import HeroVariant from '../components/HeroVariant'
import BentoGrid from '../components/BentoGrid'
import SEO from '../components/SEO'

export default function HomeVariant() {
  return (
    <>
      <SEO
        title="ადვოკატი და იურიდიული მომსახურება - Darchia & Partners"
        description="პროფესიონალური იურიდიული კონსულტაცია და საადვოკატო მომსახურება თბილისში. ჩვენი გუნდი დაგეხმარებათ სამოქალაქო, სისხლისა და ბიზნეს სამართლის საკითხებში."
        keywords="ადვოკატი, საადვოკატო ბიურო, იურიდიული მომსახურება, იურიდიული კონსულტაცია, ადვოკატი თბილისში, სამოქალაქო სამართალი, სისხლის სამართალი, ადმინისტრაციული სამართალი, ბიზნეს სამართალი, დარჩია და პარტნიორები, Darchia Partners, law firm Tbilisi, lawyer Georgia, legal services Tbilisi"
        path="/"
      />
      <HeroVariant />
      <BentoGrid />
    </>
  )
}
