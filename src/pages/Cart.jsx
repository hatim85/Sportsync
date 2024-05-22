import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify'
import { fetchCartItemsRequest, fetchCartItemsSuccess, fetchCartItemsFailure, removeCartItemStart, removeCartItemSuccess, removeCartItemFailure, updateCartItemQuantityStart, updateCartItemQuantitySuccess, updateCartItemQuantityFailure } from '../redux/slices/cartSlice';
import OrderSummary from '../components/OrderSummary';
import DummyHeader from '../components/DummyHeader';
import AddressForm from './AddressForm';
import AddressCard from '../components/AddressCard';

function Cart() {
    const dispatch = useDispatch();
    const { cartItems, loading, error } = useSelector(state => state.cart);
    const { currentUser } = useSelector(state => state.user);
    const userId = currentUser._id;

    {/* Refresh the page in cart for see the reflecting changes sometimes it doesn't update the changes directly  */ }


    useEffect(() => {
        fetchCartItems(userId);
    }, []);

    const handleDelete = async (itemId) => {
        dispatch(removeCartItemSuccess(itemId));
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/cart/delete/${itemId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!res.ok) {
                throw new Error('Failed to delete item');
            }
            toast.success("Item removed from cart");
        } catch (error) {
            dispatch(removeCartItemFailure(error.message));
        }
    };

    const updateCartItemQuantity = async (cartItemId, quantity) => {
        dispatch(updateCartItemQuantityStart());
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/cart/update/${cartItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity }),
            });
            if (!res.ok) {
                throw new Error('Failed to update quantity');
            }
            const data = await res.json();
            dispatch(updateCartItemQuantitySuccess(data));
            toast.success('Quantity updated successfully');
        } catch (error) {
            console.error('Error updating quantity:', error.message);
            dispatch(updateCartItemQuantityFailure(error.message));
            toast.error('Failed to update quantity');
        }
    };

    const fetchCartItems = async (userId) => {
        dispatch(fetchCartItemsRequest());
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/cart/getcart/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            dispatch(fetchCartItemsSuccess(data));
        }
        catch (error) {
            dispatch(fetchCartItemsFailure(error.message));
        }
    }


    const userAddress = currentUser.address;
    const quantityOptions = [1, 2, 3, 4, 5, 6];
    return (
        <>
            <DummyHeader />
            <AddressCard className='w-fit' />
            <div className='flex w-full flex-wrap h-screen bg-gray-300'>
                <div className='md:w-[65%] m-5'>
                    {loading && <p>Loading...</p>}
                    {error && <p>Error: {error}</p>}
                    {Object.keys(cartItems) && cartItems.length > 0 ? (
                        <>
                            {Object.values(cartItems).map((item, index) => (
                                <div key={index} className=' bg-white relative duration-700'>
                                    <div className='p-5 flex flex-row gap-6'>
                                        <div className='w-24 h-24 border border-gray-300'>
                                            <img src={item.product.image[0]} alt='Product' className='w-full h-full object-cover rounded' />
                                        </div>
                                        <div className='flex-1 flex-row'>
                                            <h2 className='text-lg font-semibold mb-1'>{item.product.name}</h2>
                                            <div className='bg-gray-300 p-2 rounded w-fit'>
                                                <label className="">Qty:</label>
                                                <select className='bg-gray-300'
                                                    value={item.quantity}
                                                    onChange={(e) => updateCartItemQuantity(item.cartItemId, parseInt(e.target.value))}
                                                >
                                                    {quantityOptions.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <p className=' font-semibold mb-1'>₹{item.product.price}<del className='text-gray-400'>₹{item.product.price + 100}</del></p>
                                            <p className='text-gray-600 mb-1'>Delivery by 05th Apr 2024</p>
                                        </div>
                                        <FaTrash className='text-gray-600 text-xl cursor-pointer' onClick={() => handleDelete(item.cartItemId)} />
                                        {/* refresh the page for reflecting product deletion */}
                                    </div>
                                    <hr />
                                </div>
                            ))}
                        </>
                    ) : (
                        <p>No items in cart</p>
                    )}
                </div>
                {cartItems && cartItems.length > 0 ? (
                    <div className='w-full md:w-[25%] m-5'><OrderSummary cartItems={cartItems} /></div>
                ) : (
                    <></>
                )}
            </div >
        </>
    );
}

export default Cart;
