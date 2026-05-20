const redisClient = require('../config/redisClient');
const Product = require('../models/Product');

// Helper to get raw cart from Redis
const getRawCart = async (userId) => {
    const data = await redisClient.get(`cart:${userId}`);
    return data ? JSON.parse(data) : [];
};

// Helper to save raw cart to Redis
const saveRawCart = async (userId, cart) => {
    await redisClient.set(`cart:${userId}`, JSON.stringify(cart));
};

// GET /api/cart - Lấy thông tin giỏ hàng
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const rawCart = await getRawCart(userId);
        
        let populatedItems = [];
        let totalAmount = 0;
        let hasChanges = false;
        let updatedRawCart = [];

        for (const item of rawCart) {
            const product = await Product.findById(item.productId);
            if (!product) {
                // Sản phẩm không còn tồn tại, tự động loại bỏ
                hasChanges = true;
                continue;
            }

            // Đảm bảo số lượng không vượt quá hàng tồn kho
            let finalQty = item.quantity;
            if (product.stock === 0) {
                hasChanges = true;
                continue; // Hết hàng thì xóa khỏi giỏ hàng hiển thị
            }
            if (finalQty > product.stock) {
                finalQty = product.stock;
                hasChanges = true;
            }

            populatedItems.push({
                product: {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    images: product.images,
                    stock: product.stock,
                    category: product.category
                },
                quantity: finalQty,
                subtotal: product.price * finalQty
            });

            totalAmount += product.price * finalQty;
            updatedRawCart.push({ productId: item.productId, quantity: finalQty });
        }

        // Nếu giỏ hàng có sự thay đổi do hết hàng/hạ số lượng, cập nhật lại Redis
        if (hasChanges) {
            await saveRawCart(userId, updatedRawCart);
        }

        res.json({
            items: populatedItems,
            totalAmount
        });
    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy giỏ hàng' });
    }
};

// POST /api/cart/add - Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;
        const parsedQuantity = parseInt(quantity, 10) || 1;

        if (parsedQuantity <= 0) {
            return res.status(400).json({ message: 'Số lượng thêm vào phải lớn hơn 0' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        if (product.stock <= 0) {
            return res.status(400).json({ message: 'Sản phẩm đã hết hàng' });
        }

        let rawCart = await getRawCart(userId);
        const existingItemIndex = rawCart.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            const newQty = rawCart[existingItemIndex].quantity + parsedQuantity;
            if (newQty > product.stock) {
                return res.status(400).json({ 
                    message: `Không thể thêm. Tổng số lượng trong giỏ (${newQty}) vượt quá tồn kho (${product.stock})` 
                });
            }
            rawCart[existingItemIndex].quantity = newQty;
        } else {
            if (parsedQuantity > product.stock) {
                return res.status(400).json({ 
                    message: `Số lượng yêu cầu (${parsedQuantity}) vượt quá tồn kho (${product.stock})` 
                });
            }
            rawCart.push({ productId, quantity: parsedQuantity });
        }

        await saveRawCart(userId, rawCart);
        res.json({ message: 'Đã thêm vào giỏ hàng thành công' });
    } catch (error) {
        console.error('Add To Cart Error:', error);
        res.status(500).json({ message: 'Lỗi server khi thêm vào giỏ hàng' });
    }
};

// PUT /api/cart/update - Cập nhật số lượng sản phẩm trong giỏ
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        const parsedQuantity = parseInt(quantity, 10);

        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        if (parsedQuantity > product.stock) {
            return res.status(400).json({ 
                message: `Số lượng yêu cầu (${parsedQuantity}) vượt quá tồn kho (${product.stock})` 
            });
        }

        let rawCart = await getRawCart(userId);
        const existingItemIndex = rawCart.findIndex(item => item.productId === productId);

        if (existingItemIndex === -1) {
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }

        rawCart[existingItemIndex].quantity = parsedQuantity;
        await saveRawCart(userId, rawCart);

        res.json({ message: 'Cập nhật giỏ hàng thành công' });
    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật giỏ hàng' });
    }
};

// DELETE /api/cart/remove/:productId - Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        let rawCart = await getRawCart(userId);
        rawCart = rawCart.filter(item => item.productId !== productId);

        await saveRawCart(userId, rawCart);
        res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
    } catch (error) {
        console.error('Remove From Cart Error:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm khỏi giỏ hàng' });
    }
};

// DELETE /api/cart/clear - Xóa sạch giỏ hàng
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        await redisClient.del(`cart:${userId}`);
        res.json({ message: 'Đã xóa sạch giỏ hàng' });
    } catch (error) {
        console.error('Clear Cart Error:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa giỏ hàng' });
    }
};
