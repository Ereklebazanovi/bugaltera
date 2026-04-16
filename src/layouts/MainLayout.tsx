import type { ReactNode } from 'react'
import SEO from '../components/SEO'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-200 text-stone-900 overflow-x-hidden w-full">
      <SEO />
      <Header />
      <main className="flex-1 pt-14 lg:pt-16">{children}</main>
      <Footer />
    </div>
  )
}
