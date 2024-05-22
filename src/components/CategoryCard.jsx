import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';

function CategoryCard() {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        const fetchCategories = async () => {
            let page = 1;
            let fetchedCategories = [];

            // Fetch categories until there are no more left
            while (true) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getAllCategory?page=${page}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    const newCategories = await response.json();

                    // If no new categories fetched, break the loop
                    if (newCategories.length === 0) {
                        break;
                    }

                    fetchedCategories = fetchedCategories.concat(newCategories);
                    page++;
                } catch (error) {
                    console.error('Error fetching categories:', error);
                    break; // Break the loop in case of error
                }
            }

            setCategories(fetchedCategories);
        };

        fetchCategories();
    }, []);
    return (
        <>
            {categories.length === 0 ? (
                <p>Loading...</p>
            ) : (
                categories.map(category => (
                    <a key={category._id} href={`/categories/${category._id}`} className="m-auto">
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
            )}
        </>
    )
}

export default CategoryCard