import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { sortByNewest } from '../../utils/sortProducts';

function ProductListPage() {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [sort, setSort] = useState('newest');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/getProductsByCategory/${categoryId}?sort=${sort}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products')
                }
                const data = await response.json();
                const list = data.products || [];
                setProducts(sort === 'newest' ? sortByNewest(list) : list);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, sort]);

    return (
        <div className="bg-background min-h-screen text-foreground font-sans">
            <Header />
            <div className="container mx-auto mt-8 px-4 py-8">
                <div className="flex justify-between items-center mb-8 border-b-2 border-border pb-4">
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter">Products in this Category</h1>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="border-2 border-border rounded px-3 py-2 bg-secondary text-foreground font-black text-xs uppercase tracking-widest focus:outline-none focus:border-primary"
                    >
                        <option value="newest">Newest Arrivals</option>
                        <option value="oldest">Oldest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-primary"></div>
                    </div>
                )}
                {!loading && products.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground font-black uppercase tracking-widest">No products available in this category</div>
                )}
                <div className='flex flex-wrap gap-8 justify-center'>
                    {products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ProductListPage;
