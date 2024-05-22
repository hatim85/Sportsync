import React, { useState } from 'react'
import { FaTrash } from 'react-icons/fa';

function CartItems() {
    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (event) => {
        setQuantity(parseInt(event.target.value));
    };
    const [imageError, setImageError] = useState(false)
    return (
        <>
            <div className='flex bg-pink-500 h-[35vh] w-[40vw] relative'>
                <div className='flex justify-center items-center m-[20px]'>
                    {imageError ? (
                        // Placeholder or error image when the specified image fails to load
                        <img src="/ErrorImage.png" alt="Error" style={{height:"20vh",width:"13vw"}} />
                    ) : (
                        // Main image
                        <img
                            src="/badminton.jpeg"
                            style={{height:"20vh",width:"13vw"}}
                            onError={() => setImageError(true)} // Set imageError state to true if the image fails to load
                        />
                    )}
                    <div className='ml-[2vw]'>
                        <h2>product name</h2>
                        <p>product description</p>
                        <select className='p-1 cursor-pointer' value={quantity} onChange={handleQuantityChange}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            {/* Add more options as needed */}
                        </select>
                        <h2>₹20</h2>
                        <button className='p-1 text-white rounded-lg bg-violet-700'>Buy Now</button>
                    </div>
                    <FaTrash className='absolute right-0 cursor-pointer' />
                </div>
            </div>
        </>
    )
}

export default CartItems