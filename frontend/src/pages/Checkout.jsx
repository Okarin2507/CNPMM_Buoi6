import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingBag, ArrowLeft, CheckCircle2, Wallet, CreditCard, Truck, RefreshCw } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

export default function Checkout() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paymentStep, setPaymentStep] = useState('form'); // 'form' | 'momo_qr' | 'success'

    // Form inputs
    const [shippingAddress, setShippingAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [createdOrder, setCreatedOrder] = useState(null);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axiosInstance.get('/cart');
                setCart(res.data);
                if (res.data.items.length === 0) {
                    navigate('/cart');
                }
            } catch (err) {
                console.error('Error fetching cart:', err);
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [navigate]);

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (!shippingAddress.trim() || !phoneNumber.trim()) {
            alert('Vui lòng điền đầy đủ địa chỉ giao hàng và số điện thoại');
            return;
        }

        setSubmitting(true);
        try {
            if (paymentMethod === 'MOMO') {
                // Giả lập bước quét mã QR của MoMo
                setPaymentStep('momo_qr');
                setSubmitting(false);
            } else {
                // Thanh toán COD trực tiếp
                const res = await axiosInstance.post('/orders', {
                    shippingAddress,
                    phoneNumber,
                    paymentMethod
                });
                setCreatedOrder(res.data.order);
                setPaymentStep('success');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể đặt hàng, vui lòng thử lại.');
            setSubmitting(false);
        }
    };

    const handleConfirmMomoPayment = async () => {
        setSubmitting(true);
        try {
            const res = await axiosInstance.post('/orders', {
                shippingAddress,
                phoneNumber,
                paymentMethod: 'MOMO'
            });
            setCreatedOrder(res.data.order);
            setPaymentStep('success');
        } catch (err) {
            alert(err.response?.data?.message || 'Thanh toán MoMo thất bại, vui lòng thử lại.');
            setPaymentStep('form');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-blue-600" size={40} />
                    <p className="text-gray-500 font-medium">Đang tải thông tin thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
                <ChevronRight size={14} />
                <Link to="/cart" className="hover:text-blue-600 transition-colors">Giỏ hàng</Link>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-semibold">Thanh toán</span>
            </div>

            <AnimatePresence mode="wait">
                {paymentStep === 'form' && (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Checkout Details & Form */}
                        <div className="lg:col-span-2 space-y-8">
                            <form onSubmit={handleSubmitOrder} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                                <div className="flex items-center gap-3 pb-6 border-b border-gray-50">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Truck size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Thông tin nhận hàng</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Số điện thoại nhận hàng</label>
                                        <input 
                                            type="tel" 
                                            required
                                            placeholder="Nhập số điện thoại của bạn..." 
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Địa chỉ nhận hàng (Ghi rõ số nhà, ngõ, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)</label>
                                        <textarea 
                                            required
                                            rows={3}
                                            placeholder="Nhập địa chỉ giao hàng chi tiết..." 
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium"
                                            value={shippingAddress}
                                            onChange={(e) => setShippingAddress(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-3 pb-6">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                            <CreditCard size={20} />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* COD Option */}
                                        <div 
                                            onClick={() => setPaymentMethod('COD')}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                                                paymentMethod === 'COD' 
                                                ? 'border-blue-600 bg-blue-50/20' 
                                                : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === 'COD' ? 'border-blue-600' : 'border-gray-300'
                                            }`}>
                                                {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-950 text-sm">Thanh toán khi nhận hàng (COD)</p>
                                                <p className="text-xs text-gray-500 mt-1">Trả tiền mặt trực tiếp cho shipper khi hàng tới tay</p>
                                            </div>
                                        </div>

                                        {/* MoMo Option */}
                                        <div 
                                            onClick={() => setPaymentMethod('MOMO')}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                                                paymentMethod === 'MOMO' 
                                                ? 'border-pink-600 bg-pink-50/10' 
                                                : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                paymentMethod === 'MOMO' ? 'border-pink-600' : 'border-gray-300'
                                            }`}>
                                                {paymentMethod === 'MOMO' && <div className="w-2.5 h-2.5 bg-pink-600 rounded-full" />}
                                            </div>
                                            <div className="flex-1 flex items-center gap-2">
                                                <div>
                                                    <p className="font-bold text-gray-950 text-sm">Ví điện tử MoMo</p>
                                                    <p className="text-xs text-gray-500 mt-1">Giả lập cổng thanh toán trực tuyến qua mã QR</p>
                                                </div>
                                                <span className="ml-auto w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center font-bold text-[10px] text-pink-600">MoMo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={18} />
                                            <span>Đang xử lý đơn hàng...</span>
                                        </>
                                    ) : (
                                        <span>Xác nhận & Đặt hàng</span>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-2 justify-between border-b border-gray-50 pb-4">
                                    <h3 className="font-bold text-gray-900 text-lg">Đơn hàng của bạn</h3>
                                    <Link to="/cart" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                                        <ArrowLeft size={14} />
                                        Sửa
                                    </Link>
                                </div>

                                {/* Items list */}
                                <div className="divide-y divide-gray-50 max-h-[250px] overflow-y-auto pr-1">
                                    {cart.items.map((item) => (
                                        <div key={item.product._id} className="py-3 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-50 flex-shrink-0 flex items-center justify-center">
                                                <img 
                                                    src={item.product.images?.[0] || 'https://via.placeholder.com/100'} 
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{item.product.name}</h4>
                                                <p className="text-gray-400 text-[10px] mt-0.5">Số lượng: {item.quantity}</p>
                                            </div>
                                            <span className="font-extrabold text-gray-900 text-xs">
                                                {(item.product.price * item.quantity).toLocaleString()} VNĐ
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-50 pt-4 space-y-3 text-xs font-semibold">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Tạm tính</span>
                                        <span className="text-gray-900 font-bold">{cart.totalAmount.toLocaleString()} VNĐ</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-green-600 font-bold">Miễn phí</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                                        <span className="font-bold text-gray-900 text-sm">Tổng cộng</span>
                                        <span className="font-black text-blue-600 text-lg">
                                            {cart.totalAmount.toLocaleString()} VNĐ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* MoMo QR Code Step */}
                {paymentStep === 'momo_qr' && (
                    <motion.div 
                        key="momo_qr"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-md mx-auto bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl shadow-pink-100/50 text-center space-y-6"
                    >
                        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mx-auto">
                            <Wallet size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Quét mã MoMo thanh toán</h2>
                            <p className="text-sm text-gray-500 mt-2">Vui lòng quét mã QR bên dưới để thanh toán giả lập số tiền <strong className="text-pink-600 font-black">{cart.totalAmount.toLocaleString()} VNĐ</strong></p>
                        </div>

                        {/* Mock QR Code */}
                        <div className="w-64 h-64 bg-gray-50 rounded-3xl border-4 border-pink-500 mx-auto flex items-center justify-center p-4 relative overflow-hidden shadow-inner shadow-pink-100">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MoMoPayment_Total_${cart.totalAmount}`} 
                                alt="Momo QR Code" 
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-pink-600/5 pointer-events-none animate-pulse" />
                        </div>

                        <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50 text-xs text-pink-700 font-semibold leading-relaxed">
                            💡 Sau khi quét mã, ấn nút xác nhận thanh toán giả lập bên dưới để hoàn tất đặt hàng ngay lập tức!
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setPaymentStep('form')}
                                className="w-1/2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl border border-gray-100 transition-all text-sm"
                            >
                                Quay lại
                            </button>
                            <button 
                                onClick={handleConfirmMomoPayment}
                                disabled={submitting}
                                className="w-1/2 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-pink-100 transition-all flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
                            >
                                {submitting ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={16} />}
                                <span>Đã thanh toán</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Success Screen */}
                {paymentStep === 'success' && createdOrder && (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-xl mx-auto bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl shadow-blue-100/50 text-center space-y-8"
                    >
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle2 size={44} fill="currentColor" className="text-white" />
                        </div>

                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Đặt hàng thành công!</h2>
                            <p className="text-gray-500 mt-2 text-sm leading-relaxed">Cảm ơn bạn đã lựa chọn mua sắm tại <strong>Tech Audio</strong>. Mã đơn hàng của bạn là: <strong className="text-blue-600 font-bold">#{createdOrder._id}</strong></p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4 text-sm text-left">
                            <div className="flex justify-between border-b border-gray-200/50 pb-3">
                                <span className="font-semibold text-gray-400">Phương thức</span>
                                <span className="font-bold text-gray-800">{createdOrder.paymentMethod === 'MOMO' ? 'Ví điện tử MoMo' : 'Thanh toán COD'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200/50 pb-3">
                                <span className="font-semibold text-gray-400">Số điện thoại</span>
                                <span className="font-bold text-gray-800">{createdOrder.phoneNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-400">Địa chỉ nhận</span>
                                <span className="font-bold text-gray-800 text-right max-w-[280px] line-clamp-2">{createdOrder.shippingAddress}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => navigate('/')}
                                className="w-1/2 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl border border-gray-100 transition-all"
                            >
                                Tiếp tục mua sắm
                            </button>
                            <button 
                                onClick={() => navigate('/orders')}
                                className="w-1/2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-1.5"
                            >
                                <ShoppingBag size={18} />
                                <span>Theo dõi đơn hàng</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
