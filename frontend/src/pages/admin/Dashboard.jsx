import React, { useEffect, useState } from 'react'
import { FaHome } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import Product from './Product'
import DashSidebar from './DashSidebar';
import Category from './Category';
import Users from './Users';
import Order from './Order';
import ProductUpdate from './ProductUpdate';
import CategoryUpdate from './CategoryUpdate';


function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('products')

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search])
  return (
    <>
      <div className='flex flex-col md:flex-row md:justify-center items-start md:items-center w-full min-h-[100px] bg-card border-b border-border py-6 md:py-0 px-6 md:px-8 relative gap-4 md:gap-0'>
        <Link to="/" className="md:absolute md:left-8 flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest text-[10px] md:text-xs font-bold">
          <FaHome className='h-4 w-4' />
          <span>Back to Store</span>
        </Link>
        <h1 className='font-serif italic text-2xl md:text-4xl text-foreground tracking-tight text-center w-full'>Admin Control Panel</h1>
      </div>
      <div className="flex flex-col md:flex-row min-h-screen w-full">
        <DashSidebar />
        <div className="flex-1 w-full overflow-hidden admin-panel">
          {tab === 'products' && <Product />}
          {tab === 'product-update' && <ProductUpdate />}
          {tab === 'categories' && <Category />}
          {tab === 'category-update' && <CategoryUpdate />}
          {tab==='orders' && <Order/>}
          {tab==='users' && <Users/>}
        </div>
      </div>
    </>
  )
}

export default Dashboard