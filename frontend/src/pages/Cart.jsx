import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronRight, RefreshCw } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

export default function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchCart = async () => {
        try {
            const res = await axiosInstance.get('/cart');
            setCart(res.data);
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (productId, currentQty, amount) => {
        const newQty = currentQty + amount;
        if (newQty <= 0) return;
        setUpdatingId(productId);
        try {
            await axiosInstance.put('/cart/update', { productId, quantity: newQty });
            await fetchCart();
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể cập nhật số lượng');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemoveItem = async (productId) => {
        if (!confirm('Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
        try {
            await axiosInstance.delete(`/cart/remove/${productId}`);
            await fetchCart();
        } catch (err) {
            alert('Không thể xóa sản phẩm');
        }
    };

    const handleClearCart = async () => {
        if (!confirm('Bạn có muốn xóa toàn bộ giỏ hàng?')) return;
        try {
            await axiosInstance.delete('/cart/clear');
            setCart({ items: [], totalAmount: 0 });
        } catch (err) {
            alert('Không thể làm trống giỏ hàng');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-blue-600" size={40} />
                    <p className="text-gray-500 font-medium">Đang tải giỏ hàng của bạn...</p>
                </div>
            </div>
        );
    }

    const hasItems = cart && cart.items.length > 0;

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-semibold">Giỏ hàng</span>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                GIỎ HÀNG CỦA BẠN
            </h1>

            <AnimatePresence mode="wait">
                {!hasItems ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                            <ShoppingBag size={38} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
                        <p className="text-gray-500 mb-8 max-w-sm text-center">Hãy lấp đầy giỏ hàng bằng những thiết bị âm thanh và phụ kiện công nghệ đỉnh cao.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            Khám phá sản phẩm
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 text-lg">Danh sách sản phẩm ({cart.items.length})</h3>
                                    <button 
                                        onClick={handleClearCart}
                                        className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                                    >
                                        <Trash2 size={15} />
                                        Xóa tất cả
                                    </button>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {cart.items.map((item) => (
                                        <motion.div 
                                            key={item.product._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-6 flex flex-col sm:flex-row items-center gap-6"
                                        >
                                            {/* Product Image */}
                                            <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                                                <img 
                                                    src={item.product.images?.[0] || 'https://via.placeholder.com/150'} 
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 text-center sm:text-left">
                                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{item.product.category}</span>
                                                <h4 className="font-bold text-gray-800 text-base mt-1 line-clamp-1 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/product/${item.product._id}`)}>
                                                    {item.product.name}
                                                </h4>
                                                <p className="text-gray-500 text-sm mt-1">Còn lại: {item.product.stock} sản phẩm</p>
                                                <p className="text-blue-600 font-extrabold text-base mt-2 sm:hidden">
                                                    {item.product.price.toLocaleString()} VNĐ
                                                </p>
                                            </div>

                                            {/* Price (Desktop) */}
                                            <div className="hidden sm:block text-right flex-shrink-0">
                                                <p className="text-gray-400 text-xs font-semibold">Đơn giá</p>
                                                <p className="text-gray-900 font-extrabold text-base mt-1">
                                                    {item.product.price.toLocaleString()} VNĐ
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity, -1)}
                                                    disabled={item.quantity <= 1 || updatingId === item.product._id}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-gray-600 hover:bg-gray-100 border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-6 text-center font-bold text-gray-800 text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity, 1)}
                                                    disabled={item.quantity >= item.product.stock || updatingId === item.product._id}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-gray-600 hover:bg-gray-100 border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            {/* Subtotal & Delete */}
                                            <div className="text-right flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-1.5 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                                <button 
                                                    onClick={() => handleRemoveItem(item.product._id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <div>
                                                    <p className="text-gray-400 text-xs font-semibold hidden sm:block">Thành tiền</p>
                                                    <p className="text-blue-600 font-black text-lg sm:mt-1">
                                                        {item.subtotal.toLocaleString()} VNĐ
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                <h3 className="font-bold text-gray-900 text-lg border-b border-gray-50 pb-4">Tóm tắt đơn hàng</h3>
                                
                                <div className="space-y-4 text-sm font-medium">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Tổng số lượng</span>
                                        <span className="text-gray-900 font-bold">{cart.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Tạm tính</span>
                                        <span className="text-gray-900 font-bold">{cart.totalAmount.toLocaleString()} VNĐ</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-green-600 font-bold">Miễn phí</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                                        <span className="font-bold text-gray-900 text-base">Tổng thanh toán</span>
                                        <span className="font-black text-blue-600 text-xl leading-none">
                                            {cart.totalAmount.toLocaleString()} VNĐ
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate('/checkout')}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group active:scale-95"
                                >
                                    <span>Tiến hành thanh toán</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button 
                                    onClick={() => navigate('/')}
                                    className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl border border-gray-100 transition-all active:scale-95"
                                >
                                    Tiếp tục mua sắm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
