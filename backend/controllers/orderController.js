const Order = require('../models/Order');
const Product = require('../models/Product');
const redisClient = require('../config/redisClient');

// Helper to get raw cart from Redis
const getRawCart = async (userId) => {
    const data = await redisClient.get(`cart:${userId}`);
    return data ? JSON.parse(data) : [];
};

// Helper to auto-confirm order if 30 minutes have passed
const checkAndAutoConfirm = async (order) => {
    if (order.status === 'New') {
        const timeDiffMs = Date.now() - new Date(order.createdAt).getTime();
        const thirtyMinutesMs = 30 * 60 * 1000;
        if (timeDiffMs >= thirtyMinutesMs) {
            order.status = 'Confirmed';
            await order.save();
        }
    }
    return order;
};

// POST /api/orders - Đặt hàng (Checkout)
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shippingAddress, phoneNumber, paymentMethod = 'COD' } = req.body;

        if (!shippingAddress || !phoneNumber) {
            return res.status(400).json({ message: 'Địa chỉ giao hàng và số điện thoại là bắt buộc' });
        }

        const rawCart = await getRawCart(userId);
        if (!rawCart || rawCart.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống' });
        }

        let orderItems = [];
        let totalAmount = 0;

        // Kiểm tra tồn kho và chuẩn bị sản phẩm
        for (const item of rawCart) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Không tìm thấy sản phẩm với ID: ${item.productId}` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Sản phẩm "${product.name}" không đủ hàng tồn kho. Chỉ còn lại ${product.stock} sản phẩm.` 
                });
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });

            totalAmount += product.price * item.quantity;
        }

        // Trừ kho và tăng số lượng đã bán
        for (const item of rawCart) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            });
        }

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: userId,
            items: orderItems,
            shippingAddress,
            phoneNumber,
            paymentMethod,
            paymentStatus: paymentMethod === 'MOMO' ? 'Paid' : 'Pending', // Ví Momo giả lập thanh toán thành công ngay
            status: 'New',
            totalAmount
        });

        await newOrder.save();

        // Xóa sạch giỏ hàng trong Redis
        await redisClient.del(`cart:${userId}`);

        res.status(201).json({
            message: 'Đặt hàng thành công!',
            order: newOrder
        });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Lỗi server khi đặt hàng' });
    }
};

// GET /api/orders - Danh sách đơn hàng của user
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        let orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

        // Tự động kiểm tra và cập nhật trạng thái "Đã xác nhận" nếu đã qua 30 phút
        for (let order of orders) {
            await checkAndAutoConfirm(order);
        }

        res.json(orders);
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy lịch sử mua hàng' });
    }
};

// GET /api/orders/:id - Chi tiết đơn hàng
exports.getOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        let order = await Order.findOne({ _id: id, user: userId });
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        await checkAndAutoConfirm(order);

        res.json(order);
    } catch (error) {
        console.error('Get Order Detail Error:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy chi tiết đơn hàng' });
    }
};

// POST /api/orders/:id/cancel - Hủy đơn hàng hoặc Gửi yêu cầu hủy đơn
exports.cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const order = await Order.findOne({ _id: id, user: userId });
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Tính toán thời gian đã trôi qua
        const timeDiffMs = Date.now() - new Date(order.createdAt).getTime();
        const thirtyMinutesMs = 30 * 60 * 1000;

        if (timeDiffMs > thirtyMinutesMs) {
            return res.status(400).json({ 
                message: 'Không thể hủy đơn hàng sau 30 phút kể từ lúc đặt hàng thành công.' 
            });
        }

        // Áp dụng luật trạng thái
        if (order.status === 'New' || order.status === 'Confirmed') {
            // Hủy thành công trực tiếp
            order.status = 'Cancelled';
            await order.save();

            // Hoàn lại kho và trừ lượng bán
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity, sold: -item.quantity }
                });
            }

            return res.json({ 
                message: 'Đơn hàng đã được hủy thành công và hoàn lại kho.',
                order 
            });
        } else if (order.status === 'Preparing') {
            // Shop đang chuẩn bị hàng -> chuyển sang Gửi yêu cầu hủy
            order.status = 'CancelRequested';
            await order.save();

            return res.json({ 
                message: 'Đơn đặt hàng đang được chuẩn bị. Yêu cầu hủy đơn đã được gửi đến shop để phê duyệt.',
                order 
            });
        } else {
            return res.status(400).json({ 
                message: `Đơn hàng đang ở trạng thái "${order.status}". Không thể hủy đơn.` 
            });
        }
    } catch (error) {
        console.error('Cancel Order Error:', error);
        res.status(500).json({ message: 'Lỗi server khi hủy đơn hàng' });
    }
};

// PUT /api/orders/:id/status (Demo/Test Helper) - Cập nhật trạng thái thủ công (Cho Admin/Shop kiểm thử)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;

        const validStatuses = ['New', 'Confirmed', 'Preparing', 'Shipping', 'Delivered', 'Cancelled', 'CancelRequested'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        res.json({
            message: 'Cập nhật trạng thái đơn hàng thành công!',
            order
        });
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái' });
    }
};
