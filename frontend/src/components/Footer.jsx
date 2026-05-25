import React from 'react'
import { FaFacebook, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { FOOTER_SHOP_CATEGORIES, SPORTSYNC_CONTACT } from '../constants/shopCategories.js'

function Footer() {
    return (
        <footer className="bg-secondary border-t border-border py-16 text-foreground">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <Link to="/" className="text-3xl font-black italic tracking-tighter uppercase text-foreground">
                            SPORTSYNC
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs font-medium">
                            India&apos;s sports gear destination. Cricket, football, badminton, fitness, and more — authentic equipment for every athlete.
                        </p>
                        <div className="flex space-x-5">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                                <FaInstagram className="h-6 w-6" />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                                <FaFacebook className="h-6 w-6" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-black tracking-widest uppercase mb-6 text-foreground">Shop</h4>
                        <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                            {FOOTER_SHOP_CATEGORIES.map(({ name, slug }) => (
                                <li key={slug}>
                                    <Link to={`/category/${slug}`} className="hover:text-primary transition-colors">
                                        {name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link to="/explore" className="hover:text-primary transition-colors font-bold text-foreground">
                                    Shop All Sports
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-black tracking-widest uppercase mb-6 text-foreground">Information</h4>
                        <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                            <li><Link to="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
                            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-black tracking-widest uppercase mb-6 text-foreground">Contact</h4>
                        <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                            <li className="flex items-center space-x-3">
                                <FaMapMarkerAlt className="h-4 w-4 text-primary shrink-0" />
                                <span>{SPORTSYNC_CONTACT.city}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FaPhoneAlt className="h-4 w-4 text-primary shrink-0" />
                                <a href={`tel:${SPORTSYNC_CONTACT.phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                                    {SPORTSYNC_CONTACT.phone}
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FaEnvelope className="h-4 w-4 text-primary shrink-0" />
                                <a href={`mailto:${SPORTSYNC_CONTACT.email}`} className="hover:text-primary transition-colors">
                                    {SPORTSYNC_CONTACT.email}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest text-muted-foreground font-bold uppercase">
                    <p>© 2026 SPORTSYNC. ALL RIGHTS RESERVED.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <span>Pro Grade Gear</span>
                        <span>Secure Checkout</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;
