import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOrdersFailure, getOrdersStart, getOrdersSuccess, updateOrderStatusFailure, updateOrderStatusStart, updateOrderStatusSuccess } from '../redux/slices/orderSlice';
import Header from '../components/Header';
import ReturnRequestModal from '../components/ReturnRequestModal';
import OrderReviewModal from '../components/OrderReviewModal';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  formatCustomerDeliveryDate,
  canCancelOrder,
  canCancelReturn,
  shouldShowDeliveryEstimate,
  formatDeliveredOn,
} from '../utils/orderStatus.js';

function MyOrders() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user)
  const userId = currentUser._id;
  const { orders, loading, error } = useSelector((state) => state.order)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    getAllOrders(userId)
  }, [userId])

  const getAllOrders = async (userId) => {
    dispatch(getOrdersStart())
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/getorders/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) { throw new Error("invalid response: ", res) }
      const data = await res.json()
      dispatch(getOrdersSuccess(Array.isArray(data) ? data : []))
    } catch (error) {
      dispatch(getOrdersFailure(error.message))
    }
  }

  const handleCancelOrder = async (orderId) => {
    dispatch(updateOrderStatusStart());
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/cancel/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) { console.log("invalid response: ", res) }
      // Assuming successful response means the status was updated
      dispatch(updateOrderStatusSuccess({ orderId, status: 'cancelled' }))
    } catch (error) {
      dispatch(updateOrderStatusFailure(error.message))
    }
    setShowCancelModal(false);
    setOrderToCancel(null);
    getAllOrders(userId);
  }

  const handleCancelReturn = async (orderId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/${orderId}/return/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not cancel return');
      toast.success('Return cancelled.');
      getAllOrders(userId);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitReturnRequest = async (reason) => {
    if (!returnModal?.orderId) return;
    setReturnSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/${returnModal.orderId}/return`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Return request failed');
      toast.success('Return requested.');
      setReturnModal(null);
      getAllOrders(userId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReturnSubmitting(false);
    }
  };

  const submitReview = async ({ rating, comment }) => {
    if (!reviewModal) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/reviews/order/${reviewModal.orderId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: reviewModal.productId,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Review failed');
      toast.success('Thank you for your review!');
      setReviewModal(null);
      getAllOrders(userId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const orderList = Array.isArray(orders) ? orders : [];

  return (
    <>
      <Header />
      <div className="container mx-auto mt-8 px-4 sm:px-0">
        <h2 className="text-3xl font-bold mb-4">My Orders</h2>
        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {orderList.length > 0 ? (
          <div>
            {orderList
              .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
              .map((order) => (
                <div key={order._id} className="my-6 border relative border-gray-300 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col gap-2">
                      <div className="bg-gray-200 rounded-full px-4 py-2 text-md font-semibold">
                        Order ID: {order._id}
                      </div>
                      {(order.paymentMethod === 'online' || order.razorpay_order_id) && (
                        <div className="flex flex-col gap-1 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="text-[10px] font-bold tracking-widest text-blue-800"><span className="uppercase">Razorpay Order:</span> <span className="font-mono text-blue-600">{order.razorpay_order_id}</span></p>
                          {order.paymentId?.razorpay_payment_id && (
                            <p className="text-[10px] font-bold tracking-widest text-blue-800"><span className="uppercase">Razorpay Payment:</span> <span className="font-mono text-blue-600">{order.paymentId.razorpay_payment_id}</span></p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm text-muted-foreground">
                        Order Placed on:{' '}
                        {new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(
                          new Date(order.orderDate)
                        )}
                      </p>
                      {shouldShowDeliveryEstimate(order.status) ? (
                        <p className="text-sm font-bold text-foreground mt-1">
                          Delivery by {formatCustomerDeliveryDate(order.expectedDeliveryDate)}
                        </p>
                      ) : formatDeliveredOn(order.deliveredAt || order.expectedDeliveryDate) ? (
                        <p className="text-sm font-bold text-green-700 mt-1">
                          Delivered on {formatDeliveredOn(order.deliveredAt || order.expectedDeliveryDate)}
                        </p>
                      ) : null}
                      <p className={`text-sm font-bold mt-1 ${STATUS_COLORS[order.status] || ''}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </p>
                      {order.refundNote && (
                        <p className="text-xs text-emerald-700 mt-1">{order.refundNote}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {order.products &&
                      order.products.length > 0 &&
                      order.products.map((product) => {
                        const { productId } = product;
                        // Debug: log productId structure
                        console.log('MyOrders productId:', productId);
                        return (
                          <div
                            key={product._id}
                            className="border border-gray-300 rounded-lg p-4 flex md:gap-10 md:flex-row flex-col md:items-start items-center justify-around"
                          >
                            <Link to={`/products/${productId._id}`} className="md:flex">
                              <img
                                src={(() => {
                                  const coverIdx = productId?.coverImageIndex ?? 0;
                                  const filename = productId?.image?.[coverIdx] || productId?.image?.[0];
                                  console.log('MyOrders productId.image:', productId?.image, 'filename chosen:', filename);
                                  return filename ? `${import.meta.env.VITE_PORT}/${filename}` : '/ErrorImage.png';
                                })()}
                                alt="product"
                                className="w-24 h-24 object-cover mb-2 md:mr-20"
                                onError={(e) => { console.log('MyOrders failed to load image'); e.target.src = '/ErrorImage.png'; }}
                              />
                              <div className="text-center md:text-left">
                                <p className="font-semibold">{productId.name}</p>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {product.size && <p>Size: {product.size}</p>}
                                  {product.metalType && (
                                    <p>
                                      Metal: {
                                        product.metalType === 'SS' ? '925 Silver' :
                                        product.metalType === 'RS' ? 'Rose Silver' :
                                        product.metalType === 'YS' ? 'Yellow Silver' :
                                        product.metalType
                                      }
                                    </p>
                                  )}
                                  {product.quantity && <p>Quantity: {product.quantity}</p>}
                                  {product.unitPriceAtPurchase && <p>Price: ₹{product.unitPriceAtPurchase}</p>}
                                  {product.engraving && <p className="text-blue-600 italic font-sans font-black italic tracking-tighter uppercase">Engraving: "{product.engraving}"</p>}
                                  {product.stone && (
                                    <p className={`font-medium ${
                                      product.stone.toLowerCase().includes('ruby') ? 'text-red-600' :
                                      product.stone.toLowerCase().includes('emerald') ? 'text-emerald-600' :
                                      product.stone.toLowerCase().includes('sapphire') && !product.stone.toLowerCase().includes('pink') ? 'text-blue-600' :
                                      product.stone.toLowerCase().includes('citrine') ? 'text-amber-600' :
                                      product.stone.toLowerCase().includes('amethyst') ? 'text-purple-600' :
                                      product.stone.toLowerCase().includes('pink') ? 'text-pink-600' :
                                      product.stone.toLowerCase().includes('black') ? 'text-foreground' :
                                      'text-muted-foreground'
                                    }`}>
                                      Stone: {product.stone}
                                    </p>
                                  )}
                                  {product.finish && <p className="text-amber-600">Finish: {product.finish}</p>}
                                </div>
                                {order.status === 'delivered' &&
                                  productId?._id &&
                                  !(order.reviewedProductIds || []).includes(String(productId._id)) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReviewModal({
                                        orderId: order._id,
                                        productId: productId._id,
                                        productName: productId?.name || 'Product',
                                      })
                                    }
                                    className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary pb-0.5 hover:opacity-80"
                                  >
                                    Rate & Review
                                  </button>
                                )}
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    <div className="flex flex-col gap-2 absolute bottom-5 right-5">
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => { setOrderToCancel(order._id); setShowCancelModal(true); }}
                          className="text-primary-foreground px-4 py-2 bg-red-500 rounded-xl uppercase tracking-widest text-[10px] md:text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.canReturn && (
                        <button
                          type="button"
                          onClick={() => setReturnModal({ orderId: order._id })}
                          className="px-4 py-2 bg-amber-500 text-white rounded-xl uppercase tracking-widest text-[10px] font-bold hover:bg-amber-600"
                        >
                          Request Return
                        </button>
                      )}
                      {(order.canCancelReturn || canCancelReturn(order.status)) && (
                        <button
                          type="button"
                          onClick={() => handleCancelReturn(order._id)}
                          className="px-4 py-2 bg-card border border-border text-foreground rounded-xl uppercase tracking-widest text-[10px] font-bold hover:bg-secondary"
                        >
                          Cancel Return
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="font-bold mt-2">Total Amount: ₹{order.totalAmount}</p>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No orders found.</p>
        )}
      </div >

      <ReturnRequestModal
        open={!!returnModal}
        onClose={() => !returnSubmitting && setReturnModal(null)}
        onSubmit={submitReturnRequest}
        submitting={returnSubmitting}
      />

      <OrderReviewModal
        open={!!reviewModal}
        onClose={() => !reviewSubmitting && setReviewModal(null)}
        onSubmit={submitReview}
        submitting={reviewSubmitting}
        productName={reviewModal?.productName}
      />

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary bg-opacity-40 backdrop-blur-sm">
          <div className="bg-card p-6 md:p-8 border border-border shadow-xl w-full max-w-sm relative">
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-foreground mb-4 text-center border-b border-border pb-4">
              Cancel Order?
            </h3>
            <p className="text-xs text-muted-foreground mb-8 text-center leading-relaxed">
              Are you sure you want to cancel this order? If you paid online securely, your refund will be automatically initiated to the source account.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => { setShowCancelModal(false); setOrderToCancel(null); }}
                className="flex-1 bg-card border border-border text-foreground font-bold py-3 uppercase tracking-[0.2em] text-[10px] hover:bg-secondary transition-colors disabled:opacity-50"
              >
                No
              </button>
              <button
                onClick={() => handleCancelOrder(orderToCancel)}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 uppercase tracking-[0.2em] text-[10px] hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyOrders
