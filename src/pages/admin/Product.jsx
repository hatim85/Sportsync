import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProductsStart, getProductsFailure, getProductsSuccess, updateProductFailure, updateProductSuccess, updateProductStart, deleteProductStart, deleteProductSuccess, deleteProductFailure, getProductStart, getProductSuccess, getProductFailure } from '../../redux/slices/productSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Product() {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector(state => state.product);
    // const { products } = useSelector(state => state.product);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0);
    // console.log(products)
    const pageSize = 10

    useEffect(() => {
        fetchProducts(currentPage)
        return ()=>{
            dispatch(getProductsSuccess([]))
        }
    }, [currentPage]);

    useEffect(() => {
        if (products.length > 0) {
            setTotalProducts(products.length);
        }
    }, [products])

    const nextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        setCurrentPage(currentPage - 1);
    };

    const renderPagination = () => {
        const disableNext = currentPage * pageSize >= totalProducts;
        return (
            <div className='w-[100%] flex justify-between'>
                <button className='bg-blue-500 rounded-lg text-white px-3 py-3' onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                <span> Page {currentPage} </span>
                {/* disabled={disableNext} */}
                <button className='bg-blue-500 rounded-lg text-white px-3 py-3' onClick={nextPage} >Next</button>
            </div>
        );
    };
    const fetchProducts = async (page) => {
        try {
            dispatch(getProductsStart());
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/products/getAllProducts?page=${page}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to fetch products');
            }

            const fetchedProducts = await response.json();
            // console.log(fetchedProducts)
            dispatch(getProductsSuccess(fetchedProducts));
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
            })
            .catch(error => {
                dispatch(deleteProductFailure(error.message));
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ProductId</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* {console.log(products)} */}
                    {products && Object.values(products).map((product,key) => (
                        <tr key={key}>
                            {/* {console.log(product)} */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">{product._id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               {product.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {product.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <img src={product.image[0] ? product.image[0] : ''} alt="No Image" className="w-22 h-20" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(product._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {renderPagination()}
        </>
    );
}

export default Product;
