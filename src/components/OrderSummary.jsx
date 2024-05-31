import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

function OrderSummary({ cartItems }) {
    const { currentUser } = useSelector(state => state.user);
    const userId = currentUser._id;
    const dispatch = useDispatch();
    const totalPrice = Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0) : 0;
    const totalAmount = totalPrice + 50

    const createPayment = async (amount) => {
        try {
            const products = cartItems.map(item => ({
                productId: item.product._id,
                quantity: item.quantity
            }));
            const cartItemsToDelete = cartItems.map(cartItem=>cartItem.cartItemId);

            const requestBody = {
                amount: totalAmount,
                userId: userId,
                products: products,
                totalAmount: totalAmount
            };
            const { data: { order } } = await axios.post(`${import.meta.env.VITE_PORT}/api/payment/createpayment`, requestBody)

            const { data: { key } } = await axios.get(`${import.meta.env.VITE_PORT}/api/getkey`)
            const productsQueryParam = encodeURIComponent(JSON.stringify(products));
            
            const cartItemsQueryParam = encodeURIComponent(JSON.stringify(cartItemsToDelete))
            const options = {
                key: key,
                amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                currency: "INR",
                name: "Sportsync",
                description: "Ecommerce for sports equipments",
                image: "https://example.com/your_logo",
                order_id: order.id,
                callback_url: (`${import.meta.env.VITE_PORT}/api/payment/verifypayment?reference=${order.id}&totalAmount=${totalAmount}&userId=${userId}&products=${productsQueryParam}&cartItems=${cartItemsQueryParam}`),
                prefill: {
                    "name": "Gaurav Kumar",
                    "email": "gaurav.kumar@example.com",
                    "contact": "9000090000"
                },
                notes: {
                    "address": "Razorpay Corporate Office"
                },
                theme: {
                    "color": "#3399cc"
                }
            };
            const razor = new window.Razorpay(options);
            razor.open();
        }
        catch (error) {
            throw new Error("inside frontend error", error.message);
        }
    }


    const handleCheckout = () => {
        createPayment(totalAmount);
    }

    return (
        <>
            <div className='bg-white h-auto p-8 rounded shadow-lg'>
                <h1 className='text-2xl font-semibold mb-6'>Order Summary</h1>
                {/* Loop through cartItems and display each item */}
                {/* {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                      <p>{item.product.name} x {item.quantity}</p>
                      <p>₹{item.product.price * item.quantity}</p>
                  </div>
              ))}
              <hr className='border-gray-400' /> */}
                <div className='flex justify-between'>
                    <p>Subtotal</p>
                    <p>₹{totalPrice + 100}</p>
                </div>
                <div className='flex justify-between'>Discount <p>-₹100</p></div>
                <div className='flex justify-between'>Delivery <p>₹50</p></div>
                <hr className='border-gray-400' />
                <h1 className='text-xl font-semibold mb-6 flex justify-between'>Total <p>₹{totalPrice + 50}</p></h1>
                <div className='w-50 h-10 bg-gray-300 grid place-content-center'><p className='font-bold text-[12.5px]'>You saved ₹100 in this order</p></div>
            </div>
            <button onClick={handleCheckout} className="w-full bg-blue-500 text-white py-2 px-4 rounded mt-5">Proceed to Checkout</button>
        </>
    );
}

export default OrderSummary