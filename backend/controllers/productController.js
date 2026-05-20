const Product = require('../models/Product');

// GET /api/products — Hỗ trợ phân trang (page, limit) + filter
exports.getProducts = async (req, res) => {
    try {
        console.log('GET /products query:', req.query);
        const { search, category, sort, isPromotion, minPrice, maxPrice, page, limit } = req.query;
        let query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.category = category;
        if (isPromotion === 'true') query.isPromotion = true;

        console.log('Mongo Query:', query);
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12; // Mặc định 12 sản phẩm mỗi trang
        const skip = (pageNum - 1) * limitNum;

        let productsQuery = Product.find(query);
        if (sort === 'bestseller') productsQuery = productsQuery.sort({ sold: -1 });
        else if (sort === 'newest') productsQuery = productsQuery.sort({ createdAt: -1 });
        else if (sort === 'price_asc') productsQuery = productsQuery.sort({ price: 1 });
        else if (sort === 'price_desc') productsQuery = productsQuery.sort({ price: -1 });
        else if (sort === 'views') productsQuery = productsQuery.sort({ views: -1 });

        const total = await Product.countDocuments(query);
        const products = await productsQuery.skip(skip).limit(limitNum).exec();

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasMore: pageNum * limitNum < total
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// GET /api/products/top/bestsellers — Top 10 bán chạy nhất
exports.getBestSellers = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 5; // 5 sản phẩm mỗi trang ngang
        const skip = (pageNum - 1) * limitNum;

        const total = await Product.countDocuments({ sold: { $gt: 0 } });
        const products = await Product.find({ sold: { $gt: 0 } })
            .sort({ sold: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: Math.min(total, 10), // Giới hạn tối đa 10
                totalPages: Math.ceil(Math.min(total, 10) / limitNum),
                hasMore: pageNum * limitNum < Math.min(total, 10)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// GET /api/products/top/most-viewed — Top 10 xem nhiều nhất
exports.getMostViewed = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 5;
        const skip = (pageNum - 1) * limitNum;

        const total = await Product.countDocuments({ views: { $gt: 0 } });
        const products = await Product.find({ views: { $gt: 0 } })
            .sort({ views: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: Math.min(total, 10),
                totalPages: Math.ceil(Math.min(total, 10) / limitNum),
                hasMore: pageNum * limitNum < Math.min(total, 10)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// GET /api/products/:id — Chi tiết sản phẩm + tăng lượt xem
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// GET /api/products/:id/similar
exports.getSimilarProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

        const similar = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        res.json(similar);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// GET /api/products/categories/list — Lấy danh sách danh mục
exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        // Đếm số sản phẩm mỗi danh mục
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => ({
                name: cat,
                count: await Product.countDocuments({ category: cat })
            }))
        );
        res.json(categoriesWithCount);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};