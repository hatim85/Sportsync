import React, { useEffect, useState } from 'react'
import { FaBars, FaHamburger, FaHeart, FaSearch, FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import { MdAccountCircle } from 'react-icons/md'
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
function Header({ onSearch }) {
    const { currentUser } = useSelector((state) => state.user);
    const cartItems = useSelector(state => state.cart.cartItems);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [query, setQuery] = useState('')
    const dispatch = useDispatch()

    const handleSearch = (e) => {
        e.preventDefault()
        const searchString = encodeURIComponent(String(query).trim())
        if (searchString) {
            window.location.href = `/search?q=${searchString}`
        }
    }

    useEffect(() => {
        setIsLoggedIn(currentUser !== null)
    }, [currentUser])
    return (
        <>
            <header className='sticky bg-blue-700 p-3 font-sans text-white top-0 z-10'>
                <nav>
                    <ul className='flex flex-wrap justify-between p-auto items-center'>
                        <li className='flex items-center'>
                            <Link to='/' className='cursor-pointer'><div className='cursor-pointer font-semibold text-2xl md:mr-0 mr-5'>Sportsync</div></Link>
                        </li>
                        <form onSubmit={handleSearch} className='flex items-center m-auto'>
                            <div className='border-2 border-gray-400 rounded-full bg-gray-100 flex cursor-pointer'>
                                <input
                                    className=' bg-cover rounded-full text-black outline-none py-1 px-2 w-fit flex-grow bg-gray-100'
                                    type="text"
                                    placeholder="Search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    contentEditable="true"
                                />
                                <button type='submit' className='text-black'>
                                    <FaSearch className="h-6 w-6 m-2 text-gray-600" />
                                </button>
                            </div>
                        </form>
                        {currentUser ? (
                            <>
                                {currentUser.userType === 'admin' ? (
                                    <Link to='/dashboard'>
                                        <button className='border border-white rounded-full text-white px-2 py-2'>Dashboard</button>
                                    </Link>
                                ) : (
                                    <div className='flex flex-row gap-10'>
                                        <Link to='/profile'><li><MdAccountCircle className='h-[7vw] w-auto md:h-[2vw] md:w-auto' /></li></Link>
                                        <Link to='/cart'>
                                            <li className='relative'>
                                                <FaShoppingCart className='h-[7vw] w-auto md:h-[2vw] md:w-auto' />
                                                {cartItems && cartItems.length > 0 && (
                                                    <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs">
                                                        {cartItems.length}
                                                    </div>
                                                )}
                                            </li>
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link to='/SignIn'>
                                <button className='border border-white rounded-full text-white px-4 py-2'>Sign In</button>
                            </Link>
                        )}
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header