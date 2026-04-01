import { useState } from 'react'
import './App.css'
import './i18n/index.js'   // ✅ DİL PAKETİ
import "flowbite"
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import SplashScreen from './components/Splashscreen'  // ✅ YENİ
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './components/Login'
import ForgotPassword from './components/ForgotPassword'
import Register from './components/Register'
import ProductDetail from './components/ProductDetail'
import AddProducts from './components/admin/AddProducts'
import AdminProducts from './components/admin/AdminProduct'
import EditProduct from './components/admin/EditProduct'
import SearchResults from './components/SearchResults'
import NotFound from './pages/NotFound'
import Introduction from './components/Introduction'
import SebetCart from './components/SebetCart'
import Categories from './components/Categories'
import Footer from './components/Footer'
import Kadın from './pages/Kadın'
import FavoriteButton from './components/FavoriteButton'
import Shop from './pages/Shop'
import Cameras from './components/Cameras'
import Food from './components/Food'
import Headphones from './components/Headphones'
import Laptops from './components/Laptops'
import PrivateRoute from './components/PrivateRoute'
import UserRoute from './components/UserRoute'
import ResetPassword from './components/ResetPassword'
import EcommerceApp from './components/EcommerceApp'
import Phones from './components/Phones'
import About from './pages/About'
import Contact from './pages/Contact'
import Computers from './components/Computer'
import PaymentComponent from './components/PaymentComponent'
import Sever from './components/Sever'
import Testimonials from './components/Testimonials'
import Blog from './components/Blog'
import Welcome from './components/Welcome'
import Store from './components/Store'
import MyOrders from './pages/MyOrders'
import AdminOrders from './pages/AdminOrders'
import CommissionPage from './pages/seller/CommissionPage' // ✅ YENİ


function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/";

  return (
    <>
      {!isAuthPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/store/:slug" element={<Store />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<SebetCart />} />
        <Route path="/shop" element={<EcommerceApp />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/favori" element={<FavoriteButton />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
        <Route path="/payment" element={<PaymentComponent />} />

        {/* Müştəri — giriş etmiş hər kəs */}
        <Route path="/my-orders" element={<UserRoute><MyOrders /></UserRoute>} />

        {/* Satıcı — yalnız seller */}
        <Route path="/seller/commission" element={<UserRoute><CommissionPage /></UserRoute>} /> {/* ✅ YENİ */}

        {/* Admin — yalnız admin */}
        <Route path="/admin/orders" element={<PrivateRoute><AdminOrders /></PrivateRoute>} />
        <Route path="/admin/products" element={<PrivateRoute><AddProducts /></PrivateRoute>} />
        <Route path="/admin/product" element={<PrivateRoute><AdminProducts /></PrivateRoute>} />
        <Route path='/admin/edit-product/:id' element={<PrivateRoute><EditProduct /></PrivateRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAuthPage && <Footer />}
    </>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false)  // ✅ YENİ

  return (
    <BrowserRouter>
      <Toaster position='top-center' />
      {!splashDone
        ? <SplashScreen onFinish={() => setSplashDone(true)} />  // ✅ YENİ
        : <AppContent />
      }
    </BrowserRouter>
  );
}

export default App;