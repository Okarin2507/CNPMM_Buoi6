import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, ShoppingBag, ShoppingCart, ClipboardList } from 'lucide-react';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    let user = null;
    try {
        const storedUser = localStorage.getItem('user');
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
        console.error('Error parsing user from localStorage:', err);
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const navItems = [
        { label: 'Cửa hàng', path: '/', icon: ShoppingBag },
        { label: 'Giỏ hàng', path: '/cart', icon: ShoppingCart },
        { label: 'Đơn hàng', path: '/orders', icon: ClipboardList },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <div 
                    className="flex items-center gap-2 cursor-pointer group" 
                    onClick={() => navigate('/')}
                >
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                        <ShoppingBag size={22} />
                    </div>
                    <span className="text-xl font-black tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        TECH AUDIO
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/30">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                                    isActive 
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80'
                                }`}
                            >
                                <Icon size={14} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {/* User profile */}
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <User size={14} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Xin chào, <span className="font-bold">{user?.username}</span></span>
                    </div>

                    {/* Mobile Navigation button for Cart and Orders */}
                    <div className="flex md:hidden gap-1">
                        <button 
                            onClick={() => navigate('/cart')} 
                            className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-gray-600 transition-all"
                        >
                            <ShoppingCart size={16} />
                        </button>
                        <button 
                            onClick={() => navigate('/orders')} 
                            className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-gray-600 transition-all"
                        >
                            <ClipboardList size={16} />
                        </button>
                    </div>

                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors font-semibold text-sm border border-red-100"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Đăng xuất</span>
                    </button>
                </div>
            </div>
        </header>
    );
}