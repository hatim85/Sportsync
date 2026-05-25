import React from 'react'
import ProductDescription from './pages/product/ProductDescription';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from './pages/About';
import Profile from './pages/user/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/admin/Dashboard';
import ProductListPage from './pages/product/ProductListPage';
import CategoryProductsPage from './pages/product/CategoryProductsPage';
import SearchPage from './pages/SearchPage';
import FaqPage from './pages/FAQPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute';
import AddressForm from './pages/AddressForm';
import PrivateRoute from './components/PrivateRoute';
import PaymentSuccess from './pages/PaymentSuccess';
import MyOrders from './pages/MyOrders';
import NotFound from './pages/NotFound';
import Wishlist from './pages/Wishlist';
import OfflineOverlay from './components/OfflineOverlay';
import ScrollToTop from './components/ScrollToTop';

function App() {

  return (
    <>
      <OfflineOverlay />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            borderRadius: '0px',
            background: '#000',
            color: '#fff',
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            padding: '16px 24px',
            border: 'none',
          },
          success: {
            iconTheme: { primary: '#fff', secondary: '#000' }
          },
          error: {
            style: { background: '#ef4444', color: '#fff' },
            iconTheme: { primary: '#fff', secondary: '#ef4444' }
          }
        }}
      />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/faq' element={<FaqPage />} />
          <Route path='/privacy' element={<Privacy />} />
          <Route path='/terms' element={<Terms />} />
          <Route path='/about' element={<About />} />
          <Route path='/signin' element={<><Home /><SignIn /></>} />
          <Route path='/signup' element={<><Home /><SignUp /></>} />
          <Route path='/forgot-password' element={<><Home /><ForgotPassword /></>} />

          <Route element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/checkout' element={<Checkout />} />
            <Route path='/payment' element={<About />} />
            <Route path='/paymentsuccess' element={<PaymentSuccess />} />
            <Route path='/wishlist' element={<Wishlist />} />
          </Route>

          <Route element={<OnlyAdminPrivateRoute />}>
            <Route path='/dashboard/*' element={<Dashboard />} />
          </Route>
          <Route path="/categories/:categoryId" element={<ProductListPage />} />
          <Route path="/category/:categoryName" element={<CategoryProductsPage />} />
          <Route path="/products/:productId" element={<ProductDescription />} />
          <Route path='/addressform' element={<AddressForm />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/explore" element={<CategoryProductsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
