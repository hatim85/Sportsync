import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getProductByIdStart, getProductByIdSuccess } from '../redux/slices/productSlice';

function ImageDescription() {
    const [slideIndex, setSlideIndex] = useState(0);
    const images = ["/badminton.jpeg", "/color.jpeg", "/Umbrella.avif"]; // Add your image paths here
    const [loading, setLoading] = useState(false);
    const {products}=useSelector(state=>state.product)
    const { productId } = useParams();
    const dispatch = useDispatch();
    const prodimg=products.image;
    const nextSlide = () => {
        setSlideIndex((slideIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setSlideIndex((slideIndex - 1 + images.length) % images.length);
    };

    useEffect(() => {
        fetchProduct(productId);
    }, [productId])

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
            return data
        } catch (error) {
            // dispatch(getProductByIdFailure(error.message));
            // setLoading(false);
        };
    }

    return (
        <div className="container mx-auto mt-8">
            <div className="relative md:w-[100vh] w-[100%]">
                <div className="overflow-hidden">
                    <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
                        {prodimg && prodimg.map((prod, index) => (
                            <div key={index} className="w-full flex-shrink-0">
                                <img src={`/${prod}`} alt={`Slide ${index + 1}`} onError={(e) => e.target.src = '/ErrorImage.png'} className="md:h-[100vh] h-[50vh] w-full" />
                            </div>
                        )
                        )}
                    </div>
                </div>
                <button className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-700 text-white rounded-full px-3 py-1" onClick={prevSlide}>
                    &#10094;
                </button>
                <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-700 text-white rounded-full px-3 py-1" onClick={nextSlide}>
                    &#10095;
                </button>
            </div>
        </div>
    );
}

export default ImageDescription;
