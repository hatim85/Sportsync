import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";

function mapCartItem(item) {
    return {
        cartItemId: item._id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        product: {
            _id: item.productId?._id,
            name: item.productId?.name,
            price: Number(item.productId?.price || 0),
            image: item.productId?.image,
            coverImageIndex: item.productId?.coverImageIndex,
            description: item.productId?.description,
        }
    };
}

export const updateCart = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const updatedCart = await Cart.findByIdAndUpdate(
            id,
            { userId },
            { new: true }
        );
        if (!updatedCart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCart = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCart = await Cart.findByIdAndDelete(id);
        if (!deletedCart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        res.status(200).json({ message: "Cart deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { cartId, productId, quantity } = req.body;
        const updatedCartItem = await CartItem.findByIdAndUpdate(
            id,
            { cartId, productId, quantity },
            { new: true }
        );
        if (!updatedCartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        res.status(200).json(updatedCartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCartItem = await CartItem.findByIdAndDelete(id);
        if (!deletedCartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        res.status(200).json({ message: "Cart item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addToCart = async (req, res) => {
    let { productId } = req.params;
    const { userId, size, color } = req.body;

    try {
        let cart = await Cart.findOne({ userId }).populate('cartItems').exec();

        if (!cart) {
            cart = await Cart.create({ userId, cartItems: [] });
        }

        productId = String(productId);
        let cartItem = await CartItem.findOne({
            cartId: cart._id,
            productId,
            size: size || null,
            color: color || null,
        }).exec();

        if (cartItem) {
            cartItem.quantity++;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                cartId: cart._id,
                productId,
                size: size || null,
                color: color || null,
            });
            cart.cartItems.push(cartItem._id);
            await cart.save();
        }

        cart = await Cart.findOne({ userId }).populate({
            path: 'cartItems',
            populate: { path: 'productId', model: 'Product' }
        }).exec();

        res.json(cart.cartItems.map((item) => mapCartItem(item)));
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getCartProducts = async (req, res) => {
    const userId = req.params.userId;
    try {
        const cart = await Cart.findOne({ userId }).populate({
            path: 'cartItems',
            populate: { path: 'productId', model: 'Product' }
        }).exec();

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.json(cart.cartItems.map((item) => mapCartItem(item)));
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeFromCart = async (req, res) => {
    const { cartItemId } = req.params;
    try {
        const cartItem = await CartItem.findById(cartItemId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        const cart = await Cart.findOne({ cartItems: cartItemId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.cartItems.pull(cartItemId);
        await cart.save();
        await CartItem.findByIdAndDelete(cartItemId);

        res.json({ message: 'Product removed from cart' });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCartItemQuantity = async (req, res) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    try {
        const cartItem = await CartItem.findById(cartItemId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        res.json(quantity);
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
