import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import { searchProductsFailure, searchProductsStart, searchProductsSuccess } from '../redux/slices/searchSlice';
import { trackCategoryVisit } from '../redux/slices/trendingSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import { sortByNewest, getProductTimestamp } from '../utils/sortProducts';

const PAGE_SIZE = 12;
const BULK_LIMIT = 500;

function SearchPage() {
    const dispatch = useDispatch();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchResults = useSelector((state) => state.search.searchResults);
    const loading = useSelector((state) => state.search.loading);
    const [sort, setSort] = useState('newest');
    const [selectedPriceFilters, setSelectedPriceFilters] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [totalProducts, setTotalProducts] = useState(0);

    const query = searchParams.get('q');
    const sortFromUrl = searchParams.get('sort');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

    const hasClientFilters =
        selectedPriceFilters.length > 0 || Boolean(categoryFilter);

    const setPage = useCallback(
        (nextPage) => {
            const p = Math.max(1, nextPage);
            const params = new URLSearchParams(searchParams);
            if (p <= 1) params.delete('page');
            else params.set('page', String(p));
            setSearchParams(params, { replace: true });
        },
        [searchParams, setSearchParams]
    );

    useEffect(() => {
        if (categoryFilter) {
            dispatch(trackCategoryVisit(categoryFilter));
        }
    }, [categoryFilter, dispatch]);

    useEffect(() => {
        if (sortFromUrl && ['newest', 'oldest', 'price_asc', 'price_desc'].includes(sortFromUrl)) {
            setSort(sortFromUrl);
        }
    }, [sortFromUrl]);

    useEffect(() => {
        if (!searchParams.get('page')) return;
        const params = new URLSearchParams(searchParams);
        params.delete('page');
        setSearchParams(params, { replace: true });
    }, [query, sort, categoryFilter, selectedPriceFilters]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname, location.search, page]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            dispatch(searchProductsStart());
            try {
                const trimmedQuery = query?.trim();
                const limit = hasClientFilters ? BULK_LIMIT : PAGE_SIZE;
                const fetchPage = hasClientFilters ? 1 : page;

                let url;
                if (!trimmedQuery) {
                    url = `${import.meta.env.VITE_PORT}/api/products/getAllproducts?sort=${sort}&page=${fetchPage}&limit=${limit}`;
                } else {
                    url = `${import.meta.env.VITE_PORT}/api/products/search/${encodeURIComponent(trimmedQuery)}?sort=${sort}&page=${fetchPage}&limit=${limit}`;
                }

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }
                const data = await response.json();
                const results = Array.isArray(data) ? data : (data.products || []);
                const total = Array.isArray(data)
                    ? data.length
                    : (data.totalProducts ?? results.length);

                dispatch(searchProductsSuccess(results));
                setTotalProducts(total);
            } catch (error) {
                console.error('Error in fetching results: ', error);
                dispatch(searchProductsFailure(error.message));
                setTotalProducts(0);
            }
        };

        fetchSearchResults();
    }, [query, sort, page, hasClientFilters, dispatch]);

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
            setSelectedPriceFilters((prev) => {
                const exists = prev.find((f) => f.id === filter.id);
                if (exists) return prev.filter((f) => f.id !== filter.id);
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
            results = results.filter(
                (p) =>
                    p.categoryId?._id === categoryFilter ||
                    p.categoryId === categoryFilter
            );
        }

        if (selectedPriceFilters.length > 0) {
            results = results.filter((product) =>
                selectedPriceFilters.some((range) => {
                    const price = Number(product.price);
                    return price >= range.min && price <= range.max;
                })
            );
        }

        if (sort === 'newest') {
            return sortByNewest(results);
        }
        if (sort === 'oldest') {
            return [...results].sort(
                (a, b) => getProductTimestamp(a) - getProductTimestamp(b)
            );
        }

        return results;
    }, [searchResults, categoryFilter, selectedPriceFilters, sort]);

    const resultCount = hasClientFilters ? filteredResults.length : totalProducts;
    const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));

    const paginatedResults = useMemo(() => {
        if (!hasClientFilters) {
            return filteredResults;
        }
        const start = (page - 1) * PAGE_SIZE;
        return filteredResults.slice(start, start + PAGE_SIZE);
    }, [filteredResults, page, hasClientFilters]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages, setPage]);

    const rangeStart = resultCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const rangeEnd = Math.min(page * PAGE_SIZE, resultCount);

    const selectedFilters = useMemo(() => {
        const filters = [...selectedPriceFilters];
        if (categoryFilter) {
            const match = searchResults?.find(
                (p) =>
                    p.categoryId?._id === categoryFilter ||
                    p.categoryId === categoryFilter
            );
            const catName =
                match?.categoryId?.name || match?.categoryName || 'Category';
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
                            currentCount={resultCount}
                        />
                    </div>

                    <div className="flex-grow min-w-0">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase">
                                    {query ? `Search: ${query}` : 'All Products'}
                                </h1>
                                <p className="text-xs text-muted-foreground mt-2 tracking-widest uppercase font-bold">
                                    {resultCount} Results Found
                                    {resultCount > 0 && (
                                        <span className="text-muted-foreground/80">
                                            {' '}
                                            · Showing {rangeStart}–{rangeEnd}
                                        </span>
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground">
                                    Sort By:
                                </span>
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
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                        ) : paginatedResults.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                                    {paginatedResults.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
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
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default SearchPage;
