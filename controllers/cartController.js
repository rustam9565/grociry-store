const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name price discountedPrice images stock unit');

    if (cart) {
        res.json(cart);
    } else {
        // Create empty cart if doesn't exist
    
        const newCart = new Cart({
            user: req.user._id,
            items: []
        });
        await newCart.save();
        res.json(newCart);
    }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
   
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Insufficient stock');
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = new Cart({
            user: req.user._id,
            items: []
        });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    const price = product.discountedPrice || product.price;

    if (itemIndex > -1) {
        // Update quantity if item exists
        cart.items[itemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.items.push({
            product: productId,
            quantity,
            price
        });
    }

    // Update totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.updatedAt = Date.now();

    await cart.save();

    await cart.populate('items.product', 'name price discountedPrice images stock unit');
    res.json(cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const itemId = req.params.itemId;

    if (quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1');
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
        item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    // Check product stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Insufficient stock');
    }

    cart.items[itemIndex].quantity = quantity;

    // Update totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.updatedAt = Date.now();

    await cart.save();

    await cart.populate('items.product', 'name price discountedPrice images stock unit');
    res.json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    const itemId = req.params.itemId;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
        item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    cart.items.splice(itemIndex, 1);

    // Update totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.updatedAt = Date.now();

    await cart.save();

    await cart.populate('items.product', 'name price discountedPrice images stock unit');
    res.json(cart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.items = [];
        cart.totalItems = 0;
        cart.totalPrice = 0;
        cart.updatedAt = Date.now();
        await cart.save();
    }

    res.json({ message: 'Cart cleared' });
});

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};