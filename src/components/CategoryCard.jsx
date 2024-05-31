import React from 'react'
import { useState, useEffect } from 'react';

function CategoryCard() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true)
                try {
                    const response = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getAllCategory`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    const data = await response.json();
                    setCategories(data)
                    setLoading(false)
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    setLoading(false)
                }
        };

        fetchCategories();
    }, []);
    return (
        <>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {
                        categories.map((category, index) => (
                            <a key={`${category._id}-${index}`} href={`/categories/${category._id}`} className="m-auto">
                                <div className="flex flex-col md:h-[45vh] h-[20vh] md:w-[15vw] w-[20vw] rounded-sm">
                                    <img
                                        src={category.image[2] || "/ErrorImage.png"}
                                        alt={category.name}
                                        className="w-full object-cover h-[25vh] md:h-[40vh]"
                                        onError={(e) => e.target.src = '/ErrorImage.png'}
                                    />
                                    <p className={`text-center font-bold ${category.name.length > 16 ? 'md:text-xl text-[10px]' : 'text-xl'}`}>{category.name}</p>
                                </div>
                            </a>
                        ))
                    }
                </>
            )}
        </>
    )
}

export default CategoryCard