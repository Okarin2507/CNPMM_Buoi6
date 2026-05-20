import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ShoppingCart, Heart, Share2, ShieldCheck, Truck, RefreshCw, Minus, Plus, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productRes, similarRes] = await Promise.all([
                    axiosInstance.get(`/products/${id}`),
                    axiosInstance.get(`/products/${id}/similar`)
                ]);
                setProduct(productRes.data);
                setSimilarProducts(similarRes.data);
                setQuantity(1);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!product) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

    const handleQuantity = (type) => {
        if (type === 'inc' && quantity < product.stock) setQuantity(quantity + 1);
        if (type === 'dec' && quantity > 1) setQuantity(quantity - 1);
    };

    const handleAddToCart = async () => {
        if (product.stock === 0) return;
        setAddingToCart(true);
        try {
            await axiosInstance.post('/cart/add', {
                productId: product._id,
                quantity
            });
            if (confirm('Đã thêm sản phẩm vào giỏ hàng thành công! Đi tới giỏ hàng để thanh toán?')) {
                navigate('/cart');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="container mx-auto px-6 py-10">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Trang chủ</span>
                    <span>/</span>
                    <span className="hover:text-blue-600 cursor-pointer">{product.category}</span>
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </div>

                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Left: Swiper Images */}
                        <div className="lg:w-1/2 p-8 lg:p-12 bg-gray-50/50">
                            <Swiper 
                                modules={[Navigation, Pagination, Autoplay]} 
                                navigation 
                                pagination={{ clickable: true }}
                                autoplay={{ delay: 3000 }}
                                className="h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-inner bg-white"
                            >
                                {product.images && product.images.length > 0 ? product.images.map((img, idx) => (
                                    <SwiperSlide key={idx}>
                                        <img src={img} alt={product.name} className="w-full h-full object-contain p-4" />
                                    </SwiperSlide>
                                )) : (
                                    <SwiperSlide>
                                        <img src="https://via.placeholder.com/600" alt="Placeholder" className="w-full h-full object-contain" />
                                    </SwiperSlide>
                                )}
                            </Swiper>
                        </div>

                        {/* Right: Product Info */}
                        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
                                        {product.category}
                                    </span>
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
                                        {product.name}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center text-orange-500">
                                            <Star size={16} fill="currentColor" />
                                            <Star size={16} fill="currentColor" />
                                            <Star size={16} fill="currentColor" />
                                            <Star size={16} fill="currentColor" />
                                            <Star size={16} fill="currentColor" />
                                            <span className="ml-2 text-gray-500 font-medium">(120 đánh giá)</span>
                                        </div>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-500 font-medium">Đã bán {product.sold}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-red-500 transition-colors border border-gray-100">
                                        <Heart size={20} />
                                    </button>
                                    <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:text-blue-500 transition-colors border border-gray-100">
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-4xl font-black text-blue-600 mb-8">
                                {product.price.toLocaleString()} <span className="text-lg">VNĐ</span>
                            </p>

                            <div className="space-y-6 mb-10 pb-10 border-b border-gray-100">
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description || 'Sản phẩm cao cấp với công nghệ mới nhất, mang lại trải nghiệm tuyệt vời cho người dùng.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <ShieldCheck className="text-green-500" />
                                        <span className="text-sm font-semibold text-gray-700">Bảo hành 12 tháng</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <Truck className="text-blue-500" />
                                        <span className="text-sm font-semibold text-gray-700">Miễn phí vận chuyển</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity & Actions */}
                            <div className="mt-auto">
                                <div className="flex flex-wrap items-center gap-6 mb-8">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số lượng</span>
                                        <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
                                            <button 
                                                onClick={() => handleQuantity('dec')}
                                                className="p-3 hover:bg-white rounded-xl transition-all active:scale-90"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                                            <button 
                                                onClick={() => handleQuantity('inc')}
                                                className="p-3 hover:bg-white rounded-xl transition-all active:scale-90"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 flex-grow">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tình trạng</span>
                                        <div className={`px-6 py-3 rounded-2xl font-bold text-sm border ${product.stock > 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Tạm hết hàng'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        disabled={product.stock === 0 || addingToCart}
                                        onClick={handleAddToCart}
                                        className={`flex-grow py-5 rounded-[20px] text-white font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                                            product.stock === 0 
                                            ? 'bg-gray-300 shadow-none cursor-not-allowed' 
                                            : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
                                        }`}
                                    >
                                        {addingToCart ? (
                                            <RefreshCw className="animate-spin" size={24} />
                                        ) : (
                                            <ShoppingCart size={24} />
                                        )}
                                        {product.stock === 0 ? 'HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <section className="mt-24">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-black text-gray-900 italic uppercase">Sản phẩm tương tự</h2>
                            <div className="w-24 h-1 bg-blue-600 rounded-full" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {similarProducts.map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}