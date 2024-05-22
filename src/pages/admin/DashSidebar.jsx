import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {toast} from  "react-toastify";
import { signoutSuccess } from '../../redux/slices/userSlice';

function DashSidebar() {
    const [tab,setTab]=useState('');
    const dispatch=useDispatch();
    const navigate=useNavigate()

    const handleSignout = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/signout`, {
          method: 'POST'
        });
        const data = await res.json();
        if (!res.ok) {
          toast.failure(data.message)
        }
        else {
          dispatch(signoutSuccess());
          localStorage.removeItem('user');
          toast.success("Signed Out Successfully")
          navigate('/')
        }
      }
      catch (error) {
        toast.error(error.message)
      }
    }

    useEffect(()=>{
        const urlParams=new URLSearchParams(location.search);
        const tabFromUrl=urlParams.get('tab');
        if(tabFromUrl){
            setTab(tabFromUrl)
        }
    },[location.search])
  return (
    <>
      <header className='bg-blue-500 h-screen w-[20vw] flex justify-center text-white font-sans'>
        <nav>
          <ul>
            <li className='p-10'><Link to='/dashboard?tab=products'>Products</Link></li>
            <hr className='border-gray-400 w-full' />
            <li className='p-10'><Link to='/dashboard/?tab=categories'>Categories</Link></li>
            <hr className='border-gray-400 w-full' />
            <li className='p-10'><Link to='/dashboard/?tab=orders'>Orders</Link></li>
            <hr className='border-gray-400 w-full' />
            <li className='p-10'><button onClick={handleSignout}>Signout</button></li>
            <hr className='border-gray-400 w-full' />
          </ul>
        </nav>
      </header>
    </>
  )
}

export default DashSidebar