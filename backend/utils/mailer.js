const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const sendOTPMail = async (email, otp) => {
    const mailOptions = {
        from: `"TECH AUDIO" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Mã xác thực OTP đăng ký tài khoản',
        html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
                <h2 style="color: #2563eb; text-align: center;">Xác thực tài khoản</h2>
                <p>Chào bạn,</p>
                <p>Mã OTP để hoàn tất đăng ký tài khoản của bạn là:</p>
                <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 15px;">
                    <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #1e293b;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #64748b; margin-top: 20px;">Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">Đây là email tự động, vui lòng không phản hồi.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendOTPMail };
