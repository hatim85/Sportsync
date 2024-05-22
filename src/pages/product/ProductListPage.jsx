// ProductListPage.js

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function ProductListPage() {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/getProductsByCategory/${categoryId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products')
                }
                const data = await response.json();
                setProducts(data.products);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId]);

    return (
        <>
            <Header />
            <div className="container mx-auto mt-8">
                <h1 className="text-3xl font-bold mb-4">Products in this Category</h1>
                {loading && <div>Loading...</div>}
                {!loading && products.length === 0 && (
                    <div>No products available in this category</div>
                )}
                <div className='flex flex-wrap md:justify-normal justify-center'>
                    {products.map(product => (
                        <div key={product._id} className="border h-[38vh] m-[10px] w-[40vw] md:h-[50vh] sm:w-[15vw] border-gray-500 bg-gray-300 rounded-md shadow-md overflow-hidden">
                            <Link to={`/products/${product._id}`} className='block'>
                                <div className="flex justify-center items-center">
                                    <img
                                        src={`/${product.image[0]}` || '/ErrorImage.png'}
                                        alt={product.name}
                                        className="object-cover object-center md:h-[32vh] h-[20vh] w-full"
                                        onError={(e) => e.target.src = '/ErrorImage.png'}
                                    />
                                </div>
                                <div className="p-4">
                                    <h2 className={` font-bold ${product.name.length > 15 ? 'sm:text-sm md:text-xl' : 'md:text-xl'}`}>{product.name}</h2>
                                    <p className={`text-gray-700 ${product.description.length>15 ? 'text-sm' : 'mt-2 md:text-xl sm:text-sm'}`}>{product.description.length > 20 ? product.description.substring(0, 20) + '...' : product.description}</p>
                                    <h2 className="md:text-lg text-sm font-semibold">{`₹${product.price}`} <del className='text-gray-500 text-sm'>${product.price + 200}</del></h2>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ProductListPage;
