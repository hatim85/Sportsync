import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ProductCard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {//removed async await
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/getAllproducts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);  
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  
  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        products.map((product, index) => (
          <div key={index} className="border h-[38vh] m-[10px] w-[40vw] md:h-[50vh] sm:w-[15vw] border-gray-500 bg-gray-300 rounded-md shadow-md overflow-hidden">
            <Link to={`/products/${product._id}`} className="block" style={{ textDecoration: 'none' }}>
              <div className="flex justify-center items-center">
                <img
                  src={`/${product.image[0]}` || '/ErrorImage.png'}
                  onError={(e) => e.target.src = '/ErrorImage.png'}
                  className="object-cover object-center md:h-[32vh] h-[22vh] w-full"
                />
              </div>
              <div className="p-4">
                <h2 className={` font-bold ${product.name.length > 16 ? 'sm:text-sm md:text-xl' : 'md:text-xl'}`}>{product.name}</h2>
                <p className={`text-gray-700 ${product.description.length > 20 ? 'text-sm' : 'mt-2 md:text-xl sm:text-sm'}`}>{product.description.length > 20 ? product.description.substring(0, 10) + '...' : product.description}</p>
                <h2 className="md:text-lg text-sm font-semibold">₹{product.price} <del className='text-gray-500 text-sm'>${product.price + 200}</del></h2>
              </div>
            </Link>
          </div>
        ))
      )}
    </>
  );
}

export default ProductCard;
