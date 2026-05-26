import React, { useState } from 'react';

function ImageDescription({ images }) {
    const [slideIndex, setSlideIndex] = useState(0);
    const prodimg = (images || []).filter(img => typeof img === 'string' && img.trim() !== '');
    const totalSlides = prodimg.length;

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
