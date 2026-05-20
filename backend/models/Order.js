const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }],
    shippingAddress: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    paymentMethod: { type: String, enum: ['COD', 'MOMO'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    status: { 
        type: String, 
        enum: ['New', 'Confirmed', 'Preparing', 'Shipping', 'Delivered', 'Cancelled', 'CancelRequested'], 
        default: 'New' 
    },
    totalAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
