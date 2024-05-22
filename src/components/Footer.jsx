import React from 'react'
import { FaEnvelope, FaFacebook, FaInstagram, FaPhone } from 'react-icons/fa'
import { Link } from 'react-router-dom'

function Footer() {
    return (
        <>
            <footer className='bg-black text-gray-300 py-4'>
                <div className='md:grid md:grid-cols-4 place-items-center md:gap-[10vh] py-10 gap-[5vh] grid grid-cols-2'>
                    <div className='ml-[2vw]'>
                       <h1 className='font-bold cursor-pointer'>SportSync</h1> <br/>
                        <p className='cursor-default'>Your ultimate destination for sports gear, apparel, and accessories. Get ready to elevate your game!</p>
                    </div>
                    <div>
                       <h1 className='font-bold cursor-default'>Company</h1> <br/>
                        <p>Ahmedabad, India</p>
                        <FaPhone className='md:h-5 md:w-5' /><p>+91 9999999999</p>
                        <FaEnvelope className='md:h-5 md:w-5' /><p>sportsync@gmail.com</p>
                    </div>
                    <div>
                        <h1 className='font-bold cursor-default'>QuickLinks</h1><br/>
                        <ul className='list-none cursor-pointer'>
                            <li><Link to='/about'>About us</Link></li>
                            <li><Link to='/faq'>FAQ</Link></li>
                            <li><Link to='/privacy'>Privacy</Link></li>
                            <li><Link to='/terms'>Terms and Conditions</Link></li>
                        </ul>
                    </div>
                    <div className='cursor-pointer'>
                        <h1 className='font-bold cursor-default'>Social Media</h1><br/>
                        <a href="https://www.facebook.com" target='_blank'><FaFacebook className='h-5 w-5' /><p>Facebook</p></a>
                        <a href="https://www.instagram.com" target='_blank'><FaInstagram className='h-5 w-5' /><p>Instagram</p></a>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer