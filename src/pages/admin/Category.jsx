import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCategoryStart, getCategoryFailure, getCategorySuccess, deleteCategoryStart, getCategoryProductStart, getCategoryProductFailure, getCategoryProductSuccess, updateCategoryStart, updateCategorySuccess, updateCategoryFailure, deleteCategoryFailure, deleteCategorySuccess } from '../../redux/slices/categorySlice';

function Category() {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const categories = useSelector(state => state.category.categories);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCat, setTotalCat] = useState(0)
  const pageSize = 10;
  const [editedCategories, setEditedCategories] = useState({});

  useEffect(() => {
    fetchCategories(currentPage);
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (categories.length > 0) {
      setTotalCat(categories.length);
    }
  }, [categories, totalCat])

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const renderPagination = () => {
    const disableNext = currentPage * pageSize >= totalCat;
    return (
      <div className='w-[100%] flex justify-between'>
        <button className='bg-blue-500 rounded-lg text-white px-3 py-3' onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span> Page {currentPage} </span>
        {/* disabled={disableNext} */}
        <button className='bg-blue-500 rounded-lg text-white px-3 py-3' onClick={nextPage} disabled={disableNext}>Next</button>
      </div>
    );
  };

  const handleCategoryUpdate = async (categoryId, newName) => {
    setLoading(true);
    setError('');

    try {
      dispatch(updateCategoryStart());
      const response = await fetch(`${import.meta.env.VITE_PORT}/api/categories/update/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName })
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      // Dispatch action to update category in Redux state
      dispatch(updateCategorySuccess({ categoryId, newName }));
    } catch (error) {
      setError(error.message);
      dispatch(updateCategoryFailure(error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError('');

    try {
      dispatch(getCategoryStart());
      const response = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getAllcategory?page=${page}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch categories');
      }

      const fetchedCategories = await response.json();
      dispatch(getCategorySuccess(fetchedCategories));
    } catch (error) {
      setError(error.message);
      dispatch(getCategoryFailure(error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = (categoryId) => async (dispatch) => {
    dispatch(getCategoryProductStart());

    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getcategoryproducts/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        throw new Error('Failed to fetch category products');
      }

      const data = await res.json();
      dispatch(getCategoryProductSuccess(data));

    } catch (error) {
      dispatch(getCategoryProductFailure(error.message));
    }
  }

  const handleInputChange = async (e, category) => {
    const newName = e.target.value;
    const categoryId = category._id;
    setLoading(true);
    setError('');

    try {
      // Update category locally first
      const updatedCategories = categories.map(cat => cat._id === categoryId ? { ...cat, name: newName } : cat);
      // Assuming you have a function to update categories locally or dispatch an action to update in Redux
      // For Redux, you would dispatch an action to update the categories
      // For local state, you would use useState and update the state directly
      // updateCategoriesLocally(updatedCategories); 

      // Now make the API call to update category
      dispatch(updateCategoryStart());
      const response = await fetch(`${import.meta.env.VITE_PORT}/api/categories/update/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      // Dispatch action to update category in Redux state
      dispatch(updateCategorySuccess({ categoryId, newName }));
    } catch (error) {
      setError(error.message);
      dispatch(updateCategoryFailure(error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (categoryId) => {
    try {
      dispatch(deleteCategoryStart());
      const res = fetch(`${import.meta.env.VITE_PORT}/api/categories/delete/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        throw new Error('Failed to delete category');
      }
      dispatch(deleteCategorySuccess(categoryId));
    }
    catch (error) {
      dispatch(deleteCategoryFailure(error.message));
    }
  }
  return (
    <>
    {/* <li key={category._id}>
                    <input type="text" value={category.name} onChange={(e) => handleInputChange(e, category)} /><br />
                    <button onClick={() => handleCategoryUpdate(category._id, category.name)}>Save</button>
                    <button onClick={() => fetchCategoryProducts(category._id)}>See Products</button>
                    <button onClick={() => handleDelete(category._id)}>Delete</button>
                  </li> */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <ul>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CategoryId</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                </tr>
              </thead>
              {categories.map(category => (
                <>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">{category._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={editedCategories[category._id]?.editedName || category.name}
                          onChange={(e) => handleInputChange(e, category._id, 'editedName')}
                          className="w-full"
                        />
                      </td>
                    </tr>
                  </tbody>
                </>
              ))}
            </table >
          </ul>
        </>
      )}
    </>
  );
}
export default Category;
