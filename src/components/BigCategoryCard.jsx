import React from 'react'
import { useEffect,useState } from 'react';

function BigCategoryCard() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getAllcategory`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data = await response.json(); 
                setCategories(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);
    return (
        <>
            {loading && <div>Loading...</div>}
            {!loading && categories.length === 0 && (
                <div>No categories available</div>
            )}
            {categories.map((category,key) => (
                <a key={key} href={`/categories/${category._id}`} className='m-auto md:w-[20vw] sm:w-[60%] flex flex-shrink-0'>
                <div>
                    <div className=" h-[50vh] w-screen md:w-auto m-[10px]">
                        <div className="relative bg-cover bg-center w-full h-full">
                            <img
                                src={category.image[1] || '/ErrorImage.png'}
                                alt={category.name}
                                className="inset-0 rounded-md w-full h-full object-cover"
                                onError={(e) => { e.target.src = '/ErrorImage.png' }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-4">
                                <h1 className="text-white text-center text-2xl font-bold">{category.name}</h1>
                                <div className="mt-2">
                                    <button className="bg-violet-600 rounded-full text-white px-4 py-2">Shop Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </a>
            ))}
        </>
    )
}

export default BigCategoryCard