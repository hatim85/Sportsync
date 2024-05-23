import React, { useEffect, useState } from 'react'
import ImageDescription from '../../components/ImageDescription'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useDispatch, useSelector } from 'react-redux'
import { getProductByIdFailure, getProductByIdStart, getProductByIdSuccess } from '../../redux/slices/productSlice'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { addCartItemFailure, addCartItemStart, addCartItemSuccess } from '../../redux/slices/cartSlice'
import ProductCard from '../../components/ProductCard'

function ProductDescription() {
    const dispatch = useDispatch();
    const [quantity, setQuantity] = useState(1);
    const { productId } = useParams();
    const [loading, setLoading] = useState(false);
    const { category } = useSelector(state => state.product);
    const { currentUser } = useSelector(state => state.user);
    const [product, setProduct] = useState(null);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchProduct(productId);
    }, [productId]);

    const fetchProduct = async (productId) => {
        try {
            dispatch(getProductByIdStart());
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/getbyId/${productId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch product');
            }
            const data = await response.json();
            dispatch(getProductByIdSuccess(data));
            setProduct(data);
            setLoading(false);
            return data;
        } catch (error) {
            dispatch(getProductByIdFailure(error.message));
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        if (!currentUser) {
            toast.error('Please log in to add items to the cart');
            return;
        }

        try {
            dispatch(addCartItemStart());
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/cartItem/addToCart/${productId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userId: currentUser._id })
            });
            if (!res.ok) {
                toast.error('Something went wrong');
                throw new Error('Failed to add product to cart');
            }
            const data = await res.json();
            dispatch(addCartItemSuccess(data));
            setIsAddedToCart(true);
            toast.success('Product added to cart');

            // Add the product to local storage
            const updatedCart = [...cart, productId];
            setCart(updatedCart);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
        } catch (error) {
            dispatch(addCartItemFailure(error.message));
        }
        setQuantity(1);
    };

    return (
        <>
            <Header />
            <div className='flex justify-center flex-wrap content-center items-center'>
                <div className='rounded-2xl'>
                    <ImageDescription />
                </div>
                <div className='flex m-[3vw] flex-col'>
                    {product && (
                        <>
                            <h1 className='font-bold text-2xl'>{product.name}</h1>
                            <h1 className='font-semibold text-xl mt-2'>₹{product.price}</h1>
                            <del className='text-gray-500'>₹{product.price + 200}</del>
                            <div className='mt-[10vh] mb-[10vh]'>{product.description}</div>
                        </>
                    )}
                    <div className="m-[2vw] w-[80vw] md:w-auto flex flex-wrap">
                        {currentUser ? (
                            <>
                                {isAddedToCart ? (
                                    <Link to="/cart" className="bg-blue-600 text-center w-full md:w-[10vw] rounded-[30px] font-none text-white px-4 py-2">
                                        Go to Cart
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            className={`bg-yellow-600 w-full md:w-[10vw] rounded-[30px] font-none text-white px-4 py-2 md:mr-5`}
                                            onClick={() => handleAddToCart(productId)}
                                        >
                                            Add to Cart
                                        </button>
                                        <Link to='/cart' className='w-full md:w-[10vw] mt-5 md:mt-0'>
                                            <button onClick={()=>handleAddToCart(productId)} className="bg-orange-600 w-full rounded-[30px] font-none text-white px-4 py-2">
                                                Buy Now
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-red-500">Please login to buy <br/>
                                    <Link to='/SignIn'>
                                        <button className='border bg-blue-500 border-white rounded-full text-white px-4 py-2'>Sign In</button>
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ProductDescription;
