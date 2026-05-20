const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const products = await Product.find({ category: 'Chuột' });
    console.log(`Test finding mice:`, products.length);
    process.exit(0);
});
