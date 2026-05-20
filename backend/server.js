const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');

app.use(cors());
app.use(express.json());
app.use('/api/', globalLimiter); // Áp dụng giới hạn chung cho tất cả các API


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Đã kết nối MongoDB'))
    .catch(err => console.log(err));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy tại port ${PORT}`));