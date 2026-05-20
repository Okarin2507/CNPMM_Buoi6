const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [{ type: String }], // Mảng hình ảnh cho Swiper
    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    category: String,
    isPromotion: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);