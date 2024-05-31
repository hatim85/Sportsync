import React from 'react'
import ProductDescription from './pages/product/ProductDescription';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from './pages/About';
import Profile from './pages/user/Profile';
import Cart from './pages/Cart';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/admin/Dashboard';
import ProductListPage from './pages/product/ProductListPage';
import SearchPage from './pages/SearchPage';
import FaqPage from './pages/FAQPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute';
import AddressForm from './pages/AddressForm';
import PaymentSuccess from './pages/PaymentSuccess';
import MyOrders from './pages/MyOrders';
import NotFound from './pages/NotFound';
function App() {

  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/faq' element={<FaqPage />} />
          <Route path='/privacy' element={<Privacy />} />
          <Route path='/terms' element={<Terms />} />
          <Route path='/about' element={<About />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/cart' element={<Cart />} />
          <Route element={<OnlyAdminPrivateRoute />}>
            <Route path='/dashboard/*' element={<Dashboard />} />
          </Route>
          <Route path="/categories/:categoryId" element={<ProductListPage />} />
          <Route path="/products/:productId" element={<ProductDescription />} />
          <Route path='/addressform' element={<AddressForm/>} />
          <Route path="/search" element={<SearchPage />} />
          <Route path='/payment' element={<About/>}/>
          <Route path='/paymentsuccess' element={<PaymentSuccess/>} />
          <Route path='/myorders' element={<MyOrders/>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
