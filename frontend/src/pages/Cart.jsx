import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaShieldAlt, FaRegEye } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    fetchCartItemsRequest, 
    fetchCartItemsSuccess, 
    fetchCartItemsFailure, 
    removeCartItemStart, 
    removeCartItemSuccess, 
    removeCartItemFailure, 
    updateCartItemQuantityStart, 
    updateCartItemQuantitySuccess, 
    updateCartItemQuantityFailure,
    removeFromCartGuest,
    updateQuantityGuest
} from '../redux/slices/cartSlice';
import { updateSuccess } from '../redux/slices/userSlice';
import Header from '../components/Header';

// Simple Box Icon SVG (Moved to top to prevent ReferenceError)
const BoxIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);

function Cart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems = [], loading, error } = useSelector(state => state.cart);
    const { currentUser } = useSelector(state => state.user);
    const userId = currentUser?._id;

    const [deliveryCharge, setDeliveryCharge] = useState(0); // FREE in mockup
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phone, setPhone] = useState('');
    const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchCartItems(userId);
        }
    }, [userId, dispatch]);

    const fetchCartItems = async (userId) => {
        dispatch(fetchCartItemsRequest());
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/cart/getcart/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch items');
            const data = await response.json();
            dispatch(fetchCartItemsSuccess(Array.isArray(data) ? data : []));
        } catch (error) {
            dispatch(fetchCartItemsFailure(error.message));
        }
    };

    const handleDelete = async (itemId) => {
        if (!userId) {
            dispatch(removeFromCartGuest(itemId));
            toast.success("Item removed");
            return;
        }
        dispatch(removeCartItemStart());
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/cart/delete/${itemId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error('Failed to delete item');
            dispatch(removeCartItemSuccess(itemId));
            toast.success("Item removed");
        } catch (error) {
            dispatch(removeCartItemFailure(error.message));
        }
    };

    const updateCartItemQuantity = async (cartItemId, quantity) => {
        if (!userId) {
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
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }
        setIsSubmittingPhone(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/addphone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update phone number');
            
            dispatch(updateSuccess(data.user));
            toast.success("Phone number added successfully");
            setShowPhoneModal(false);
            navigate('/checkout');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmittingPhone(false);
        }
    };

    const validatedCartItems = Array.isArray(cartItems) ? cartItems : [];
    const orderTotal = validatedCartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
    const calculatedDeliveryCharge = (orderTotal > 0 && orderTotal < 499) ? 49 : 0;
    const subtotalMRP = orderTotal; // Or orderTotal * 1.05 if you want a fake discount
    const productDiscount = 0;
    const finalTotal = orderTotal + calculatedDeliveryCharge;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            
            {/* Cart Header */}
            <div className='max-w-7xl mx-auto px-4 md:px-8 py-6 flex justify-between items-center bg-card border-b border-border'>
                <h1 className='text-lg font-black tracking-widest text-foreground uppercase'>Cart</h1>
                <span className='text-xs font-bold text-primary uppercase tracking-widest'>Step 1/3</span>
            </div>

            <div className='max-w-7xl mx-auto px-4 md:px-8 py-10'>
                {validatedCartItems.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-border rounded">
                        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-4">Your gear bag is empty</p>
                        <Link to="/" className="text-foreground font-black uppercase text-xs border-b-2 border-primary pb-1 hover:text-primary transition-all">Start Shopping</Link>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 items-start'>
                        
                        {/* Cart Items List */}
                        <div className='lg:col-span-2 space-y-6'>
                            <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                                <BoxIcon className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-widest">Items : {validatedCartItems.length}</span>
                            </div>

                            {validatedCartItems.map((item) => {
                                const coverIdx = item.product?.coverImageIndex ?? 0;
                                const filename = item.product?.image?.[coverIdx] || item.product?.image?.[0];
                                const displayImg = filename ? (filename.includes('cloudinary.com') ? filename : `/${filename.split(/[\\/]/).pop()}`) : '/ErrorImage.png';

                                return (
                                    <div key={item.cartItemId} className='bg-card border-2 border-border hover:border-primary transition-colors rounded relative group animate-fadeIn'>
                                        <div className='p-6 flex flex-col md:flex-row gap-8'>
                                            {/* Product Image */}
                                            <div className='w-full md:w-32 h-32 flex-shrink-0 bg-secondary p-2 border border-border rounded'>
                                                <img 
                                                    src={displayImg} 
                                                    alt={item.product?.name}
                                                    className='w-full h-full object-contain'
                                                    onError={(e) => e.target.src = '/ErrorImage.png'}
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className='flex-grow space-y-4 pt-2'>
                                                <div className="flex justify-between items-start">
                                                    <h2 className='text-sm md:text-base font-black text-card-foreground leading-tight max-w-md uppercase tracking-tight'>
                                                        {item.product?.name}
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                                            {item.size && (
                                                                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                                                                    Size: {item.size}
                                                                </span>
                                                            )}
                                                            {item.color && (
                                                                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                                                                    Color: {item.color}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </h2>
                                                    <button 
                                                        onClick={() => handleDelete(item.cartItemId)}
                                                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <IoMdClose className="text-2xl" />
                                                    </button>
                                                </div>

                                                <div className='flex items-center space-x-4'>
                                                    <div className='relative'>
                                                        <select 
                                                            className='bg-secondary border border-border text-xs font-bold py-2 px-4 pr-8 appearance-none focus:ring-2 focus:ring-primary rounded cursor-pointer text-foreground'
                                                            value={item.quantity}
                                                            onChange={(e) => updateCartItemQuantity(item.cartItemId, parseInt(e.target.value))}
                                                        >
                                                            {[...Array(10)].map((_, i) => (
                                                                <option key={i+1} value={i+1}>Qty: {i+1}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                                                            <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='flex items-baseline space-x-3'>
                                                    <span className='text-lg font-black text-foreground'>₹{(item.product?.price || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Action */}
                                        <div className='border-t border-border flex justify-center py-3 bg-secondary/50'>
                                            <Link to={`/products/${item.product?._id}`} className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em] text-[10px] font-black">
                                                <FaRegEye className="w-3" />
                                                <span>View Details</span>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className='space-y-6'>
                            <div className="flex items-center space-x-2 text-muted-foreground mb-4">
                                <BoxIcon className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-widest">Order Summary</span>
                            </div>

                            <div className='bg-card border-2 border-border p-8 space-y-6 rounded'>
                                <div className='space-y-4'>
                                    <div className='flex justify-between text-sm text-muted-foreground font-bold'>
                                        <p>Subtotal</p>
                                        <p>₹{subtotalMRP.toLocaleString()}</p>
                                    </div>
                                    <div className='flex justify-between text-sm font-bold'>
                                        <p className="text-muted-foreground">Shipping</p>
                                        <p className="text-primary">{calculatedDeliveryCharge === 0 ? 'Free' : `₹${calculatedDeliveryCharge}`}</p>
                                    </div>
                                </div>

                                <div className='pt-6 border-t-2 border-border'>
                                    <div className='flex justify-between items-baseline'>
                                        <div className="space-y-1">
                                            <p className='text-base font-black text-foreground uppercase tracking-wider'>Order Total</p>
                                            <p className='text-[10px] text-muted-foreground font-bold uppercase'>(including GST)</p>
                                        </div>
                                        <p className='text-2xl font-black text-primary'>₹{finalTotal.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    if (currentUser) {
                                        if (!currentUser.phone) {
                                            setShowPhoneModal(true);
                                        } else {
                                            navigate('/checkout');
                                        }
                                    } else {
                                        toast.info("Please sign in to complete your purchase");
                                        navigate('/signin', { state: { from: '/checkout' } });
                                    }
                                }}
                                className='w-full bg-primary text-primary-foreground py-4 rounded flex items-center justify-center space-x-3 text-sm font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98]'
                            >
                                <FaShieldAlt className="h-4 w-4" />
                                <span>Secure Checkout &nbsp;&gt;</span>
                            </button>
                        </div>

                    </div>
                )}
            </div>

            {/* Phone Number Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded p-8 max-w-md w-full shadow-2xl relative border border-border">
                        <button 
                            onClick={() => setShowPhoneModal(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <IoMdClose className="text-2xl" />
                        </button>
                        
                        <h2 className="text-xl font-black mb-2 text-center text-foreground tracking-widest uppercase italic">Contact Info</h2>
                        <p className="text-xs text-muted-foreground text-center mb-8 uppercase tracking-wider font-bold">Please provide your phone number to complete the order.</p>
                        
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-foreground uppercase tracking-widest mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter your mobile number"
                                    className="w-full bg-secondary border border-border focus:border-primary py-3 px-4 text-foreground rounded text-sm focus:ring-0 transition-colors font-bold"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmittingPhone}
                                className="w-full bg-primary text-primary-foreground py-3 text-xs font-black tracking-widest uppercase rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isSubmittingPhone ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
