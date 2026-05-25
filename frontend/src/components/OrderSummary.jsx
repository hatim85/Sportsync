import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function OrderSummary({ cartItems }) {
    const { currentUser } = useSelector(state => state.user);
    const userId = currentUser._id;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [deliveryCharge, setDeliveryCharge] = useState(50);
    const [loadingDelivery, setLoadingDelivery] = useState(true);

    useEffect(() => {
        const fetchDeliveryCharge = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_PORT}/api/settings/pricing`);
                if (!res.ok) throw new Error('Failed to fetch delivery charge');
                const data = await res.json();
                setDeliveryCharge(Number(data?.deliveryCharge ?? 0));
            } catch (err) {
                console.error('Failed to load delivery charge:', err);
                setDeliveryCharge(50); // fallback
            } finally {
                setLoadingDelivery(false);
            }
        };
        fetchDeliveryCharge();
    }, []);

    const totalPrice = Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0) : 0;
    const totalAmount = totalPrice + deliveryCharge;

    const handleCheckout = () => {
        navigate('/checkout');
    }

    return (
        <>
            <div className='bg-card h-auto p-8 rounded shadow-lg'>
                <h1 className='text-2xl font-semibold mb-6'>Order Summary</h1>
                {/* Loop through cartItems and display each item */}
                {/* {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                      <p>{item.product.name} x {item.quantity}</p>
                      <p>₹{item.product.price * item.quantity}</p>
                  </div>
              ))}
              <hr className='border-border' /> */}
                <div className='flex justify-between'>
                    <p>Subtotal</p>
                    <p>₹{totalPrice + 100}</p>
                </div>
                <div className='flex justify-between'>Discount <p>-₹100</p></div>
                <div className='flex justify-between'>
                    Delivery
                    <p>
                        {loadingDelivery ? '...' : (
                            deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`
                        )}
                    </p>
                </div>
                <hr className='border-border' />
                <h1 className='text-xl font-semibold mb-6 flex justify-between'>
                    Total
                    <p>₹{totalAmount}</p>
                </h1>
                <div className='w-50 h-10 bg-gray-300 grid place-content-center'>
                    <p className='font-bold text-[12.5px]'>
                        You saved ₹100 in this order
                        {deliveryCharge === 0 && ' + FREE delivery'}
                    </p>
                </div>
            </div>
            <button onClick={handleCheckout} className="w-full bg-blue-500 text-primary-foreground py-2 px-4 rounded mt-5">Proceed to Checkout</button>
        </>
    );
}

export default OrderSummary