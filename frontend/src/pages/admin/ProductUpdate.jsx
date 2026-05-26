import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function ProductUpdate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    coverImageIndex: 0
  });

  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  const images = useMemo(() => product?.image || [], [product]);

  useEffect(() => {
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

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_PORT}/api/products/getbyId/${productId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to fetch product');
        }
        const data = await res.json();
        setProduct(data);
        setForm({
          name: data?.name || '',
          description: data?.description || '',
          price: String(data?.price ?? ''),
          stock: String(data?.stock ?? ''),
          categoryId: data?.categoryId?.name || data?.categoryName || '',
          coverImageIndex: Number(data?.coverImageIndex ?? 0)
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) return;

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('stock', form.stock);
    fd.append('categoryId', form.categoryId);
    fd.append('coverImageIndex', form.coverImageIndex);
    
    // For backends that handle removed images as a list of filenames
    if (removedImages.length > 0) {
      fd.append('removedImages', JSON.stringify(removedImages));
    }

    // Append new files
    newImages.forEach(file => fd.append('images', file));

    setSaving(true);
    try {
      // Logic for updating images might vary by backend, 
      // but assuming the create/update endpoint handles FormData or we need separate calls.
      // Given the previous code used JSON, I'll stick to a mixed approach or standard FormData if supported.
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/products/update/${productId}`, {
        method: 'PUT',
        body: fd // Switching to FormData for image support
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update product');
      }
      toast.success('Product updated');
      navigate('/dashboard?tab=products');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveExisting = (filename) => {
    setRemovedImages(prev => [...prev, filename]);
    setProduct(prev => ({
      ...prev,
      image: prev.image.filter(img => img !== filename)
    }));
  };

  const handleAddNewImages = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages(prev => [...prev, ...files]);
  };

  const handleRemoveNew = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!productId) {
    return <div className="p-4">No product selected</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <h2 className="text-2xl font-serif italic text-foreground">Update Product</h2>
        <button
          type="button"
          className="bg-card border border-border text-muted-foreground px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors"
          onClick={() => navigate('/dashboard?tab=products')}
        >
          Back
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="bg-card p-6 rounded-sm shadow-sm border border-border space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Images / Cover</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Existing Images */}
              {images.map((filename, idx) => (
                <div key={filename} className="relative group">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, coverImageIndex: idx }))}
                    className={`w-full border rounded-sm overflow-hidden relative aspect-square transition-all ${Number(form.coverImageIndex) === idx ? 'ring-2 ring-black' : 'hover:border-border'}`}
                  >
                    <img
                      src={filename.includes('cloudinary.com') ? filename : `/${filename.split(/[\\/]/).pop()}`}
                      alt={`img-${idx}`}
                      className="w-full h-full object-contain bg-secondary"
                      onError={(e) => (e.target.src = '/ErrorImage.png')}
                    />
                    {Number(form.coverImageIndex) === idx && (
                      <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[8px] font-bold uppercase px-2 py-1 tracking-tight">
                        Cover
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(filename)}
                    className="absolute -top-2 -right-2 bg-red-500 text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* New Selected Images */}
              {newImages.map((file, idx) => (
                <div key={idx} className="relative group">
                  <div className="w-full border rounded-sm overflow-hidden aspect-square bg-blue-50/30 border-blue-100">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="new"
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute bottom-2 left-2 bg-blue-600 text-primary-foreground text-[8px] font-bold uppercase px-2 py-1">New</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNew(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add Button Placeholder */}
              {(images.length + newImages.length) < 4 && (
                <label className="border-2 border-dashed border-border rounded-sm aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-secondary transition-all text-muted-foreground hover:text-foreground">
                  <svg className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add Image</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddNewImages} />
                </label>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card p-6 rounded-sm shadow-sm border border-border space-y-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Sterling Silver Necklace"
                  className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Base Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Status</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                  placeholder="Available quantity"
                  className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                <input
                  list="categories-list-update"
                  value={form.categoryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  placeholder="Select or type category"
                  className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                />
                <datalist id="categories-list-update">
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Write a detailed description..."
                rows={4}
                className="w-full border border-border p-4 outline-none focus:border-primary transition-colors bg-secondary/30 text-sm leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="bg-primary text-primary-foreground px-12 py-4 rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:bg-gray-400"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Save Product Changes'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ProductUpdate;
