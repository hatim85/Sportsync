import { useEffect, useState, useRef } from 'react';
import ImageDescription from '../../components/ImageDescription';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FloatingWhatsApp from '../../components/FloatingWhatsApp';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    addCartItemFailure, addCartItemStart, addCartItemSuccess, addToCartGuest,
    removeCartItemStart, removeCartItemSuccess, removeCartItemFailure, removeFromCartGuest,
    updateCartItemQuantityStart, updateCartItemQuantitySuccess, updateCartItemQuantityFailure, updateQuantityGuest,
    fetchCartItemsSuccess
} from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { FaHeart, FaRegHeart, FaStar, FaPercentage, FaExchangeAlt, FaPlus, FaShieldAlt, FaAward, FaThumbsUp, FaCheck } from 'react-icons/fa';
import { HiOutlineArrowPath } from 'react-icons/hi2';
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from 'react-icons/io';
import { LuRotateCcw } from 'react-icons/lu';
import { BsCheckCircleFill } from 'react-icons/bs';
import ProductReviews, { StarDisplay } from '../../components/ProductReviews.jsx';

function ProductDescription() {
    const dispatch = useDispatch();
    const { productId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { currentUser } = useSelector(state => state.user);
    const { cartItems = [] } = useSelector(state => state.cart);
    const [product, setProduct] = useState(null);
    const { wishlistIds } = useSelector(state => state.wishlist);

    // Local states for selections from mockup

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [openDetail, setOpenDetail] = useState('details');
    const [similarProducts, setSimilarProducts] = useState([]);
    const [similarLoading, setSimilarLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('recommended');
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const isWishlisted = (id) => wishlistIds?.includes(id);

    const sizes = product?.sizes || [];
    const colors = product?.colors || [];

    useEffect(() => {
        if (product) {
            if (sizes.length > 0) setSelectedSize(sizes[0]);
            else setSelectedSize('');
            if (colors.length > 0) setSelectedColor(colors[0]);
            else setSelectedColor('');
        }
    }, [product]);

    const currentCartItem = Array.isArray(cartItems) 
        ? cartItems.find(item => 
            item.product?._id === productId && 
            (item.size === selectedSize || (!item.size && !selectedSize)) &&
            (item.color === selectedColor || (!item.color && !selectedColor))
        ) 
        : null;
    const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;

    const scrollRef = useRef(null);
    const scrollSizes = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleWishlistClick = (id) => {
        if (!currentUser) {
            toast.error("Please login to add to wishlist");
            return;
        }
        if (isWishlisted(id)) {
            dispatch(removeFromWishlist({ productId: id, userId: currentUser._id }));
            toast.success("Removed from wishlist");
        } else {
            dispatch(addToWishlist({ productId: id, userId: currentUser._id }));
            toast.success("Added to wishlist");
        }
    };

    useEffect(() => {
        fetchProduct(productId);
    }, [productId, currentUser]);

    const fetchProduct = async (id) => {
        try {
            const uid = currentUser?._id ? `?userId=${currentUser._id}` : '';
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/getbyId/${id}${uid}`);
            if (!response.ok) throw new Error('Failed to fetch product');
            const data = await response.json();
            setProduct(data);
            setLoading(false);
        } catch {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (tab, id) => {
        setSimilarLoading(true);
        setSimilarProducts([]);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_PORT}/api/products/related/${id}?tab=${encodeURIComponent(tab)}`
            );
            if (!res.ok) throw new Error('Failed to fetch related products');
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data?.products || []);
            setSimilarProducts(list.filter((p) => p._id !== id).slice(0, 5));
        } catch (err) {
            console.error("Related products fetch error:", err);
            setSimilarProducts([]);
        } finally {
            setSimilarLoading(false);
        }
    };

    useEffect(() => {
        setActiveTab('recommended');
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchRelatedProducts(activeTab, productId);
        }
    }, [activeTab, productId]);

    const handleAddToCart = async () => {
        if (currentUser?.userType === 'admin') {
            toast.error('Admins cannot add items to the cart');
            return;
        }

        const effectiveSize = selectedSize || (sizes.length > 0 ? sizes[0] : null);
        const effectiveColor = selectedColor || (colors.length > 0 ? colors[0] : null);

        if (!currentUser) {
            dispatch(addToCartGuest({ product, size: effectiveSize, color: effectiveColor }));
            toast.success('Product added to cart');
            return;
        }
        try {
            dispatch(addCartItemStart());
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/cart/addToCart/${productId}`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    userId: currentUser._id, 
                    size: effectiveSize, 
                    color: effectiveColor
                })
            });
            if (!res.ok) throw new Error('Failed to add to cart');
            const cartRes = await fetch(`${import.meta.env.VITE_PORT}/api/cart/getcart/${currentUser._id}`);
            if (cartRes.ok) {
                const cartData = await cartRes.json();
                dispatch(fetchCartItemsSuccess(Array.isArray(cartData) ? cartData : []));
            }
            toast.success('Product added to cart');
        } catch (error) {
            dispatch(addCartItemFailure(error.message));
            toast.error('Could not add to cart');
        }
    };

    const handleDelete = async (itemId) => {
        if (currentUser?.userType === 'admin') {
            toast.error('Admins cannot modify cart');
            return;
        }
        if (!currentUser) {
            dispatch(removeFromCartGuest(itemId));
            toast.success("Removed from cart");
            return;
        }
        dispatch(removeCartItemStart());
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/cart/delete/${itemId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error('Failed to delete item');
            dispatch(removeCartItemSuccess(itemId));
            toast.success("Removed from cart");
        } catch (error) {
            dispatch(removeCartItemFailure(error.message));
            toast.error("Error removing item");
        }
    };

    const updateQuantity = async (quantity) => {
        if (currentUser?.userType === 'admin') {
            toast.error('Admins cannot modify cart');
            return;
        }
        if (!currentCartItem) return;
        const cartItemId = currentCartItem.cartItemId;

        if (quantity <= 0) {
            return handleDelete(cartItemId);
        }

        if (!currentUser) {
            dispatch(updateQuantityGuest({ cartItemId, quantity }));
            return;
        }
        dispatch(updateCartItemQuantityStart());
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/cart/update/${cartItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity }),
            });
            if (!res.ok) throw new Error('Failed to update quantity');
            dispatch(updateCartItemQuantitySuccess({ cartItemId, quantity }));
        } catch (error) {
            dispatch(updateCartItemQuantityFailure(error.message));
            toast.error("Failed to update quantity");
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigate('/cart');
    };

    if (loading) return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <Footer />
        </>
    );

    const mrp = product?.price ? Math.round(product.price * 1.05) : 0;

    return (
        <div className="bg-background min-h-screen text-foreground">
            <Header />
            
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Left Side: Images */}
                    <div className="w-full lg:w-3/5">
                        <div className="sticky top-32">
                            <ImageDescription images={product?.image || []} />
                        </div>
                    </div>

                    {/* Right Side: Details */}
                    <div className="w-full lg:w-2/5 space-y-8">
                        {/* Title & Reviews */}
                        <div className="space-y-4">
                            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-black">{product?.categoryName || 'Equipment'}</p>
                            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-foreground leading-none uppercase">
                                {product?.name}
                            </h1>
                            <div className="flex items-center space-x-4">
                                <StarDisplay rating={product?.rating || 0} size="lg" />
                                <span className="text-xs font-bold text-foreground uppercase tracking-widest">
                                    {product?.reviewsCount || 0} {product?.reviewsCount === 1 ? 'Review' : 'Reviews'}
                                </span>
                            </div>
                        </div>

                        {/* Price & Offers */}
                        <div className="space-y-4">
                            <div className="flex items-baseline space-x-4">
                                <span className="text-4xl font-bold text-foreground tracking-tighter">
                                    ₹{Number(product?.price).toLocaleString('en-IN')}
                                </span>
                                <span className="text-xl text-muted-foreground line-through">
                                    ₹{mrp.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium">
                                    (MRP incl. of all taxes)
                                </span>
                            </div>
                            
                            {/* <p className="text-green-700 font-semibold text-sm tracking-wide">
                                Exclusive Offer: Flat 5% Off*
                            </p>

                            <div className="bg-[#FAF5E6] p-4 flex items-center space-x-4 border border-[#F2E8CC] rounded-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#E5D5A1]"></div>
                                <div className="bg-primary text-primary-foreground p-1 rounded-full">
                                    <FaPercentage className="text-[10px]" />
                                </div>
                                <p className="text-sm text-foreground font-medium tracking-wide">
                                    Use code <span className="font-bold">CELEBRATE</span> for extra 5% off*
                                </p>
                            </div> */}
                        </div>

                        {/* Selection Sections */}
                        <div className="space-y-10 pt-4 border-t border-border">
                            
                            {/* Select Size */}
                            {sizes.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg text-foreground font-medium tracking-tight">Select Size</h3>
                                        <button 
                                            onClick={() => setIsSizeGuideOpen(true)}
                                            className="text-[10px] uppercase underline underline-offset-4 tracking-[0.2em] font-bold text-foreground hover:text-foreground"
                                        >
                                            Size Guide
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button 
                                            onClick={() => scrollSizes('left')}
                                            className="p-2 border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <IoIosArrowBack />
                                        </button>
                                        <div 
                                            ref={scrollRef}
                                            className="flex gap-4 overflow-x-auto custom-scrollbar scroll-smooth pb-4"
                                        >
                                            {sizes.map((size) => (
                                                <button 
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`w-14 h-14 min-w-[56px] border flex items-center justify-center text-sm transition-all ${selectedSize === size ? 'border-primary bg-card text-foreground font-bold' : 'border-gray-50 bg-secondary text-muted-foreground hover:border-border'}`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => scrollSizes('right')}
                                            className="p-2 border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <IoIosArrowForward />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-6">
                                <div className="flex gap-3">
                                    {currentQuantity > 0 ? (
                                        <div className="flex-1 flex items-center border border-border h-14 bg-secondary rounded-sm">
                                            <button 
                                                onClick={() => updateQuantity(currentQuantity - 1)}
                                                className="w-14 h-full flex items-center justify-center text-foreground hover:bg-gray-200 transition-colors font-bold text-xl"
                                            >
                                                -
                                            </button>
                                            <div className="flex-1 h-full flex items-center justify-center font-black text-lg bg-background border-x border-border">
                                                {currentQuantity}
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if (currentQuantity < 9) {
                                                        updateQuantity(currentQuantity + 1)
                                                    } else {
                                                        toast.error("Maximum 9 items allowed");
                                                    }
                                                }}
                                                className="w-14 h-full flex items-center justify-center text-foreground hover:bg-gray-200 transition-colors font-bold text-xl"
                                            >
                                                +
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleAddToCart}
                                                className="flex-1 bg-primary text-primary-foreground h-14 font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-primary/90 transition-all flex items-center justify-center rounded-sm"
                                            >
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={handleBuyNow}
                                                className="flex-1 bg-foreground text-background h-14 font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-foreground/90 transition-all flex items-center justify-center rounded-sm"
                                            >
                                                Buy Now
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleWishlistClick(product?._id)}
                                        className={`w-14 shrink-0 h-14 flex items-center justify-center border-2 transition-all rounded-sm ${
                                            isWishlisted(product?._id)
                                                ? 'border-red-500 text-red-500 bg-red-50'
                                                : 'border-border text-foreground hover:border-foreground hover:bg-secondary'
                                        }`}
                                    >
                                        {isWishlisted(product?._id) ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-0 border-t border-border">
                            {[
                                { id: 'details', title: 'Product Details', content: product?.description },
                                { id: 'origin', title: 'Manufacturer & Origin', content: "Sportsync Certified Equipment." }
                            ].map((section) => (
                                <div key={section.id} className="border-b border-border">
                                    <button 
                                        onClick={() => setOpenDetail(openDetail === section.id ? null : section.id)}
                                        className="w-full flex justify-between items-center py-6 text-left group"
                                    >
                                        <span className="text-base text-foreground font-normal tracking-wide">{section.title}</span>
                                        <span className="text-muted-foreground">
                                            {openDetail === section.id ? <FaPlus className="h-3 w-3 rotate-45 transition-transform" /> : <FaPlus className="h-3 w-3 transition-transform" />}
                                        </span>
                                    </button>
                                    {openDetail === section.id && (
                                        <div className="pb-8 text-sm text-muted-foreground font-light leading-relaxed animate-fadeIn">
                                            {section.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <div className="max-w-7xl mx-auto px-4 pb-8">
                <ProductReviews
                    productId={product?._id}
                    rating={product?.rating}
                    reviewsCount={product?.reviewsCount}
                    userCanReview={product?.userCanReview}
                    eligibleOrderId={product?.eligibleOrderId}
                    userId={currentUser?._id}
                    onReviewSubmitted={(data) => {
                        setProduct((prev) => ({
                            ...prev,
                            rating: data.rating,
                            reviewsCount: data.reviewsCount,
                            userCanReview: false,
                        }));
                    }}
                />
            </div>

            {/* You May Also Like Section */}
            <section className="max-w-7xl mx-auto px-4 py-24 min-w-0">
                <div className="space-y-12 min-w-0 w-full">
                    <h2 className="text-2xl font-medium tracking-tight text-foreground font-sans text-center">
                        You May Also Like
                    </h2>

                    {/* Tabs — full-bleed scroll on mobile; avoid overflow-x-hidden clipping first label */}
                    <div className="w-full min-w-0 -mx-4 sm:mx-0">
                        <div
                            className="flex w-full min-w-0 max-w-[100vw] sm:max-w-none items-center justify-start gap-6 sm:gap-8 border-b border-border pb-1 overflow-x-auto overscroll-x-contain scroll-smooth scroll-pl-6 scroll-pr-6 pl-6 pr-6 sm:pl-0 sm:pr-0 sm:scroll-pl-0 sm:scroll-pr-0 md:justify-center md:gap-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            role="tablist"
                        >
                        {[
                            { id: 'recommended', label: 'Recommended', mobileLabel: 'Recommended' },
                            { id: 'category', label: product?.categoryName || 'Similar Designs', mobileLabel: product?.categoryName || 'Category' },
                            { id: 'classic', label: 'Classic Gear', mobileLabel: 'Classic' },
                            { id: 'more', label: 'More Accessories', mobileLabel: 'Accessories' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                onClick={() => {
                                    if (activeTab !== tab.id) setActiveTab(tab.id);
                                }}
                                className={`flex-shrink-0 whitespace-nowrap text-[11px] sm:text-[12px] uppercase tracking-wide sm:tracking-[0.2em] font-bold pb-4 px-0.5 transition-all relative ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <span className="sm:hidden">{tab.mobileLabel}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />
                                )}
                            </button>
                        ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    {similarLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : similarProducts.length > 0 ? (
                        <div key={activeTab} className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12 pt-10">
                            {similarProducts.map((p) => (
                                <div key={`${activeTab}-${p._id}`} className="group relative flex flex-col space-y-4 text-left">
                                    <Link to={`/products/${p._id}`} className="block relative aspect-square bg-card overflow-hidden">
                                        <img 
                                            src={p.image?.[0] ? (p.image[0].includes('cloudinary.com') ? p.image[0] : `/${p.image[0].split(/[\\/]/).pop()}`) : '/ErrorImage.png'} 
                                            alt={p.name} 
                                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <button 
                                            onClick={(e) => { e.preventDefault(); handleWishlistClick(p._id); }}
                                            className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors"
                                        >
                                            {isWishlisted(p._id) ? <FaHeart className="h-5 w-5 text-red-500" /> : <FaRegHeart className="h-5 w-5" />}
                                        </button>
                                    </Link>
                                    <div className="space-y-2">
                                        <Link to={`/products/${p._id}`}>
                                            <h3 className="text-[13px] text-muted-foreground font-light leading-relaxed line-clamp-2 hover:text-foreground transition-colors">{p.name}</h3>
                                        </Link>
                                        <p className="text-sm font-bold text-foreground">₹{Number(p.price).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 space-y-4">
                            <div className="w-12 h-[1px] bg-gray-200 mx-auto"></div>
                            <p className="text-muted-foreground uppercase tracking-[0.3em] text-[9px] font-bold">Discovering curated pieces...</p>
                        </div>
                    )}
                </div>
            </section>

            <FloatingWhatsApp />

            {/* Size Guide Modal */}
            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative">
                        {/* Close Button */}
                        <button 
                            onClick={() => setIsSizeGuideOpen(false)}
                            className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
                        >
                            <IoMdClose size={24} />
                        </button>

                        <div className="p-8 md:p-12 space-y-12">
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl font-sans font-black italic italic text-foreground leading-tight">Sportsync Size Guide</h2>
                                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-bold">Find your perfect fit</p>
                            </div>

                            {/* Rings Section */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="h-[1px] flex-grow bg-border"></div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Apparel Size Chart</h3>
                                    <div className="h-[1px] flex-grow bg-border"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                                            For apparel sizing, check our measurements table. We recommend sizing up if you are between sizes.
                                        </p>
                                        <div className="bg-secondary p-4 rounded-sm border border-border">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Pro Tip</p>
                                            <p className="text-[11px] text-muted-foreground italic">Measure at the end of the day when your fingers are slightly larger for the best fit.</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto border border-border rounded-sm">
                                        <table className="w-full text-[11px]">
                                            <thead className="bg-secondary border-b border-border">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-bold text-foreground uppercase tracking-widest">Size</th>
                                                    <th className="px-4 py-3 text-left font-bold text-foreground uppercase tracking-widest">Chest (in)</th>
<th className="px-4 py-3 text-left font-bold text-foreground uppercase tracking-widest">Waist (in)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {[
    { s: 'S', c: '34-36', w: '28-30' },
    { s: 'M', c: '38-40', w: '32-34' },
    { s: 'L', c: '42-44', w: '36-38' },
    { s: 'XL', c: '46-48', w: '40-42' }
].map((row) => (
                                                    <tr key={row.s} className="hover:bg-secondary transition-colors">
                                                        <td className="px-4 py-3 font-medium text-foreground">{row.s}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{row.c}</td>
<td className="px-4 py-3 text-muted-foreground">{row.w}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Bangles Section */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="h-[1px] flex-grow bg-border"></div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Footwear Size Chart</h3>
                                    <div className="h-[1px] flex-grow bg-border"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="overflow-x-auto border border-border rounded-sm order-2 md:order-1">
                                        <table className="w-full text-[11px]">
                                            <thead className="bg-secondary border-b border-border">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-bold text-foreground uppercase tracking-widest">Size</th>
                                                    <th className="px-4 py-3 text-left font-bold text-foreground uppercase tracking-widest">UK Size</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {[
    { s: '7', c: 'UK 7' }, 
    { s: '8', c: 'UK 8' }, 
    { s: '9', c: 'UK 9' },
    { s: '10', c: 'UK 10' }
].map((row) => (
                                                    <tr key={row.s} className="hover:bg-secondary transition-colors">
                                                        <td className="px-4 py-3 font-medium text-foreground">{row.s}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{row.c}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="space-y-4 order-1 md:order-2">
                                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                                            Stand on a piece of paper and mark the tip of your longest toe and back of your heel.
                                        </p>
                                        <div className="flex justify-center py-4">
                                            <div className="w-24 h-24 border-2 border-dashed border-border rounded-full flex flex-col items-center justify-center text-muted-foreground">
                                                <HiOutlineArrowPath size={24} className="mb-2" />
                                                <span className="text-[8px] uppercase tracking-widest font-bold">Circumference</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                             <div className="pt-8 text-center">
                                <button 
                                    onClick={() => setIsSizeGuideOpen(false)}
                                    className="px-12 py-4 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-colors rounded-sm"
                                >
                                    Understood
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

export default ProductDescription;
