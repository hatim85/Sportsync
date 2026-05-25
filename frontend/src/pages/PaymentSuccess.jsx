import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { FaCheckCircle, FaBoxOpen, FaArrowRight } from 'react-icons/fa'
import { HiOutlineArrowPath } from 'react-icons/hi2'

function PaymentSuccess() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        localStorage.removeItem('cartItems');
        // Trigger animation after mount
        setTimeout(() => setVisible(true), 100);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />

            <main className="flex-grow flex items-center justify-center px-4 py-20">
                <div className={`w-full max-w-lg text-center space-y-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                    {/* Animated Check Icon */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border border-border flex items-center justify-center bg-secondary shadow-inner">
                                <FaCheckCircle className="text-foreground h-10 w-10" />
                            </div>
                            {/* Pulse ring */}
                            <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping" />
                        </div>
                    </div>

                    {/* Message Block */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Order Confirmed</p>
                        <h1 className="text-4xl md:text-5xl font-serif italic text-foreground leading-tight">
                            Thank You for<br />Your Order
                        </h1>
                        <div className="w-8 h-[1px] bg-primary mx-auto" />
                        <p className="text-sm text-muted-foreground font-light tracking-wide max-w-sm mx-auto leading-relaxed">
                            Your order has been placed successfully. We'll send you a confirmation and updates as your equipment is prepared with care.
                        </p>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="border border-border p-5 space-y-2 bg-secondary/50">
                            <FaBoxOpen className="text-muted-foreground h-4 w-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estimated Delivery</p>
                            <p className="text-xs font-bold text-foreground">5–7 Business Days</p>
                        </div>
                        <div className="border border-border p-5 space-y-2 bg-secondary/50">
                            <HiOutlineArrowPath className="text-muted-foreground h-4 w-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Returns</p>
                            <p className="text-xs font-bold text-foreground">Free 15-Day Returns</p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/profile?tab=orders"
                            className="flex-1 flex items-center justify-center space-x-2 border border-primary py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground hover:bg-primary hover:text-primary-foreground transition-all group"
                        >
                            <span>Track Order</span>
                            <FaArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/"
                            className="flex-1 flex items-center justify-center space-x-2 bg-primary py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-primary-foreground hover:bg-primary transition-all"
                        >
                            <span>Continue Shopping</span>
                        </Link>
                    </div>

                    {/* Subtle Brand Footer */}
                    <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
                        Sportsync — Lifetime Exchange & Buyback
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default PaymentSuccess