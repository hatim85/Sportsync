import React from 'react'
import Header from '../components/Header'
import CategoryCard from '../components/CategoryCard'
import ImageGallery from '../components/ImageGallery'
import BigCategoryCard from '../components/BigCategoryCard'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'

function Home() {
  return (
    <>
    {/* Refresh the page in cart for see the reflecting changes sometimes it doesn't update the changes directly  */}
      <Header />
      <div className='flex'>
        <ImageGallery />
      </div>
      <div className='flex justify-center mb-10 mt-10'>
        <CategoryCard />
      </div>
      <div className="flex overflow-x-auto md:flex-wrap mb-10 mt-14">
        <BigCategoryCard />
      </div>
      <div className='flex m-auto md:justify-normal justify-center flex-wrap'>
        <ProductCard />
      </div>
      <Footer />
    </>
  )
}

export default Home