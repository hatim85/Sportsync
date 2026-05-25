const fs = require('fs');
const path = '/Users/hatim/Projects/Sportsync-Updated/Sportsync/frontend/src/pages/product/ProductDescription.jsx';

let content = fs.readFileSync(path, 'utf8');

// 1. States removal
content = content.replace(
    /const \[selectedMetal.*?const isWishlisted = \(id\) => wishlistIds\?\.includes\(id\);/s,
    `const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [openDetail, setOpenDetail] = useState('details');
    const [similarProducts, setSimilarProducts] = useState([]);
    const [similarLoading, setSimilarLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('recommended');
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const isWishlisted = (id) => wishlistIds?.includes(id);`
);

// 2. Sizes/Colors extraction removal
content = content.replace(
    /const metalOptions = \[.*?\}\}, \[product, isRing, isBangle\]\);/s,
    `const sizes = product?.sizes || [];
    const colors = product?.colors || [];

    useEffect(() => {
        if (product) {
            if (sizes.length > 0) setSelectedSize(sizes[0]);
            else setSelectedSize('');
            if (colors.length > 0) setSelectedColor(colors[0]);
            else setSelectedColor('');
        }
    }, [product]);`
);

// 3. currentCartItem
content = content.replace(
    /\(item\.metalType === selectedMetal \|\| \(!item\.metalType && !selectedMetal\)\)/g,
    `(item.color === selectedColor || (!item.color && !selectedColor))`
);

// 4. handleAddToCart
content = content.replace(
    /const handleAddToCart = async \(\) => \{.*?toast\.error\('Could not add to cart'\);\s*\}\s*\};/s,
    `const handleAddToCart = async () => {
        if (currentUser?.userType === 'admin') {
            toast.error('Admins cannot add items to the cart');
            return;
        }

        const effectiveSize = selectedSize || (sizes.length > 0 ? sizes[0] : null);
        const effectiveColor = selectedColor || (colors.length > 0 ? colors[0] : null);

        if (!currentUser) {
            dispatch(addToCartGuest({ product, size: effectiveSize, color: effectiveColor }));
            toast.success('Product added to cart');
            return;
        }
        try {
            dispatch(addCartItemStart());
            const res = await fetch(\`\${import.meta.env.VITE_PORT}/api/cart/addToCart/\${productId}\`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    userId: currentUser._id, 
                    size: effectiveSize, 
                    color: effectiveColor
                })
            });
            if (!res.ok) throw new Error('Failed to add to cart');
            const cartRes = await fetch(\`\${import.meta.env.VITE_PORT}/api/cart/getcart/\${currentUser._id}\`);
            if (cartRes.ok) {
                const cartData = await cartRes.json();
                dispatch(fetchCartItemsSuccess(Array.isArray(cartData) ? cartData : []));
            }
            toast.success('Product added to cart');
        } catch (error) {
            dispatch(addCartItemFailure(error.message));
            toast.error('Could not add to cart');
        }
    };`
);

// 5. Metal Type section - remove it
content = content.replace(
    /\{\/\* Metal Type \*\/.*?\{\/\* Select Size \*\/\}/s,
    `{/* Select Size */}`
);

// 6. Buttons
content = content.replace(
    /\{\/\* Accordion Detail Sections \*\/\}\s*<\/div>/,
    `{/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-primary text-primary-foreground py-4 font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl"
                                >
                                    <span>Add to Cart</span>
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 bg-foreground text-background py-4 font-black uppercase tracking-widest text-sm hover:bg-foreground/90 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>Buy Now</span>
                                </button>
                                <button
                                    onClick={() => handleWishlistClick(product?._id)}
                                    className={\`w-14 flex items-center justify-center border-2 transition-colors \${
                                        isWishlisted(product?._id)
                                            ? 'border-red-500 text-red-500 bg-red-50'
                                            : 'border-border text-foreground hover:border-foreground'
                                    }\`}
                                >
                                    {isWishlisted(product?._id) ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                                </button>
                            </div>
                        </div>`
);

fs.writeFileSync(path, content);
console.log('ProductDescription.jsx updated successfully.');
