import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Header from './components/Header';

function App() {
  const token = localStorage.getItem('token');
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {token && <Header />}
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
          <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
          <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
          <Route path="/product/:id" element={token ? <ProductDetail /> : <Navigate to="/login" />} />
          <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" />} />
          <Route path="/checkout" element={token ? <Checkout /> : <Navigate to="/login" />} />
          <Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;