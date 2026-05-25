import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function CategoryUpdate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);

  const [category, setCategory] = useState(null);
  const [name, setName] = useState('');
  const [images, setImages] = useState([]);

  const currentImages = useMemo(() => category?.image || [], [category]);

  useEffect(() => {
    if (!categoryId) return;

    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_PORT}/api/categories/getbyId/${categoryId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to fetch category');
        }
        const data = await res.json();
        setCategory(data);
        setName(data?.name || '');
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!categoryId) return;

    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/categories/update/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update category');
      }
      const updated = await res.json();
      setCategory(updated);
      toast.success('Category updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateImages = async (e) => {
    e.preventDefault();
    if (!categoryId) return;
    if (!images.length) {
      toast.error('Please select images');
      return;
    }

    setImageSaving(true);
    try {
      const fd = new FormData();
      images.forEach((file) => fd.append('files', file));
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/categories/updateimg/${categoryId}`, {
        method: 'PUT',
        body: fd
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update images');
      }
      const updated = await res.json();
      setCategory(updated);
      setImages([]);
      toast.success('Category images updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setImageSaving(false);
    }
  };

  const handleRemoveImage = async (imageFilename) => {
    if (!categoryId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/categories/removeImage/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageFilename })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to remove image');
      }
      const updated = await res.json();
      setCategory(updated);
      toast.success('Image removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!categoryId) {
    return <div className="p-4">No category selected</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <h2 className="text-2xl font-serif italic text-foreground">Update Category</h2>
        <button
          type="button"
          className="bg-card border border-border text-muted-foreground px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors"
          onClick={() => navigate('/dashboard?tab=categories')}
        >
          Back
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <form onSubmit={handleUpdateName} className="bg-card p-6 rounded-sm shadow-sm border border-border space-y-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category Details</h3>
            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</label>
                <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rings"
                className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-12 py-4 rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:bg-gray-400"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Name'}
            </button>
          </form>

          <form onSubmit={handleUpdateImages} className="bg-card p-6 rounded-sm shadow-sm border border-border space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Images</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {currentImages.map((filename) => (
                <div key={filename} className="relative group">
                  <div className="w-full border rounded-sm overflow-hidden relative aspect-square hover:border-border">
                    <img
                      src={filename.includes('cloudinary.com') ? filename : `/${filename}`}
                      alt={filename}
                      className="w-full h-full object-contain bg-secondary"
                      onError={(e) => (e.target.src = '/ErrorImage.png')}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(filename)}
                    className="absolute -top-2 -right-2 bg-red-500 text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-4">
                <label className="border-2 border-dashed border-border rounded-sm w-32 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-secondary transition-all text-muted-foreground hover:text-foreground">
                  <svg className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center">Add Images</span>
                    <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []).slice(0, 3);
                        setImages(files);
                    }}
                    />
                </label>
                
                {images.length > 0 && (
                  <p className="text-xs text-muted-foreground">{images.length} new image(s) selected.</p>
                )}

                <button
                type="submit"
                className="bg-primary text-primary-foreground px-12 py-4 rounded-sm text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:bg-gray-400"
                disabled={imageSaving}
                >
                {imageSaving ? 'Updating...' : 'Update Images'}
                </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default CategoryUpdate;
