import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Info, 2: OTP
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

    const handleNext = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await axiosInstance.post('/auth/send-otp', { email: formData.email });
            console.log(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const otpString = otpValues.join('');
        if (otpString.length < 6) {
            setError('Vui lòng nhập đủ 6 số mã OTP');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            await axiosInstance.post('/auth/register', {
                username: formData.username,
                password: formData.password,
                email: formData.email,
                otp: otpString
            });
            setStep(3); // Success
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otpValues];
        newOtp[index] = value;
        setOtpValues(newOtp);

        if (value && index < 5) {
            const next = document.getElementById(`otp-${index + 1}`);
            if (next) next.focus();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6">
            <div className="w-full max-w-md">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white p-8 rounded-[32px] shadow-xl shadow-blue-100/50 border border-gray-100"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-black text-gray-900 mb-2">Tham gia cùng chúng tôi</h1>
                                <p className="text-gray-500">Tạo tài khoản để bắt đầu trải nghiệm</p>
                            </div>

                            <form onSubmit={handleNext} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tên đăng nhập</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="text" required
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="okarin_2507"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="email" required
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="example@gmail.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="password" required
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
                                >
                                    {loading ? 'Đang gửi...' : 'Tiếp tục'} 
                                    {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm text-gray-500">
                                Đã có tài khoản? <Link to="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập ngay</Link>
                            </p>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white p-8 rounded-[32px] shadow-xl shadow-blue-100/50 border border-gray-100"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <ShieldCheck size={32} />
                                </div>
                                <h1 className="text-2xl font-black text-gray-900 mb-2">Xác thực OTP</h1>
                                <p className="text-gray-500 px-4">Chúng tôi đã gửi mã xác thực đến <span className="font-bold text-gray-900">{formData.email}</span></p>
                            </div>

                            <form onSubmit={handleRegister} className="space-y-6">
                                <div className="flex justify-center gap-3">
                                    {otpValues.map((val, i) => (
                                        <input 
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text" maxLength="1"
                                            className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                                            value={val}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !val && i > 0) {
                                                    const prev = document.getElementById(`otp-${i - 1}`);
                                                    if (prev) prev.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>

                                {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                                <button 
                                    type="submit" disabled={loading}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                                >
                                    {loading ? 'Đang xác thực...' : 'Xác nhận & Đăng ký'}
                                </button>

                                <div className="text-center">
                                    <button 
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        Quay lại chỉnh sửa email
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-12 rounded-[32px] shadow-xl text-center"
                        >
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                <CheckCircle2 size={48} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-4">Chào mừng bạn!</h1>
                            <p className="text-gray-500">Tài khoản của bạn đã được tạo thành công. Đang chuyển hướng đến trang đăng nhập...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
