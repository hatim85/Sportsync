import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getProductsStart,
    getProductsFailure,
    getProductsSuccess,
    deleteProductStart,
    deleteProductSuccess,
    deleteProductFailure
} from '../../redux/slices/productSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Product() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading, error } = useSelector(state => state.product);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const pageSize = 10;

    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    const [makingCharge, setMakingCharge] = useState('');
    const [deliveryCharge, setDeliveryCharge] = useState('');
    const [makingChargeLoading, setMakingChargeLoading] = useState(false);
    const [makingChargeSaving, setMakingChargeSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        images: [],
        coverImageIndex: 0
    });

    useEffect(() => {
        if (!selectedCategoryId) {
            fetchProducts(currentPage);
        }
        fetchCategories();
        return () => {
            dispatch(getProductsSuccess([]));
        };
    }, [currentPage, selectedCategoryId]);

    useEffect(() => {
        fetchMakingCharge();
    }, []);

    // Remove incorrect totalProducts calculation from local array length
    /*
    useEffect(() => {
        if (Array.isArray(products)) {
            setTotalProducts(products.length);
        }
    }, [products]);
    */

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getAllcategory`);
            if (!res.ok) throw new Error('Failed to load categories');
            const data = await res.json();
            setCategories(data || []);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const fetchProductsByCategory = async (categoryId) => {
        try {
            dispatch(getProductsStart());
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/getProductsByCategory/${categoryId}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to fetch products');
            }

            const data = await response.json();
            dispatch(getProductsSuccess(data?.products || []));
        } catch (error) {
            dispatch(getProductsFailure(error.message));
        }
    };

    const fetchMakingCharge = async () => {
        setMakingChargeLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/settings/pricing`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to load pricing settings');
            }
            const data = await res.json();
            setMakingCharge(String(data?.makingCharge ?? 0));
            setDeliveryCharge(String(data?.deliveryCharge ?? 0));
        } catch (err) {
            toast.error(err.message);
        } finally {
            setMakingChargeLoading(false);
        }
    };

    const handleSaveMakingCharge = async (e) => {
        e.preventDefault();
        const value = Number(makingCharge);
        if (Number.isNaN(value) || value < 0) {
            toast.error('Making charge must be a number >= 0');
            return;
        }

        setMakingChargeSaving(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/settings/pricing`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ makingCharge: value, deliveryCharge: Number(deliveryCharge) || 0 })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to update making charge');
            }
            const data = await res.json();
            setMakingCharge(String(data?.makingCharge ?? value));
            setDeliveryCharge(String(data?.deliveryCharge ?? deliveryCharge));
            toast.success('Making charge updated');
            fetchProducts(currentPage);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setMakingChargeSaving(false);
        }
    };

    const handleSaveDeliveryCharge = async (e) => {
        e.preventDefault();
        const value = Number(deliveryCharge);
        if (Number.isNaN(value) || value < 0) {
            toast.error('Delivery charge must be a number >= 0');
            return;
        }

        setMakingChargeSaving(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/settings/pricing`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ makingCharge: Number(makingCharge) || 0, deliveryCharge: value })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to update delivery charge');
            }
            const data = await res.json();
            setMakingCharge(String(data?.makingCharge ?? makingCharge));
            setDeliveryCharge(String(data?.deliveryCharge ?? value));
            toast.success('Delivery charge updated');
            fetchProducts(currentPage);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setMakingChargeSaving(false);
        }
    };

    const nextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        setCurrentPage(currentPage - 1);
    };

    const renderPagination = () => {
        if (selectedCategoryId) return null;
        const disableNext = !Array.isArray(products) || products.length < pageSize;
        return (
            <div className='w-[100%] flex justify-between items-center my-8 pt-6 border-t border-border'>
                <button 
                  className='bg-card border border-border text-foreground px-6 py-2 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-secondary transition-colors disabled:opacity-50' 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase"> Page {currentPage} </span>
                <button 
                  className='bg-primary text-primary-foreground px-6 py-2 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-50' 
                  onClick={nextPage} 
                  disabled={disableNext}
                >
                  Next
                </button>
            </div>
        );
    };

    const fetchProducts = async (page) => {
        try {
            dispatch(getProductsStart());
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/getAllproducts?page=${page}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch products');
            }

            const data = await response.json();
            setTotalProducts(data.totalProducts);
            dispatch(getProductsSuccess(data));
        } catch (error) {
            dispatch(getProductsFailure(error.message));
        }
    };

    const handleDelete = (productId) => {
        dispatch(deleteProductStart());

        fetch(`${import.meta.env.VITE_PORT}/api/products/delete/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete product');
                }
                dispatch(deleteProductSuccess(productId));
                toast.success('Product deleted successfully');
                fetchProducts(currentPage);
            })
            .catch(error => {
                dispatch(deleteProductFailure(error.message));
                toast.error(error.message);
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const truncateText = (text, maxLen = 60) => {
        const value = String(text || '');
        if (value.length <= maxLen) return value;
        return `${value.slice(0, maxLen)}...`;
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []).slice(0, 4);
        setFormData(prev => ({ ...prev, images: files, coverImageIndex: 0 }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
            toast.error('Name, description, price, and category are required');
            return;
        }

        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('description', formData.description);
        fd.append('price', formData.price);
        if (formData.stock) fd.append('stock', formData.stock);
        fd.append('categoryId', formData.categoryId);
        fd.append('coverImageIndex', formData.coverImageIndex);
        formData.images.forEach(file => fd.append('images', file));

        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/products/create`, {
                method: 'POST',
                body: fd
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to create product');
            }
            toast.success('Product created');
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                categoryId: '',
                images: [],
                coverImageIndex: 0
            });
            fetchProducts(currentPage);
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-6">
            {/* <div className="bg-card p-4 rounded shadow space-y-4">
                <h2 className="text-lg font-semibold">Pricing Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Making/Labour Charge (₹)</label>
                        <input
                            name="makingCharge"
                            type="number"
                            min="0"
                            value={makingCharge}
                            onChange={(e) => setMakingCharge(e.target.value)}
                            placeholder="0"
                            className="border rounded p-2 w-full"
                            disabled={makingChargeLoading || makingChargeSaving}
                        />
                        <button
                            formNoValidate
                            onClick={handleSaveMakingCharge}
                            className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors"
                            disabled={makingChargeLoading || makingChargeSaving}
                        >
                            {makingChargeSaving ? 'Saving...' : 'Update Making Charge'}
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Delivery Charge (₹)</label>
                        <input
                            name="deliveryCharge"
                            type="number"
                            min="0"
                            value={deliveryCharge}
                            onChange={(e) => setDeliveryCharge(e.target.value)}
                            placeholder="0"
                            className="border rounded p-2 w-full"
                            disabled={makingChargeLoading || makingChargeSaving}
                        />
                        <button
                            formNoValidate
                            onClick={handleSaveDeliveryCharge}
                            className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors"
                            disabled={makingChargeLoading || makingChargeSaving}
                        >
                            {makingChargeSaving ? 'Saving...' : 'Update Delivery Charge'}
                        </button>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    Current: Making ₹{Number(makingCharge || 0)} | Delivery ₹{Number(deliveryCharge || 0)} {Number(deliveryCharge || 0) === 0 ? '(FREE)' : ''}
                </div>
            </div> */}

            <form onSubmit={handleCreate} className="bg-card p-4 rounded shadow space-y-4">
                <h2 className="text-lg font-semibold">Create Product</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Name"
                        className="border rounded p-2"
                    />
                    <input
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Base Price"
                        className="border rounded p-2"
                    />
                    <input
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="Stock (optional)"
                        className="border rounded p-2"
                    />
                    <div className="flex flex-col relative">
                        <input
                            list="categories-list"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            placeholder="Select or type category"
                            className="border rounded p-2 w-full"
                        />
                        <datalist id="categories-list">
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </datalist>
                    </div>
                </div>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="border rounded p-2 w-full"
                />
                <div>
                    <label className="block mb-2 font-medium">Images (up to 4)</label>
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} />
                    <div className="text-sm text-muted-foreground mt-1">Only first 4 files are used.</div>
                    {formData.images.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                            {formData.images.map((file, idx) => (
                                <button
                                    type="button"
                                    key={idx}
                                    onClick={() => setFormData(prev => ({ ...prev, coverImageIndex: idx }))}
                                    className={`border rounded overflow-hidden relative ${formData.coverImageIndex === idx ? 'ring-2 ring-black' : ''}`}
                                >
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`img-${idx}`}
                                        className="w-full h-20 object-cover"
                                    />
                                    {formData.coverImageIndex === idx && (
                                        <span className="absolute top-1 left-1 bg-blue-600 text-primary-foreground text-xs px-1 rounded">
                                            Cover
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all">Create Product</button>
            </form>

            <div className="bg-card p-4 rounded shadow space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h2 className="text-lg font-semibold">Products</h2>
                    <div className="flex gap-2 items-center">
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => {
                                const id = e.target.value;
                                setSelectedCategoryId(id);
                                if (!id) {
                                    setCurrentPage(1);
                                    fetchProducts(1);
                                } else {
                                    fetchProductsByCategory(id);
                                }
                            }}
                            className="border rounded p-2"
                        >
                            <option value="">All categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        {selectedCategoryId && (
                            <button
                                type="button"
                                className="bg-gray-200 px-3 py-2 rounded"
                                onClick={() => {
                                    setSelectedCategoryId('');
                                    setCurrentPage(1);
                                    fetchProducts(1);
                                }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-secondary">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Base Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-gray-200">
                    {products && Object.values(products).map((product, key) => {
                        if (!product) return null;
                        return (
                        <tr key={key}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {product.categoryName || product?.categoryId?.name || ''}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               {truncateText(product.description, 60)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {product.basePrice ?? product.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {(() => {
                                    const coverIdx = product.coverImageIndex ?? 0;
                                    const src = product.image && product.image[coverIdx] ? (product.image[coverIdx].includes('cloudinary.com') ? product.image[coverIdx] : `/${product.image[coverIdx].split(/[\\/]/).pop()}`) : '';
                                    return <img src={src} alt="Product" className="w-20 h-20 object-contain bg-secondary border border-border p-1" />;
                                })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-3">
                                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(product._id)}>Delete</button>
                                    <button
                                        className="text-blue-600 hover:text-blue-900"
                                        onClick={() => navigate(`/dashboard?tab=product-update&productId=${product._id}`)}
                                    >
                                        Update
                                    </button>
                                </div>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
                </table>
            </div>
            {renderPagination()}
        </div>
    );
}

export default Product;
