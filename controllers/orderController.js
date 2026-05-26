const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const asyncHandler = require('express-async-handler');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        deliveryDate,
        deliverySlot
    } = req.body;

    // If no orderItems provided, use cart items
    let items = orderItems;
    if (!items || items.length === 0) {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price discountedPrice images stock unit');
        
        if (!cart || cart.items.length === 0) {
            res.status(400);
            throw new Error('No items in cart');
        }

        items = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images[0]?.url || '',
            price: item.product.discountedPrice || item.product.price,
            quantity: item.quantity,
            unit: item.product.unit
        }));
    }

    // Calculate prices
    const itemsPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingPrice = itemsPrice > 50 ? 0 : 5.99; // Free shipping over $50
    const taxPrice = Number((itemsPrice * 0.1).toFixed(2)); // 10% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Check product stock
    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for ${product?.name || 'product'}`);
        }
    }

    const order = new Order({
        user: req.user._id,
        orderItems: items,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        deliveryDate: new Date(deliveryDate),
        deliverySlot
    });

    // Update product stock
    for (const item of items) {
        const product = await Product.findById(item.product);
        product.stock -= item.quantity;
        await product.save();
    }

    // Clear cart after order
    await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [], totalItems: 0, totalPrice: 0 }
    );

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('orderItems.product', 'name images');

    if (order) {
        // Check if user is owner or admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to view this order');
        }
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'delivered';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        
        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    updateOrderStatus
};