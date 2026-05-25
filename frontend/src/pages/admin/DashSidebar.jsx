import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
        } else {
            setTab('products')
        }
    },[location.search])
  return (
    <>
      <header className='bg-secondary border-b md:border-b-0 md:border-r border-border h-auto md:h-full w-full md:w-64 lg:w-72 flex flex-col pt-4 md:py-8 font-sans'>
        <nav className="w-full overflow-x-auto custom-scrollbar">
          <ul className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 px-4 md:px-0">
            {[
              { label: 'Products', tab: 'products' },
              { label: 'Categories', tab: 'categories' },
              { label: 'Users', tab: 'users' },
              { label: 'Orders', tab: 'orders' }
            ].map((item) => (
              <li key={item.tab}>
                <Link 
                  to={`/dashboard?tab=${item.tab}`}
                  className={`block px-4 py-3 md:px-8 md:py-4 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold transition-all whitespace-nowrap ${
                    tab === item.tab 
                      ? 'bg-card text-foreground border-b-2 md:border-b-0 md:border-r-4 border-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-black/5'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-4 py-4 md:px-8 md:pt-8 border-t border-border mt-2 md:mt-0">
          <button 
            onClick={handleSignout}
            className="text-left text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>
    </>
  )
}

export default DashSidebar