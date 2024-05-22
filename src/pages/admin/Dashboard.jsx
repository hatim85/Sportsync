import React, { useEffect, useState } from 'react'
import { FaHome } from 'react-icons/fa'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Product from './Product'
import DashSidebar from './DashSidebar';
import Category from './Category';
import Users from './Users';
import GetAllUsers from './Users';
import Order from './Order';


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
      <div className='flex justify-center items-center w-screen h-[15vh]'>
        <Link to="/"><p className="absolute left-4"><FaHome className='h-5 w-5' />Back</p></Link>
        <h1 className='font-bold text-3xl'>Admin Dashboard</h1>
      </div>
      <hr className='border-gray-400 w-full' />
      <div className="flex h-screen">
        <DashSidebar />
        <div className="flex-1">
          {tab === 'products' && <Product />}
          {tab === 'categories' && <Category />}
          {tab==='orders' && <Order/>}
        </div>
      </div>
    </>
  )
}

export default Dashboard