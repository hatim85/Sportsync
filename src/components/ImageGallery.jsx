  import React, { useEffect, useRef, useState } from 'react';
import { FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategoryImages = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getzeroimg`);
        if (!response.ok) {
          throw new Error('Failed to fetch category images');
        }
        const data = await response.json();
        setCategories(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchCategoryImages();
  }, []);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === categories.length - 1 ? 0 : prevIndex + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? categories.length - 1 : prevIndex - 1));
  };

  return (
    <div className="relative w-full h-full">
      <div className="flex justify-center items-center h-full w-auto">
        <button onClick={goToPrevious} className="absolute top-1/2 left-4 rounded-full bg-white p-2">
          <FaChevronCircleLeft className="h-6 w-6 text-gray-700" />
        </button>
        <div className="overflow-hidden flex-shrink-0" style={{ width: '100%', display: 'flex' }}>
          {categories.map((category, index) => (
            <div key={index} className={`w-full ${currentIndex === index ? '' : 'hidden'}`}>
            <Link to={`/categories/${category.categoryId}`}>
              <div className="m-auto w-screen category-card-link">
                <img
                  src={`/${category.image}`}
                  alt={`Image ${index}`}
                  onError={(e) => e.target.src = '/ErrorImage.png'}
                  className="h-[30vh] md:h-[60vh] w-full"
                />
              </div>
            </Link>
            </div>
          ))}
        </div>
        <button onClick={goToNext} className="absolute top-1/2 right-4 rounded-full bg-white p-2">
          <FaChevronCircleRight className="h-6 w-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

export default ImageGallery;
