import React, { useEffect, useState } from 'react'
import { FaBars, FaHeart, FaSearch, FaShoppingCart, FaTimes, FaPhoneAlt, FaUser, FaSun, FaMoon } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../redux/slices/wishlistSlice';
import { fetchCartItemsRequest, fetchCartItemsSuccess, fetchCartItemsFailure } from '../redux/slices/cartSlice';
import { useTheme } from '../contexts/ThemeContext';

function Header() {
    const { currentUser } = useSelector((state) => state.user);
    const cartItems = useSelector(state => state.cart.cartItems);
    const { wishlistIds } = useSelector((state) => state.wishlist);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleSearch = (e) => {
        e.preventDefault();
        const searchString = encodeURIComponent(String(query).trim());
        if (searchString) {
            navigate(`/search?q=${searchString}`);
            setShowSearch(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchWishlist(currentUser._id));
            
            const fetchCart = async () => {
                dispatch(fetchCartItemsRequest());
                try {
                    const response = await fetch(`${import.meta.env.VITE_PORT}/api/cart/getcart/${currentUser._id}`);
                    if (!response.ok) throw new Error('Failed to fetch items');
                    const data = await response.json();
                    dispatch(fetchCartItemsSuccess(Array.isArray(data) ? data : []));
                } catch (error) {
                    dispatch(fetchCartItemsFailure(error.message));
                }
            };
            fetchCart();
        }
    }, [currentUser, dispatch]);

    // Hardcoded sports categories as per user request
    const navLinks = [
        { name: 'Cricket', path: '/category/cricket' },
        { name: 'Football', path: '/category/football' },
        { name: 'Badminton', path: '/category/badminton' },
        { name: 'Fitness', path: '/category/fitness' },
        { name: 'Running', path: '/category/running' },
        { name: 'Indoor Sports', path: '/category/indoor-sports' },
        { name: 'Accessories', path: '/category/accessories' },
        { name: 'Team & Academy Orders', path: '/category/team-academy' },
        { name: 'Sale', path: '/category/sale' },
        { name: 'New Arrivals', path: '/category/new-arrivals' }
    ];


    return (
        <header className="w-full bg-background sticky top-0 z-50 border-b border-border shadow-sm">
            {/* Top Banner - Sporty */}
            <div className="w-full bg-primary text-primary-foreground py-1.5 text-center text-[10px] md:text-xs font-bold tracking-[0.2em] px-4 uppercase">
                Free Shipping on Orders Over ₹499 | Pro Gear Available
            </div>

            {/* Main Nav Row */}
            <div className="container mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
                {/* Left: Mobile Menu & Desktop Info */}
                <div className="flex items-center space-x-4 flex-shrink-0 md:flex-1">
                    <button
                        className="text-foreground hover:text-primary transition-colors md:mr-4 lg:hidden"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <FaBars className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <div className="hidden md:flex flex-col items-start bg-secondary px-3 py-1.5 rounded border border-border shadow-sm group">
                        <div className="flex items-center text-xs md:text-sm text-foreground space-x-1 lg:space-x-2 group-hover:text-primary transition-colors">
                            <FaPhoneAlt className="h-3 w-3 md:h-3.5 md:w-3.5" />
                            <span className="tracking-[0.1em] font-bold">+1-800-SPORTS</span>
                        </div>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">24/7 Support</p>
                    </div>
                </div>

                {/* Center: Logo & Name Side-by-Side */}
                <div className="flex-1 md:flex-[2] flex justify-center overflow-hidden px-1 md:px-4">
                    <Link to="/" className="flex items-center group space-x-2 md:space-x-3 lg:space-x-4">
                        {/* Removed the old jewelry logo image, using text only for a clean modern look */}
                        <span className="text-[16px] md:text-3xl lg:text-4xl font-black tracking-tighter italic text-foreground uppercase leading-none border-l-4 border-primary pl-2 md:pl-4 whitespace-nowrap transition-transform duration-300 group-hover:scale-105 group-hover:text-primary">
                            SPORTSYNC
                        </span>
                    </Link>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end space-x-2 md:space-x-4 lg:space-x-6 flex-shrink-0 md:flex-1">
                    
                    {/* Theme Toggle Button */}
                    <button 
                        onClick={toggleTheme} 
                        className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <FaSun className="h-4 w-4 md:h-5 md:w-5" /> : <FaMoon className="h-4 w-4 md:h-5 md:w-5" />}
                    </button>

                    {/* Desktop Integrated Search Bar */}
                    <form onSubmit={handleSearch} className="hidden lg:flex items-center border-b-2 border-transparent focus-within:border-primary transition-colors mr-2 h-10">
                        <input
                            type="text"
                            placeholder="SEARCH GEAR"
                            className="bg-secondary text-foreground text-xs tracking-widest outline-none w-16 lg:w-48 px-3 font-bold placeholder:text-muted-foreground h-full rounded-l"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors h-full flex items-center px-3 rounded-r">
                            <FaSearch className="h-4 w-4" />
                        </button>
                    </form>

                    {/* Mobile Only: Small Search Icon toggle */}
                    <button
                        className="lg:hidden text-foreground hover:text-primary transition-colors flex items-center h-10 p-2"
                        onClick={() => setShowSearch(!showSearch)}
                    >
                        <FaSearch className="h-5 w-5" />
                    </button>

                    <div className="flex items-center space-x-3 md:space-x-6 h-10">
                        {/* 1. Admin Case: Only Profile and Dashboard */}
                        {currentUser?.userType === "admin" ? (
                            <>
                                <Link to="/profile" className="text-foreground hover:text-primary transition-all flex items-center h-full">
                                    <FaUser className="h-5 w-5 md:h-6 md:w-6" />
                                </Link>
                                <Link to="/dashboard" className="text-foreground hover:text-primary transition-all flex items-center h-full">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </Link>
                            </>
                        ) : (
                            /* 2. Customer or Guest Case: Wishlist, Cart, and Account */
                            <>
                                <Link to="/wishlist" className="relative text-foreground hover:text-primary transition-all flex items-center h-full">
                                    <FaHeart className="h-5 w-5 md:h-6 md:w-6" />
                                    {wishlistIds?.length > 0 && (
                                        <span className="absolute -top-2 -right-2.5 bg-primary text-primary-foreground text-[9px] rounded-full h-5 w-5 flex items-center justify-center font-black">
                                            {wishlistIds.length}
                                        </span>
                                    )}
                                </Link>

                                <Link to="/cart" className="relative text-foreground hover:text-primary transition-all flex items-center h-full">
                                    <FaShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                                    {cartItems?.length > 0 && (
                                        <span className="absolute -top-2 -right-2.5 bg-primary text-primary-foreground text-[9px] rounded-full h-5 w-5 flex items-center justify-center font-black">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </Link>

                                {!currentUser ? (
                                    <Link to="/signin" className="text-foreground hover:text-primary transition-all flex items-center h-full">
                                        <FaUser className="h-5 w-5 md:h-6 md:w-6" />
                                    </Link>
                                ) : (
                                    <Link to="/profile" className="text-foreground hover:text-primary transition-all flex items-center h-full">
                                        <FaUser className="h-5 w-5 md:h-6 md:w-6" />
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar - Visible below top row when search icon is clicked and toggled */}
            {showSearch && (
                <div className="lg:hidden w-full px-4 py-3 bg-secondary border-b border-border">
                    <form onSubmit={handleSearch} className="relative flex items-center">
                        <FaSearch className="absolute left-3 text-muted-foreground h-4 w-4" />
                        <input
                            type="text"
                            placeholder="SEARCH GEAR..."
                            className="w-full bg-background border border-border py-2.5 pl-10 pr-4 text-xs tracking-widest outline-none focus:border-primary transition-all rounded text-foreground uppercase font-bold"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </form>
                </div>
            )}

            {/* Bottom Nav Row (Desktop Only) */}
            <nav className="hidden lg:block w-full border-t border-border bg-secondary/50">
                <ul className="container mx-auto px-4 flex justify-center space-x-6 lg:space-x-12 py-3 lg:py-4 text-[11px] lg:text-sm font-black tracking-[0.1em] text-foreground">
                    {navLinks.map((link) => (
                        <li key={link.name}>
                            <Link
                                to={link.path}
                                className="hover:text-primary hover:border-b-2 hover:border-primary transition-all pb-1 uppercase whitespace-nowrap"
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}>
                <div className={`fixed inset-y-0 left-0 w-[80%] max-w-sm bg-background shadow-2xl transform transition-transform duration-300 overflow-y-auto ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-border bg-background sticky top-0 z-10">
                        <span className="text-2xl font-black italic tracking-tighter uppercase text-foreground">SPORTSYNC</span>
                        <button onClick={() => setIsMenuOpen(false)}>
                            <FaTimes className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                        </button>
                    </div>

                    <div className="p-4 bg-secondary">
                        <Link
                            to={currentUser ? "/profile" : "/signin"}
                            className="flex items-center p-4 bg-card rounded shadow-sm border border-border hover:border-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-4 text-primary">
                                <FaUser className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Account</p>
                                <p className="text-xs font-black text-foreground uppercase">{currentUser ? (currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser.username) : "Sign In / Join"}</p>
                            </div>
                        </Link>
                    </div>

                    <ul className="py-2">
                        {navLinks.map((link) => (
                            <li key={link.name} className="border-b border-border last:border-0">
                                <Link
                                    to={link.path}
                                    className="flex items-center justify-between px-8 py-5 text-sm font-black tracking-widest text-foreground hover:bg-secondary hover:text-primary uppercase transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                    <span className="text-primary text-xl font-normal">›</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="p-8 mt-4 border-t border-border bg-secondary">
                        <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold mb-4">24/7 Support</p>
                        <div className="flex items-center space-x-4 text-sm text-foreground uppercase tracking-widest font-black hover:text-primary cursor-pointer mb-4 transition-colors">
                            <FaPhoneAlt className="h-4 w-4" />
                            <span>+1-800-SPORTS</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;


