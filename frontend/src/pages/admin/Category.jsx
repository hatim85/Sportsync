import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCategoryStart,
  getCategoryFailure,
  getCategorySuccess,
  deleteCategoryStart,
  deleteCategoryFailure,
  deleteCategorySuccess
} from '../../redux/slices/categorySlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Category() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const categories = useSelector(state => state.category.categories) || [];
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCat, setTotalCat] = useState(0);
  const pageSize = 10;

  const [formData, setFormData] = useState({
    name: '',
    images: []
  });

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  // Remove incorrect totalCat calculation from local array length
  /*
  useEffect(() => {
    if (categories.length > 0) {
      setTotalCat(categories.length);
    }
  }, [categories]);
  */

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const renderPagination = () => {
    const disableNext = currentPage * pageSize >= totalCat;
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

  const fetchCategories = async () => {
    setLoading(true);
    setError('');

    try {
      dispatch(getCategoryStart());
      const response = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getAllcategory?page=${currentPage}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch categories');
      }

      const data = await response.json();
      setTotalCat(data.totalCategories);
      dispatch(getCategorySuccess(data));
    } catch (error) {
      setError(error.message);
      dispatch(getCategoryFailure(error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      dispatch(deleteCategoryStart());
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/categories/delete/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete category');
      }
      dispatch(deleteCategorySuccess(categoryId));
      toast.success('Category deleted');
      fetchCategories(currentPage);
    }
    catch (error) {
      dispatch(deleteCategoryFailure(error.message));
      toast.error(error.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/categories/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create category');
      }
      const created = await res.json();
      if (formData.images.length > 0) {
        const fd = new FormData();
        formData.images.forEach(file => fd.append('files', file));
        const imgRes = await fetch(`${import.meta.env.VITE_PORT}/api/categories/updateimg/${created._id}`, {
          method: 'PUT',
          body: fd
        });
        if (!imgRes.ok) {
          const d = await imgRes.json();
          throw new Error(d.message || 'Failed to upload category images');
        }
      }
      toast.success('Category created');
      setFormData({ name: '', images: [] });
      fetchCategories(currentPage);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="space-y-6 p-4">
      <form onSubmit={handleCreate} className="bg-card p-4 rounded shadow space-y-4">
        <h2 className="text-lg font-semibold">Create Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Category name"
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Category Images (optional)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 4);
              setFormData(prev => ({ ...prev, images: files }));
            }}
          />
        </div>
        <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all">
          Create Category
        </button>
      </form>

      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-card rounded shadow">
        <thead className="bg-secondary">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-gray-200">
          {categories && categories.map((category, key) => {
            if (!category) return null;
            return (
            <tr key={key}>
              <td className="px-6 py-4 whitespace-nowrap">
                {category.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {category.image && category.image[0] && (
                  <img src={category.image?.[0] ? (category.image[0].includes('cloudinary.com') ? category.image[0] : `/${category.image[0].split(/[\\/]/).pop()}`) : '/ErrorImage.png'} alt={category.name} className="w-16 h-16 object-contain bg-secondary border border-border p-1" />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-3">
                  <button className='text-red-500' onClick={() => handleDelete(category._id)}>Delete</button>
                  <button
                    className='text-blue-600'
                    onClick={() => navigate(`/dashboard?tab=category-update&categoryId=${category._id}`)}
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

export default Category;
