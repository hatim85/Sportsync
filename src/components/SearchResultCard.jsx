import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function SearchResultCard({ searchResults }) {
    const loading = useSelector((state) => state.search.loading);
    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {searchResults && searchResults.length > 0 ? (
                        searchResults.map((result, index) => (
                            <div key={index} className="border flex-shrink-0 h-[42vh] m-[10px] w-[40vw] md:h-[50vh] sm:w-[15vw] border-gray-500 bg-gray-300 rounded-md shadow-md overflow-hidden">
                                <Link to={`/products/${result._id}`} className="block" style={{ textDecoration: 'none' }}>
                                    <div className="flex justify-center items-center">
                                        <img
                                            src={result.image[0] || '/ErrorImage.png'}
                                            onError={(e) => e.target.src = '/ErrorImage.png'}
                                            className="object-cover object-center h-full w-full"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h2 className={`font-bold ${result.name.length > 16 ? 'sm:text-sm md:text-xl' : 'md:text-xl'}`}>{result.name}</h2>
                                        <p className={`text-gray-700 ${result.description.length > 10 ? 'text-sm' : 'mt-2 md:text-xl sm:text-sm'}`}>{result.description.length > 20 ? result.description.substring(0, 10) + '...' : result.description}</p>
                                        <h2 className="md:text-lg text-sm font-semibold">${result.price} <del className='text-gray-500 text-sm'>${result.price + 200}</del></h2>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div>No products found</div>
                    )}
                </>
            )}
        </>
    );
}

export default SearchResultCard;
