import React from 'react'
import Header from '../components/Header'
import HeroBanner from '../components/HeroBanner'
import BrandShowcase from '../components/BrandShowcase'
import FeaturedCategories from '../components/FeaturedCategories'
import NewArrivals from '../components/NewArrivals'
import TrendingGear from '../components/TrendingGear'
import QuickShop from '../components/QuickShop'
import PromoCTA from '../components/PromoCTA'
import PerformanceHighlights from '../components/PerformanceHighlights'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'
import FloatingWhatsApp from '../components/FloatingWhatsApp'

function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header />
      <HeroBanner />
      <BrandShowcase />
      <FeaturedCategories />
      <NewArrivals />
      <TrendingGear />
      <QuickShop />
      <PromoCTA />
      <PerformanceHighlights />
      <Newsletter />
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}

export default Home
