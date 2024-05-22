import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOrdersFailure, getOrdersStart, getOrdersSuccess, updateOrderStatusFailure, updateOrderStatusStart, updateOrderStatusSuccess } from '../redux/slices/orderSlice';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

function MyOrders() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user)
  const userId = currentUser._id;
  const { orders, loading, error } = useSelector((state) => state.order)
  useEffect(() => {
    getAllOrders(userId)
  }, [userId])

  const getAllOrders = async (userId) => {
    dispatch(getOrdersStart())
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/getorders/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      if (!res.ok) { throw new Error("invalid response: ", res) }
      const data = await res.json()
      dispatch(getOrdersSuccess(data))
    } catch (error) {
      dispatch(getOrdersFailure(error.message))
    }
  }

  const handleCancelOrder = async (orderId) => {
    dispatch(updateOrderStatusStart());
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/updatestatus/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      })
      if (!res.ok) { console.log("invalid response: ", res) }
      // Assuming successful response means the status was updated
      dispatch(updateOrderStatusSuccess({ orderId, status: 'cancelled' }))
    } catch (error) {
      dispatch(updateOrderStatusFailure(error.message))
    }
  }

  return (
    <>
      <Header />
      <div className="container mx-auto mt-8 px-4 sm:px-0">
        <h2 className="text-3xl font-bold mb-4">My Orders</h2>
        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {orders && Object.keys(orders).length > 0 ? (
          <div>
            {Object.values(orders).map((order) => (
              <div key={order._id} className="my-6 border relative border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-gray-200 rounded-full px-4 py-2 text-md font-semibold">
                    Order ID: {order._id}
                  </div>
                  <p className="text-sm text-gray-500">Order Placed on: {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(order.orderDate))}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.products && order.products.length > 0 && order.products.map((product) => {
                    const { productId } = product;
                    return (
                      <div key={product._id} className="border border-gray-300 rounded-lg p-4 flex md:gap-10 md:flex-row flex-col md:items-start items-center justify-around">
                        <Link to={`/products/${productId._id}`} className='md:flex'>
                          <img src={productId.image[0] || "../../ErrorImage.png"} alt="product" className="w-24 h-24 object-cover mb-2 md:mr-20" />
                          <div className="text-center">
                            <p className="font-semibold">{productId.name}</p>
                            <p>Quantity: {product.quantity}</p>
                            <p>Price: ₹{productId.price}</p>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                  <button onClick={() => handleCancelOrder(order._id)} className='text-white px-4 py-2 bg-red-500 absolute bottom-5 right-5 rounded-xl'>Cancel</button>
                </div>
                <p className="mt-4">Order Status: {order.status}</p>
                <p className="font-bold mt-2">Total Amount: ₹{order.totalAmount}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No orders found.</p>
        )}
      </div >
    </>
  );
}

export default MyOrders