import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getProductByIdStart, getProductByIdSuccess } from '../redux/slices/productSlice';

function ImageDescription({ images }) {
    const [slideIndex, setSlideIndex] = useState(0);
    // Filter out any empty strings or nulls to ensure dots are strictly dynamic based on actual images
    const prodimg = (images || []).filter(img => typeof img === 'string' && img.trim() !== '');
    const totalSlides = prodimg.length;
    const nextSlide = () => {
        if (!totalSlides) return;
        setSlideIndex((slideIndex + 1) % totalSlides);
    };

    const prevSlide = () => {
        if (!totalSlides) return;
        setSlideIndex((slideIndex - 1 + totalSlides) % totalSlides);
    };



    return (
        <div className="relative w-full max-w-[600px] mx-auto group">
            <div className="overflow-hidden rounded-xl bg-secondary">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${slideIndex * 100}%)` }}
                >
                    {prodimg.map((prod, index) => (
                        <div key={index} className="w-full flex-shrink-0">
                            <img
                                src={prod.includes('cloudinary.com') ? prod : `/${prod.split(/[\\/]/).pop()}`}
                                alt={`Slide ${index + 1}`}
                                onError={(e) => {
                                    e.target.src = '/ErrorImage.png';
                                }}
                                className="w-full h-[500px] object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>


            {/* Dots */}
            {totalSlides > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    {prodimg.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setSlideIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${slideIndex === index
                                ? 'bg-primary w-6'
                                : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ImageDescription;
