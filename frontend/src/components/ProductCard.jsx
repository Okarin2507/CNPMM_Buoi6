import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product }) {
    const navigate = useNavigate();

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="group relative bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer"
            onClick={() => navigate(`/product/${product._id}`)}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img 
                    src={product.images[0] || 'https://via.placeholder.com/400'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay Tags */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isPromotion && (
                        <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                            Khuyến mãi
                        </span>
                    )}
                    {product.sold > 100 && (
                        <span className="bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                            Bán chạy
                        </span>
                    )}
                </div>

                {/* Quick Add Button */}
                <div className="absolute bottom-3 right-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">{product.category}</p>
                <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>
                
                <div className="mt-3 flex items-end justify-between">
                    <div>
                        <p className="text-lg font-bold text-gray-900 leading-none">
                            {product.price.toLocaleString()} <span className="text-xs">VNĐ</span>
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">Đã bán {product.sold}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">
                        <Star size={12} fill="currentColor" />
                        <span>4.8</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
