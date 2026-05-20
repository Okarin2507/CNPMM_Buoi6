const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPMail } = require('../utils/mailer');
const redisClient = require('../config/redisClient');

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Lưu OTP vào Redis với thời gian hết hạn 5 phút (300 giây)
        await redisClient.setEx(`otp:${email}`, 300, otp);
        
        // Gửi mail (bỏ qua await nếu muốn nhanh, nhưng ở đây nên đợi để báo lỗi nếu mail sai)
        try {
            await sendOTPMail(email, otp);
            res.json({ message: 'Mã OTP đã được gửi đến email của bạn' });
        } catch (mailError) {
            console.error('Mail Error:', mailError);
            res.status(500).json({ message: 'Không thể gửi email. Vui lòng kiểm tra lại cấu hình mail server.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, password, email, otp } = req.body;
        
        // Kiểm tra OTP từ Redis
        const storedOtp = await redisClient.get(`otp:${email}`);
        
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn' });
        }

        // Kiểm tra user tồn tại
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        // Xóa OTP sau khi dùng xong
        await redisClient.del(`otp:${email}`);

        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Không tìm thấy user' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu' });

        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};