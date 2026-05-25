import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import {
  addCartItemFailure,
  addCartItemStart,
  addToCartGuest,
  fetchCartItemsSuccess,
} from '../redux/slices/cartSlice';
import { FaHeart, FaRegHeart, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProductCard = ({ product, showWishlistButton = true }) => {
  const images = product?.image || [];
  const [currentImageIndex, setCurrentImageIndex] = useState(product?.coverImageIndex ?? 0);
  const [adding, setAdding] = useState(false);
  const dispatch = useDispatch();
  const { wishlistIds } = useSelector((state) => state.wishlist);
  const { currentUser } = useSelector((state) => state.user);

  const isWishlisted = wishlistIds?.includes(product._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please login to add to wishlist');
      return;
    }
    if (isWishlisted) {
      dispatch(removeFromWishlist({ productId: product._id, userId: currentUser._id }));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist({ productId: product._id, userId: currentUser._id }));
      toast.success('Added to wishlist');
    }
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentUser?.userType === 'admin') {
      toast.error('Admins cannot add items to the cart');
      return;
    }

    const sizes = product?.sizes || [];
    const colors = product?.colors || [];
    const effectiveSize = sizes.length > 0 ? sizes[0] : null;
    const effectiveColor = colors.length > 0 ? colors[0] : null;

    setAdding(true);

    if (!currentUser) {
      dispatch(addToCartGuest({ product, size: effectiveSize, color: effectiveColor }));
      toast.success('Added to cart');
      setAdding(false);
      return;
    }

    try {
      dispatch(addCartItemStart());
      const res = await fetch(
        `${import.meta.env.VITE_PORT}/api/cart/addToCart/${product._id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser._id,
            size: effectiveSize,
            color: effectiveColor,
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to add to cart');
      const cartRes = await fetch(
        `${import.meta.env.VITE_PORT}/api/cart/getcart/${currentUser._id}`
      );
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        dispatch(fetchCartItemsSuccess(Array.isArray(cartData) ? cartData : []));
      }
      toast.success('Added to cart');
    } catch {
      dispatch(addCartItemFailure('Failed to add to cart'));
      toast.error('Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  const currentImage = images[currentImageIndex] || images[0];
  const imagePath = currentImage
    ? currentImage.includes('cloudinary.com')
      ? currentImage
      : `/${currentImage.split(/[\\/]/).pop()}`
    : '/ErrorImage.png';

  return (
    <div className="group relative bg-card transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full border-2 border-border hover:border-primary rounded">
      <div className="relative aspect-square bg-secondary overflow-hidden border-b-2 border-border group-hover:border-primary transition-colors">
        <Link to={`/products/${product._id}`} className="block absolute inset-0 z-0">
          <img
            src={imagePath}
            alt={product.name}
            className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = '/ErrorImage.png';
            }}
          />
        </Link>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={adding}
          className="absolute inset-x-0 bottom-0 z-30 w-full bg-primary text-primary-foreground text-[10px] tracking-[0.15em] font-black py-3 text-center uppercase shadow-lg disabled:opacity-60 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300"
        >
          {adding ? 'Adding...' : 'Quick Add'}
        </button>

        {showWishlistButton && (
          <button
            type="button"
            onClick={handleWishlistClick}
            className="absolute top-4 right-4 z-20 p-2 bg-background/80 backdrop-blur-sm rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-background border border-border shadow-sm"
          >
            {isWishlisted ? (
              <FaHeart className="h-4 w-4 text-primary" />
            ) : (
              <FaRegHeart className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>
        )}

        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background p-1.5 shadow-sm border border-border z-20 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:text-primary"
          >
            <FaChevronRight className="h-3 w-3 text-foreground" />
          </button>
        )}
      </div>

      <Link to={`/products/${product._id}`} className="block p-4 md:p-5 space-y-3 bg-card flex-grow">
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.2em] text-primary uppercase font-bold">
            {product.categoryName || product.categoryId?.name || 'Performance Gear'}
          </p>
          <h3 className="text-sm md:text-base font-black tracking-tight text-card-foreground leading-tight line-clamp-2 min-h-[2.5rem] uppercase">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <span className="text-lg md:text-xl font-black text-card-foreground tracking-tighter">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-muted-foreground line-through tracking-wider font-bold">
            ₹{Number(product.price * 1.2).toLocaleString('en-IN')}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
