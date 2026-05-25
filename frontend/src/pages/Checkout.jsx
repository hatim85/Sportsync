import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../utils/api.js';
import Header from '../components/Header';
import AddressCard from '../components/AddressCard';
import { fetchCartItemsRequest, fetchCartItemsSuccess, fetchCartItemsFailure, clearCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

function Checkout() {
    const dispatch = useDispatch();
    const { cartItems, loading, error } = useSelector(state => state.cart);
    const { currentUser } = useSelector(state => state.user);
    const navigate = useNavigate();
    const userId = currentUser._id;

    const [deliveryCharge, setDeliveryCharge] = useState(49);
    const [loadingDelivery, setLoadingDelivery] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [processing, setProcessing] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    useEffect(() => {
        // Only redirect to cart if the cart is truly empty and we aren't currently 
        // in the middle of processing a successful payment transition.
        if (!processing && (!Array.isArray(cartItems) || cartItems.length === 0)) {
            navigate('/cart');
        } else if (currentUser && !currentUser.phone) {
            toast.error("Please provide a phone number to continue.");
            navigate('/cart');
        }
    }, [cartItems, navigate, processing, currentUser]);

    useEffect(() => {
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            const fetchCartItems = async () => {
                dispatch(fetchCartItemsRequest());
                try {
                    const response = await fetch(`${import.meta.env.VITE_PORT}/api/cart/getcart/${userId}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (!response.ok) throw new Error('Failed to fetch items');
                    const data = await response.json();
                    dispatch(fetchCartItemsSuccess(data));
                } catch (err) {
                    dispatch(fetchCartItemsFailure(err.message));
                }
            };
            fetchCartItems();
        }
    }, [cartItems, userId, dispatch]);

    const totalPrice = Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0) : 0;
    const codFee = paymentMethod === 'cod' ? 0 : 0;
    const totalAmount = totalPrice + deliveryCharge + codFee;

    const deliveryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const formattedDeliveryDate = `By ${deliveryDate.toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })}`;

    useEffect(() => {
        // Calculate delivery charge based on cart total
        const calcTotal = Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0) : 0;
        if (calcTotal > 0 && calcTotal < 499) {
            setDeliveryCharge(49);
        } else {
            setDeliveryCharge(0);
        }
        setLoadingDelivery(false);
    }, [cartItems]);

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select an address before placing your order.');
            return;
        }
        setProcessing(true);
        try {
            const products = cartItems.map(item => ({
                productId: item.product._id,
                quantity: item.quantity,
                size: item.size,
                metalType: item.metalType,
                engraving: item.engraving,
                stone: item.stone,
                finish: item.finish
            }));
            const cartItemsToDelete = cartItems.map(cartItem => cartItem.cartItemId);

            if (paymentMethod === 'cod') {
                const orderData = {
                    amount: totalAmount,
                    products,
                    paymentMethod: 'cod',
                    status: 'confirmed',
                    totalAmount,
                    deliveryDate: formattedDeliveryDate,
                    address: selectedAddress
                };
                await api.post('/api/orders/create', orderData);
                await Promise.all(cartItemsToDelete.map(id =>
                    axios.delete(`${import.meta.env.VITE_PORT}/api/cart/delete/${id}`)
                ));
                dispatch(clearCart());
                navigate('/paymentsuccess');
            } else {
                if (!window.Razorpay) {
                    toast.error('Razorpay SDK not loaded. Please refresh the page.');
                    return;
                }
                const { data } = await api.post('/api/payment/createpayment', {
                    amount: totalAmount,
                    products,
                    totalAmount,
                    address: selectedAddress
                });
                const order = data.order;
                const dbOrderId = data.dbOrderId;

                const { data: { key } } = await axios.get(`${import.meta.env.VITE_PORT}/api/getkey`);
                const options = {
                    key,
                    amount: order.amount,
                    currency: "INR",
                    name: "SPORTSYNC",
                    description: "Premium Gear Purchase",
                    image: "/LOGO.png", 
                    order_id: order.id,
                    handler: async (response) => {
                        try {
                            setProcessing(true);
                            
                            // 1. Immediate Active Verification
                            const verifyRes = await api.post('/api/payment/verifypayment', {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                dbOrderId: dbOrderId
                            });

                            if (verifyRes.data.success) {
                                await Promise.all(cartItemsToDelete.map(id =>
                                    axios.delete(`${import.meta.env.VITE_PORT}/api/cart/delete/${id}`)
                                ));
                                dispatch(clearCart());
                                navigate('/paymentsuccess');
                                return;
                            }

                            // 2. Fallback Polling (in case verification fails but payment is valid)
                            let attempts = 0;
                            const maxAttempts = 60; // 180 seconds (3 minutes) polling duration
                            const pollInterval = setInterval(async () => {
                                attempts++;
                                try {
                                    const res = await api.get(`/api/orders/getorder/${dbOrderId}`);
                                    if (res.data.status !== 'payment_pending') {
                                        clearInterval(pollInterval);
                                        if (res.data.status !== 'cancelled' && res.data.status !== 'failed') {
                                            await Promise.all(cartItemsToDelete.map(id =>
                                                axios.delete(`${import.meta.env.VITE_PORT}/api/cart/delete/${id}`)
                                            ));
                                            dispatch(clearCart());
                                            navigate('/paymentsuccess');
                                        } else {
                                            setProcessing(false);
                                            toast.error('Payment failed or order was cancelled.');
                                        }
                                    } else if (attempts >= maxAttempts) {
                                        clearInterval(pollInterval);
                                        setProcessing(false);
                                        toast.error('Payment verification timeout. Please check your orders later.');
                                        navigate('/profile?tab=orders'); 
                                    }
                                } catch (err) {
                                    console.error('Polling error:', err);
                                }
                            }, 3000);
                        } catch (err) {
                            console.error('Failed to verify payment:', err);
                            toast.error('Payment succeeded, but validation failed. Please check your orders.');
                            navigate('/profile?tab=orders');
                        }
                    },
                    prefill: {
                        name: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser?.username || ""),
                        email: currentUser?.email || "",
                        contact: currentUser?.phone || ""
                    },
                    theme: {
                        color: "#000000"
                    }
                };
                const razor = new window.Razorpay(options);
                razor.open();
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const getImagePath = (imageName) => {
        if (!imageName) return '/ErrorImage.png';
        if (imageName.includes('cloudinary.com')) return imageName;
        return `/${imageName.split(/[\\/]/).pop()}`;
    };

    return (
        <div className="bg-background min-h-screen font-sans text-foreground">
            <Header />
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black italic tracking-tighter text-foreground uppercase mb-4">Secure Checkout</h1>
                    <div className="w-12 h-1 bg-primary mx-auto"></div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                    {/* Left Column: Address & Payment */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Address Selection */}
                        <div className="bg-card p-6 md:p-10 border-2 border-border rounded shadow-sm">
                            <h2 className="text-sm font-black tracking-widest uppercase text-foreground mb-6 border-b-2 border-border pb-4">
                                Shipping Details
                            </h2>
                            <AddressCard className="w-full" onAddressSelect={setSelectedAddress} />
                        </div>

                        {/* Payment Method */}
                        <div className="bg-card p-6 md:p-10 border-2 border-border rounded shadow-sm">
                            <h2 className="text-sm font-black tracking-widest uppercase text-foreground mb-6 border-b-2 border-border pb-4">
                                Payment Method
                            </h2>
                            <div className="space-y-4">
                                <label className={`flex items-center p-4 border-2 rounded cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-primary focus:ring-primary bg-background border-border"
                                    />
                                    <div className="ml-4">
                                        <span className="block text-sm font-black text-foreground tracking-wider uppercase">Pay Online</span>
                                        <span className="block text-xs font-bold text-muted-foreground mt-1">UPI, Credit Card, Debit Card, Net Banking</span>
                                    </div>
                                </label>
                                
                                <label className={`flex items-center p-4 border-2 rounded cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-primary focus:ring-primary bg-background border-border"
                                    />
                                    <div className="ml-4">
                                        <span className="block text-sm font-black text-foreground tracking-wider uppercase">Cash on Delivery</span>
                                        <span className="block text-xs font-bold text-muted-foreground mt-1">Pay when your order arrives.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-card p-6 md:p-10 border-2 border-border rounded shadow-sm sticky top-24">
                            <h2 className="text-sm font-black tracking-widest uppercase text-foreground mb-6 border-b-2 border-border pb-4">
                                Order Summary
                            </h2>
                            
                            {/* Items List */}
                            <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                                {Array.isArray(cartItems) && cartItems.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-20 h-20 bg-secondary border border-border p-2 rounded flex-shrink-0">
                                            <img
                                                src={getImagePath(item.product?.image?.[item.product?.coverImageIndex] || item.product?.image?.[0])}
                                                alt={item.product?.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {e.target.src='/ErrorImage.png'}}
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="text-xs md:text-sm font-black text-card-foreground uppercase tracking-widest line-clamp-1">{item.product?.name}</h3>
                                            <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                                                Qty: {item.quantity} | Size: {item.size}
                                            </p>
                                            <p className="text-xs md:text-sm font-black text-foreground mt-2">₹{Number(item.product?.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Calculations */}
                            <div className="space-y-3 text-xs uppercase tracking-wider font-bold text-muted-foreground border-t-2 border-border pt-6">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-foreground">₹{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Charge</span>
                                    <span className="text-foreground">
                                        {loadingDelivery ? 'Calculating...' : (deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t-2 border-border mt-6 pt-6 flex justify-between items-center mb-8">
                                <span className="text-sm font-black tracking-widest uppercase text-foreground">Total</span>
                                <span className="text-2xl font-black text-primary">₹{totalAmount.toLocaleString()}</span>
                            </div>

                            <p className="text-xs font-bold text-muted-foreground mb-6 text-center uppercase tracking-wider">
                                ESTIMATED DELIVERY BY {formattedDeliveryDate}
                            </p>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={processing || loadingDelivery}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-4 text-xs font-black tracking-[0.2em] uppercase rounded disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : `Place Order • ₹${totalAmount.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
