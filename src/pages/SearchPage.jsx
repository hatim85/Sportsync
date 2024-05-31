import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { searchProductsFailure, searchProductsStart, searchProductsSuccess } from '../redux/slices/searchSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchResultCard from '../components/SearchResultCard';

function SearchPage() {
    const dispatch = useDispatch();
    const location = useLocation();
    const searchResults = useSelector((state) => state.search.searchResults)
    // const [searchResults,setSearchResults]=useState([])
    useEffect(() => {
        const fetchSearchResults = async () => {
            dispatch(searchProductsStart())
            try {
                const searchParams = new URLSearchParams(location.search);
                const query = searchParams.get('q');
                if (query) {
                    const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/search/${query}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch search results');
                    }
                    const data = await response.json();
                    dispatch(searchProductsSuccess(data));
                    // setSearchResults(data.results);
                }
            } catch (error) {
                console.error('Error in fetching results: ', error);
                dispatch(searchProductsFailure(error.message));
            }
        };

        fetchSearchResults();
    }, [location.search, dispatch]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            {/* <div>
            <ul>
                {searchResults && searchResults.map((result, index) => (
                    <li key={index}>
                        <h1>{result.name}</h1>
                        <p>Description:{result.description}</p>
                        <p>${result.price}</p>
                    </li>
                ))}
            </ul>
        </div> */}
            <div className='flex flex-wrap min-h-screen'>
                <SearchResultCard searchResults={searchResults} />
            </div>
            <Footer/>
        </div>
    );
}

export default SearchPage;
