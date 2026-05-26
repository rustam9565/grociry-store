const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Please select category"],
      enum: [
        "fruits",
        "vegetables",
        "dairy",
        "meat",
        "bakery",
        "beverages",
        "snacks",
        "frozen",
        "pantry",
        "personal-care",
        "household",
        "other",
      ],
    },
    subCategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Please enter stock quantity"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, "Please enter unit"],
      enum: ["kg", "g", "lb", "oz", "piece", "liter", "ml", "pack", "dozen"],
    },
    images: [
      {
        url: String,
        altText: String,
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    features: [
      {
        type: String,
      },
    ],
    nutritionalInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    isVegetarian: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Index for search functionality
productSchema.index({ name: "text", description: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);
