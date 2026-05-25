import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { searchProductsFailure, searchProductsStart, searchProductsSuccess } from '../redux/slices/searchSlice';
import { trackCategoryVisit } from '../redux/slices/trendingSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { sortByNewest, getProductTimestamp } from '../utils/sortProducts';

const PAGE_SIZE = 12;

function SearchPage() {
    const dispatch = useDispatch();
    const location = useLocation();
    const searchResults = useSelector((state) => state.search.searchResults);
    const loading = useSelector((state) => state.search.loading);
    const [sort, setSort] = useState('newest');
    const [selectedPriceFilters, setSelectedPriceFilters] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (categoryFilter) {
            dispatch(trackCategoryVisit(categoryFilter));
        }
    }, [categoryFilter, dispatch]);

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');
    const sortFromUrl = searchParams.get('sort');

    useEffect(() => {
        if (sortFromUrl && ['newest', 'oldest', 'price_asc', 'price_desc'].includes(sortFromUrl)) {
            setSort(sortFromUrl);
        }
    }, [sortFromUrl]);

    useEffect(() => {
        setPage(1);
    }, [query, sort, categoryFilter, selectedPriceFilters]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname, location.search, page]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            dispatch(searchProductsStart());
            try {
                let response;
                const trimmedQuery = query?.trim();
                if (!trimmedQuery) {
                    response = await fetch(
                        `${import.meta.env.VITE_PORT}/api/products/getAllproducts?sort=${sort}&page=1&limit=200`
                    );
                } else {
                    response = await fetch(
                        `${import.meta.env.VITE_PORT}/api/products/search/${encodeURIComponent(trimmedQuery)}?sort=${sort}`
                    );
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }
                const data = await response.json();
                const results = Array.isArray(data) ? data : (data.products || []);
                dispatch(searchProductsSuccess(results));
            } catch (error) {
                console.error('Error in fetching results: ', error);
                dispatch(searchProductsFailure(error.message));
            }
        };

        fetchSearchResults();
    }, [query, sort, dispatch]);

    const handleFilterChange = (filter) => {
        if (filter.type === 'category') {
            if (filter.id === 'all') {
                setCategoryFilter(null);
            } else {
                setCategoryFilter((prev) =>
                    String(prev) === String(filter.id) ? null : filter.id
                );
            }
        } else if (filter.type === 'price') {
            setSelectedPriceFilters(prev => {
                const exists = prev.find(f => f.id === filter.id);
                if (exists) return prev.filter(f => f.id !== filter.id);
                return [...prev, filter];
            });
        }
    };

    const handleClearAll = () => {
        setSelectedPriceFilters([]);
        setCategoryFilter(null);
    };

    const filteredResults = useMemo(() => {
        let results = searchResults || [];

        if (categoryFilter) {
            results = results.filter(p => p.categoryId?._id === categoryFilter || p.categoryId === categoryFilter);
        }

        if (selectedPriceFilters.length > 0) {
            results = results.filter(product => {
                return selectedPriceFilters.some(range => {
                    const price = Number(product.price);
                    return price >= range.min && price <= range.max;
                });
            });
        }

        if (sort === 'newest') {
            return sortByNewest(results);
        }
        if (sort === 'oldest') {
            return [...results].sort((a, b) => getProductTimestamp(a) - getProductTimestamp(b));
        }

        return results;
    }, [searchResults, categoryFilter, selectedPriceFilters, sort]);

    const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));

    const paginatedResults = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredResults.slice(start, start + PAGE_SIZE);
    }, [filteredResults, page]);

    const rangeStart = filteredResults.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const rangeEnd = Math.min(page * PAGE_SIZE, filteredResults.length);

    const selectedFilters = useMemo(() => {
        const filters = [...selectedPriceFilters];
        if (categoryFilter) {
            const match = searchResults?.find(
                (p) => p.categoryId?._id === categoryFilter || p.categoryId === categoryFilter
            );
            const catName =
                match?.categoryId?.name ||
                match?.categoryName ||
                'Category';
            filters.push({ id: categoryFilter, name: catName, type: 'category' });
        } else {
            filters.push({ id: 'all', name: 'All Collection', type: 'category' });
        }
        return filters;
    }, [selectedPriceFilters, categoryFilter, searchResults]);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-12">
                    <div className="w-full md:w-72 lg:w-80 flex-shrink-0 min-w-0 md:min-w-[280px]">
                        <FilterSidebar
                            selectedFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                            onClearAll={handleClearAll}
                            currentCount={filteredResults.length}
                        />
                    </div>

                    <div className="flex-grow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase">
                                    {query ? `Search: ${query}` : 'All Products'}
                                </h1>
                                <p className="text-xs text-muted-foreground mt-2 tracking-widest uppercase font-bold">
                                    {filteredResults.length} Results Found
                                    {filteredResults.length > 0 && (
                                        <span className="text-muted-foreground/80">
                                            {' '}
                                            · Showing {rangeStart}–{rangeEnd}
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground">Sort By:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="border-b border-border text-xs py-2 px-1 focus:outline-none focus:border-primary bg-transparent uppercase tracking-widest font-medium"
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <>
                                {paginatedResults.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                                            {paginatedResults.map((product) => (
                                                <ProductCard key={product._id} product={product} />
                                            ))}
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-14 pt-8 border-t border-border">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    Page {page} of {totalPages}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                        disabled={page <= 1}
                                                        className="px-5 py-2.5 border border-border rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                        disabled={page >= totalPages}
                                                        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-20">
                                        <p className="text-muted-foreground uppercase tracking-widest text-sm font-bold">
                                            {query?.trim()
                                                ? `No products found for "${query.trim()}"`
                                                : selectedPriceFilters.length > 0 || categoryFilter
                                                    ? 'No products match your filters'
                                                    : 'No products available yet'}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default SearchPage;
