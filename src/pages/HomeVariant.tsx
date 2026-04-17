import HeroVariant from '../components/HeroVariant'
import BentoGrid from '../components/BentoGrid'
import SEO from '../components/SEO'

export default function HomeVariant() {
  return (
    <>
      <SEO
        title="ბუღალტერია და ფინანსური მომსახურება — Balance101 • ბალანსი 101"
        description="პროფესიონალური საბუღალტრო და ფინანსური მომსახურება თბილისში. ჩვენი გუნდი დაგეხმარებათ ბუღალტრული აღრიცხვის, საგადასახადო კონსულტაციისა და ფინანსური დაგეგმვის საკითხებში."
        keywords="ბუღალტერია, საბუღალტრო მომსახურება, ფინანსური კონსულტაცია, საგადასახადო კონსულტაცია, ბუღალტერი თბილისში, ბალანსი 101, Balance101, accounting Tbilisi, financial services Georgia"
        path="/"
      />
      <HeroVariant />
      <BentoGrid />
    </>
  )
}
