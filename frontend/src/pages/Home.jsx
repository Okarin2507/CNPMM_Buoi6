import { useEffect, useState, useCallback, useRef } from 'react';
import axiosInstance from '../services/axiosInstance';
import ProductCard from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, ArrowRight, Zap, TrendingUp, Clock, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [mostViewed, setMostViewed] = useState([]);
    
    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [isPromotion, setIsPromotion] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Initial Data Load (Top Sections)
    useEffect(() => {
        const fetchTopSections = async () => {
            try {
                const [bestRes, viewedRes] = await Promise.all([
                    axiosInstance.get('/products/top/bestsellers?limit=10'),
                    axiosInstance.get('/products/top/most-viewed?limit=10')
                ]);
                setBestSellers(bestRes.data.products);
                setMostViewed(viewedRes.data.products);
            } catch (error) {
                console.error("Error fetching top sections:", error);
            }
        };
        fetchTopSections();
    }, []);

    // Main Product List Load
    const fetchProducts = useCallback(async (isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const params = new URLSearchParams({
                page: isLoadMore ? page : 1,
                limit: 8
            });
            
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (isPromotion) params.append('isPromotion', 'true');
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            const res = await axiosInstance.get(`/products?${params.toString()}`);
            
            if (isLoadMore) {
                setProducts(prev => [...prev, ...res.data.products]);
            } else {
                setProducts(res.data.products);
                setPage(1);
            }
            
            setHasMore(res.data.pagination.hasMore);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [search, category, isPromotion, minPrice, maxPrice, page]);

    // Handle Search / Filter change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts(false); // Reset to page 1
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search, category, isPromotion, minPrice, maxPrice]); // Removing fetchProducts from deps to avoid loop if not careful, but it's memoized.

    // Infinite Scroll Intersection Observer
    const observer = useRef();
    const lastProductElementRef = useCallback(node => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPageNumber => prevPageNumber + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore]);

    // Load more when page changes
    useEffect(() => {
        if (page > 1) {
            fetchProducts(true);
        }
    }, [page]);


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    // Horizontal Scroll Helper
    const scrollContainer = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const bestSellerRef = useRef(null);
    const mostViewedRef = useRef(null);

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white py-16 md:py-24">
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
                            New Collection 2024
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-8">
                            Nâng tầm trải nghiệm <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Âm thanh đỉnh cao</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                            Khám phá bộ sưu tập tai nghe và thiết bị âm thanh cao cấp nhất. Công nghệ chống ồn vượt trội và chất âm trung thực.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 group">
                                Mua sắm ngay <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-all">
                                Xem khuyến mãi
                            </button>
                        </div>
                    </motion.div>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent -z-0 rounded-l-[100px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
            </section>

            <div className="container mx-auto px-6 py-12">
                {/* Horizontal Scrolling Sections (Only show if no active search/filters to keep UI clean) */}
                {(!search && !category && !isPromotion && !minPrice && !maxPrice) && (
                    <div className="mb-16 space-y-16">
                        
                        {/* Best Sellers */}
                        {bestSellers.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><TrendingUp size={20} /></div>
                                        <h2 className="text-2xl font-black text-gray-900">Top 10 Bán Chạy Nhất</h2>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => scrollContainer(bestSellerRef, 'left')} className="p-2 rounded-full bg-white shadow hover:bg-gray-50"><ChevronLeft size={20}/></button>
                                        <button onClick={() => scrollContainer(bestSellerRef, 'right')} className="p-2 rounded-full bg-white shadow hover:bg-gray-50"><ChevronRight size={20}/></button>
                                    </div>
                                </div>
                                <div 
                                    ref={bestSellerRef}
                                    className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {bestSellers.map(p => (
                                        <div key={`bs-${p._id}`} className="min-w-[280px] md:min-w-[320px] snap-start">
                                            <ProductCard product={p} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Most Viewed */}
                        {mostViewed.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Eye size={20} /></div>
                                        <h2 className="text-2xl font-black text-gray-900">Top 10 Xem Nhiều Nhất</h2>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => scrollContainer(mostViewedRef, 'left')} className="p-2 rounded-full bg-white shadow hover:bg-gray-50"><ChevronLeft size={20}/></button>
                                        <button onClick={() => scrollContainer(mostViewedRef, 'right')} className="p-2 rounded-full bg-white shadow hover:bg-gray-50"><ChevronRight size={20}/></button>
                                    </div>
                                </div>
                                <div 
                                    ref={mostViewedRef}
                                    className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {mostViewed.map(p => (
                                        <div key={`mv-${p._id}`} className="min-w-[280px] md:min-w-[320px] snap-start">
                                            <ProductCard product={p} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}


                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter Sidebar */}
                    <aside className="lg:w-1/4">
                        <div className="sticky top-24 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-8">
                                <SlidersHorizontal size={20} className="text-blue-600" />
                                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Bộ lọc sản phẩm</h3>
                            </div>

                            {/* Search */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tìm kiếm</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Nhập tên sản phẩm..." 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Danh mục</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="">Tất cả sản phẩm</option>
                                    <option value="Tai nghe">Tai nghe</option>
                                    <option value="Chuột">Chuột</option>
                                    <option value="Bàn phím">Bàn phím</option>
                                    <option value="Loa">Loa</option>
                                    <option value="Lót chuột">Lót chuột</option>
                                    <option value="Phụ kiện">Phụ kiện</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Khoảng giá (VNĐ)</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Từ" 
                                        className="w-1/2 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                    <span className="text-gray-300">-</span>
                                    <input 
                                        type="number" 
                                        placeholder="Đến" 
                                        className="w-1/2 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Promotion Toggle */}
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                                <span className="text-sm font-bold text-red-600">Đang khuyến mãi</span>
                                <button 
                                    onClick={() => setIsPromotion(!isPromotion)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPromotion ? 'bg-red-500' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPromotion ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Product Grid with Infinite Scroll */}
                    <main className="lg:w-3/4">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Filter size={20} /></div>
                            <h2 className="text-2xl font-black text-gray-900">Tất cả sản phẩm</h2>
                        </div>

                        {loading && page === 1 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-[400px] bg-gray-200 animate-pulse rounded-3xl" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <Search size={48} className="text-gray-300 mb-4" />
                                <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm phù hợp</p>
                            </div>
                        ) : (
                            <>
                                <motion.div 
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {products.map((p, index) => {
                                        if (products.length === index + 1) {
                                            return (
                                                <div ref={lastProductElementRef} key={p._id}>
                                                    <ProductCard product={p} />
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={p._id}>
                                                    <ProductCard product={p} />
                                                </div>
                                            );
                                        }
                                    })}
                                </motion.div>
                                
                                {/* Loading Indicator for Infinite Scroll */}
                                {loadingMore && (
                                    <div className="flex justify-center mt-8 pb-8">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {!hasMore && products.length > 0 && (
                                    <p className="text-center text-gray-400 mt-8 pb-8 font-medium">Bạn đã xem hết sản phẩm.</p>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
            
            {/* Inject Global Styles for hiding scrollbar but allowing scroll */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}