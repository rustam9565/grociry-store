const Product = require("../models/Product");
const Review = require("../models/Review");
const asyncHandler = require("express-async-handler");

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.page) || 1;
  const sort = req.query.sort || "newest";
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: "i" } },
          { description: { $regex: req.query.keyword, $options: "i" } },
          { brand: { $regex: req.query.keyword, $options: "i" } },
        ],
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};
  // Ensure minPrice and maxPrice are numbers if present, otherwise undefined
  const minPrice =
    req.query.minPrice !== undefined && req.query.minPrice !== ""
      ? { price: { $gte: Number(req.query.minPrice) } }
      : {};
  const maxPrice =
    req.query.maxPrice !== undefined && req.query.maxPrice !== ""
      ? { price: { $lte: Number(req.query.maxPrice) } }
      : {};

  // Merge price filters if both present
  let priceFilter = {};
  if (minPrice.price && maxPrice.price) {
    priceFilter = {
      price: { $gte: minPrice.price.$gte, $lte: maxPrice.price.$lte },
    };
  } else if (minPrice.price) {
    priceFilter = minPrice;
  } else if (maxPrice.price) {
    priceFilter = maxPrice;
  }

  const filter = {
    ...keyword,
    ...category,
    ...priceFilter,
    isActive: true,
  };

  // Sorting logic
  let sortOption = { createdAt: -1 };
  if (sort === "price_low") sortOption = { price: 1 };
  else if (sort === "price_high") sortOption = { price: -1 };
  else if (sort === "rating") sortOption = { "ratings.average": -1 };
  else if (sort === "name") sortOption = { name: 1 };
  // else default to newest

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .populate("createdBy", "name");

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("createdBy", "name")
    .populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "name avatar",
      },
    });

  if (product && product.isActive) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    category,
    unit,
    stock,
    brand,
    images,
    discountedPrice,
    subCategory,
    features,
    nutritionalInfo,
    isOrganic,
    isVegetarian,
    expiryDate,
    tags,
  } = req.body;
  console.log(req.body);
  const product = new Product({
    name: name,
    price: price,
    description: description,
    category: category,
    unit: unit,
    stock: stock,
    brand: brand,
    images: images,
    discountedPrice: discountedPrice,
    subCategory: subCategory,
    features: features,
    nutritionalInfo: nutritionalInfo,
    isOrganic: isOrganic,
    isVegetarian: isVegetarian,
    expiryDate: expiryDate,
    tags: tags,
    createdBy: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    category,
    unit,
    stock,
    brand,
    images,
    discountedPrice,
    subCategory,
    features,
    nutritionalInfo,
    isOrganic,
    isVegetarian,
    expiryDate,
    tags,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.unit = unit || product.unit;
    product.stock = stock !== undefined ? stock : product.stock;
    product.brand = brand || product.brand;
    product.images = images || product.images;
    product.discountedPrice =
      discountedPrice !== undefined ? discountedPrice : product.discountedPrice;
    product.subCategory = subCategory || product.subCategory;
    product.features = features || product.features;
    product.nutritionalInfo = nutritionalInfo || product.nutritionalInfo;
    product.isOrganic = isOrganic !== undefined ? isOrganic : product.isOrganic;
    product.isVegetarian =
      isVegetarian !== undefined ? isVegetarian : product.isVegetarian;
    product.expiryDate = expiryDate || product.expiryDate;
    product.tags = tags || product.tags;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: product._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      product: product._id,
      rating: Number(rating),
      comment,
    });

    await review.save();

    // Update product rating
    const reviews = await Review.find({ product: product._id });
    product.ratings.count = reviews.length;
    product.ratings.average =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort({ "ratings.average": -1 })
    .limit(8);

  res.json(products);
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const category = req.params.category;
  const products = await Product.find({
    category: category,
    isActive: true,
  }).limit(20);

  res.json(products);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductsByCategory,
};
