import React from 'react'
import {FaRegCheckCircle} from 'react-icons/fa'
import { Link } from 'react-router-dom'

function DummyHeader() {
  return (
    <header className='shadow-md sticky z-10 bg-white top-0'>
        <nav>
            <ul className='flex items-center justify-between'>
                <Link to='/' className='cursor-pointer'><li className='m-3 ml-6 text-blue-700 font-bold text-2xl'>Sportsync</li></Link>
                <li className='m-3 mr-6 w-20 flex justify-center items-center'>
                    <p className='mr-3'><FaRegCheckCircle className='h-5 w-5'/></p>
                    <p className='text-[12px]'>100% Secure Payment</p>
                </li>
            </ul>
        </nav>
    </header>
  )
}

export default DummyHeader