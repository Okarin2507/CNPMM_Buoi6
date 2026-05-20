const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Tất cả các tuyến đường đặt hàng đều cần đăng nhập
router.use(authMiddleware);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);

// Cổng test hỗ trợ thay đổi trạng thái đơn hàng nhanh chóng (Admin/Shop test)
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
