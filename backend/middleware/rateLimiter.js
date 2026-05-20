const { rateLimit } = require('express-rate-limit');

// Bộ giới hạn chung cho toàn bộ API (Sử dụng in-memory store để tránh lỗi Redis timeout khi test cục bộ)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    limit: 1000, // Tăng giới hạn lên 1000 để thoải mái kiểm thử không bị chặn
    standardHeaders: 'draft-7', // Sử dụng RateLimit headers mới nhất
    legacyHeaders: false, // Tắt X-RateLimit-* headers cũ
    validate: { default: false }, // Tắt kiểm tra double count để áp dụng nhiều tầng limiter
    message: {
        status: 429,
        message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.'
    }
});

// Bộ giới hạn nghiêm ngặt hơn cho các tính năng nhạy cảm (Đăng nhập, Đăng ký)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    limit: 200, // Tăng giới hạn lên 200 cho thoải mái test đăng nhập/đăng ký
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: { default: false }, // Tắt kiểm tra double count
    message: {
        status: 429,
        message: 'Quá nhiều lần thử đăng nhập/đăng ký thất bại. Vui lòng thử lại sau 1 giờ.'
    }
});

module.exports = { globalLimiter, authLimiter };
