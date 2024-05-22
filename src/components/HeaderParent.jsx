// ParentComponent.js
import React, { useState } from 'react';
import Header from './Header';
import SearchResult from '../pages/SearchResult';
import { searchProductsFailure, searchProductsStart, searchProductsSuccess } from '../redux/slices/productSlice';
import { useDispatch } from 'react-redux';

function HeaderParent() {
    const [searchResult, setSearchResult] = useState([]);

    const dispatch = useDispatch();

    const handleSearch = async (query) => {
        try {
            dispatch(searchProductsStart())
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/search?query=${query}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) throw new Error("Failed to fetch")
            if (response.ok) {
                const data = await response.json()
                if (data) {
                    console.log(data)
                    dispatch(searchProductsSuccess(data))
                    setSearchResult(data)
                }
            }

        } catch (error) {
            dispatch(searchProductsFailure(error.message))
        }
    };

    return (
        <div>
            <Header onSearch={handleSearch} />
            <SearchResult searchResult={searchResult} />
        </div>
    );
}

export default HeaderParent;
