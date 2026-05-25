import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess
} from '../../redux/slices/userSlice.js'
import {
  getOrdersFailure,
  getOrdersStart,
  getOrdersSuccess,
  updateOrderStatusFailure,
  updateOrderStatusStart,
  updateOrderStatusSuccess
} from '../../redux/slices/orderSlice';
import {
  fetchAddressesStart,
  fetchAddressesSuccess,
  fetchAddressesFailure,
  deleteAddressStart,
  deleteAddressSuccess,
  deleteAddressFailure,
  addAddressStart,
  addAddressSuccess,
  addAddressFailure,
  swapDefaultAddress
} from '../../redux/slices/addressSlice';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  formatCustomerDeliveryDate,
  canCancelOrder,
  canCancelReturn,
  shouldShowDeliveryEstimate,
  formatDeliveredOn,
} from '../../utils/orderStatus.js';
import Header from '../../components/Header.jsx';
import ReturnRequestModal from '../../components/ReturnRequestModal.jsx';
import OrderReviewModal from '../../components/OrderReviewModal.jsx';
import toast from 'react-hot-toast';
import { FaUser, FaBoxOpen, FaMapMarkerAlt, FaChevronRight, FaTimes, FaSignOutAlt, FaPlus } from 'react-icons/fa';

/** Typography aligned with Sportsync header / filter UI */
const ui = {
  eyebrow: 'text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1',
  pageTitle: 'text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground',
  cardHeader: 'text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground',
  sectionLabel: 'text-[10px] font-black uppercase tracking-[0.2em] text-foreground',
  body: 'text-sm text-muted-foreground leading-relaxed',
  bodyStrong: 'text-sm font-bold text-foreground',
  linkBtn: 'text-[10px] font-black uppercase tracking-[0.12em] border-b border-primary pb-0.5 text-foreground hover:text-primary transition-colors',
  actionBtn: 'text-[10px] font-black uppercase tracking-[0.12em]',
  input: 'w-full border-b border-border py-2.5 outline-none focus:border-primary transition-colors bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground',
  inputLabel: 'text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground',
};

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector(state => state.user);
  const { orders, loading: ordersLoading } = useSelector((state) => state.order);
  const { addresses, loading: addressLoading } = useSelector((state) => state.address);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'dashboard';

  const [showAddForm, setShowAddForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', addressLine1: '', addressLine2: '',
    city: '', postalCode: '', country: '', phoneNumber: ''
  });

  useEffect(() => {
    if (currentUser?._id) {
      fetchOrders();
      fetchAddresses();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    dispatch(getOrdersStart())
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/getorders/${currentUser._id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      dispatch(getOrdersSuccess(Array.isArray(data) ? data : []));
    } catch (error) {
      dispatch(getOrdersFailure(error.message));
    }
  };

  const handleCancelReturn = async (orderId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/${orderId}/return/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not cancel return');
      toast.success('Return cancelled. Your order is delivered again.');
      fetchOrders();
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
      toast.success('Return requested. We will schedule pickup soon.');
      setReturnModal(null);
      fetchOrders();
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
          userId: currentUser._id,
          productId: reviewModal.productId,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Review failed');
      toast.success('Thank you for your review!');
      setReviewModal(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const fetchAddresses = async () => {
    dispatch(fetchAddressesStart());
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/address/${currentUser._id}`);
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      dispatch(fetchAddressesSuccess(data));
    } catch (error) {
      dispatch(fetchAddressesFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/signout`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message)
      } else {
        dispatch(signoutSuccess());
        localStorage.removeItem('user');
        toast.success("Signed Out Successfully")
        navigate('/')
      }
    } catch (error) {
      toast.error(error.message)
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
      if (!res.ok) throw new Error('Failed to cancel order');
      dispatch(updateOrderStatusSuccess({ orderId, status: 'cancelled' }))
      toast.success('Order cancelled');
    } catch (error) {
      dispatch(updateOrderStatusFailure(error.message))
    }
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  const handleAddressDelete = async (addressId) => {
    dispatch(deleteAddressStart());
    try {
      const response = await fetch(`${import.meta.env.VITE_PORT}/api/user/deleteaddress/${addressId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete address');
      dispatch(deleteAddressSuccess(addressId));
      toast.success('Address removed');
    } catch (error) {
      dispatch(deleteAddressFailure(error.message));
    }
  };

  const handleMakeDefault = (idx) => {
    // idx is 1-based relative to the additional addresses (slice(1)), so actual index = idx + 1
    dispatch(swapDefaultAddress(idx + 1));
    toast.success('Default address updated');
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    dispatch(addAddressStart());
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/createaddress/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add address');
      const data = await res.json();
      dispatch(addAddressSuccess(data));
      toast.success('Address added');
      setShowAddForm(false);
      setFormData({ fullName: '', addressLine1: '', addressLine2: '', city: '', postalCode: '', country: '', phoneNumber: '' });
      fetchAddresses();
    } catch (err) {
      dispatch(addAddressFailure(err.message));
      toast.error('Could not save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 px-1">My Account</p>
            <nav className="bg-card border border-border rounded-lg overflow-hidden">
              {[
                { id: 'dashboard', label: 'Profile', icon: FaUser },
                { id: 'orders', label: 'Orders', icon: FaBoxOpen },
                { id: 'addresses', label: 'Address Book', icon: FaMapMarkerAlt },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => navigate(`/profile?tab=${id}`)}
                  className={`flex items-center justify-between w-full px-5 py-4 transition-all border-l-4 ${
                    currentTab === id
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 ${currentTab === id ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-[11px] sm:text-xs font-black uppercase tracking-[0.12em] ${currentTab === id ? 'text-foreground' : ''}`}>
                      {label}
                    </span>
                  </div>
                  <FaChevronRight className={`h-2.5 w-2.5 shrink-0 ${currentTab === id ? 'text-primary' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-grow min-h-[500px] bg-card border border-border rounded-lg p-6 md:p-10">
            {currentTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-border pb-6">
                  <div>
                    <p className={ui.eyebrow}>Account</p>
                    <h2 className={ui.pageTitle}>My Dashboard</h2>
                  </div>
                  <button onClick={handleSignout} className={`bg-primary text-primary-foreground px-8 py-3 rounded-sm hover:opacity-90 transition-all w-fit ${ui.actionBtn}`}>Logout</button>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-secondary px-6 py-4 border-b border-border">
                    <h3 className={ui.cardHeader}>Account Information</h3>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h4 className={ui.sectionLabel}>Contact Information</h4>
                      <div className={`${ui.body} space-y-1`}>
                        <p className={`${ui.bodyStrong} mb-2`}>{currentUser.username}</p>
                        <p>{currentUser.email}</p>
                        <p>{currentUser.phone || 'No phone number provided'}</p>
                      </div>
                      <div className="pt-2 flex space-x-4">
                        <button className={ui.linkBtn}>Edit</button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className={ui.sectionLabel}>Newsletters</h4>
                      <p className={ui.body}>You aren&apos;t subscribed to our newsletter.</p>
                      <button className={ui.linkBtn}>Edit</button>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-secondary px-6 py-4 border-b border-border flex justify-between items-center gap-4">
                    <h3 className={ui.cardHeader}>Address Book</h3>
                    <button onClick={() => navigate('/profile?tab=addresses')} className={`${ui.actionBtn} text-muted-foreground hover:text-primary border-b border-border hover:border-primary pb-0.5 transition-all shrink-0`}>Manage Addresses</button>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                      <h4 className={`${ui.sectionLabel} mb-4`}>Default Billing Address</h4>
                      {addresses.length > 0 ? (
                        <div className={`${ui.body} space-y-1`}>
                          <p className={ui.bodyStrong}>{addresses[0].fullName}</p>
                          <p>{addresses[0].addressLine1}</p>
                          <p>{addresses[0].city}, {addresses[0].postalCode}</p>
                          <p>{addresses[0].country}</p>
                        </div>
                      ) : (
                        <p className={ui.body}>You have not set a default billing address.</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <h4 className={`${ui.sectionLabel} mb-4`}>Default Shipping Address</h4>
                      {addresses.length > 0 ? (
                        <div className={`${ui.body} space-y-1`}>
                          <p className={ui.bodyStrong}>{addresses[0].fullName}</p>
                          <p>{addresses[0].addressLine1}</p>
                          <p>{addresses[0].city}, {addresses[0].postalCode}</p>
                          <p>{addresses[0].country}</p>
                        </div>
                      ) : (
                        <p className={ui.body}>You have not set a default shipping address.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'orders' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-border pb-6">
                  <p className={ui.eyebrow}>Purchases</p>
                  <h2 className={ui.pageTitle}>My Orders</h2>
                </div>

                {ordersLoading ? (
                  <p className={`${ui.body} text-center py-20 uppercase tracking-[0.15em] font-black text-[10px]`}>Loading history...</p>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-border bg-secondary/30 p-6 rounded-lg space-y-6">
                        <div className="flex flex-col md:flex-row justify-between pb-4 border-b border-border gap-4">
                          <div className="space-y-1">
                            <p className={`${ui.actionBtn} text-muted-foreground`}>Order ID: <span className="text-foreground font-mono text-[11px]">{order._id}</span></p>
                            {(order.paymentMethod === 'online' || order.razorpay_order_id) && (
                              <div className="flex flex-col gap-1 mt-2 mb-3 p-3 bg-blue-50 border border-blue-100 rounded-sm w-fit">
                                <p className="text-[10px] font-bold tracking-widest text-blue-800"><span className="uppercase">Razorpay Order:</span> <span className="font-mono text-blue-600">{order.razorpay_order_id}</span></p>
                                {order.paymentId?.razorpay_payment_id && (
                                  <p className="text-[10px] font-bold tracking-widest text-blue-800"><span className="uppercase">Razorpay Payment:</span> <span className="font-mono text-blue-600">{order.paymentId.razorpay_payment_id}</span></p>
                                )}
                              </div>
                            )}
                            <p className={ui.body}>
                              Placed on {new Date(order.orderDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                              {' '}• Method: <span className="uppercase font-black text-[11px] text-foreground">{order.paymentMethod || 'COD'}</span>
                            </p>
                            {shouldShowDeliveryEstimate(order.status) ? (
                              <p className={`${ui.bodyStrong} mt-2`}>
                                Delivery by {formatCustomerDeliveryDate(order.expectedDeliveryDate)}
                              </p>
                            ) : formatDeliveredOn(order.deliveredAt || order.expectedDeliveryDate) ? (
                              <p className={`${ui.bodyStrong} mt-2 text-green-700`}>
                                Delivered on {formatDeliveredOn(order.deliveredAt || order.expectedDeliveryDate)}
                              </p>
                            ) : null}
                            <p className="mt-2">
                              <span className={`uppercase font-black text-[11px] ${STATUS_COLORS[order.status] || 'text-foreground'}`}>
                                {STATUS_LABELS[order.status] || order.status}
                              </span>
                            </p>
                            {order.refundNote && (
                              <p className="text-[11px] text-emerald-700 mt-2 font-bold">{order.refundNote}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-xl font-black text-foreground">₹{order.totalAmount}</p>
                            {canCancelOrder(order.status) && (
                              <button onClick={() => { setOrderToCancel(order._id); setShowCancelModal(true); }} className={`${ui.actionBtn} text-red-500 border-b border-red-200 hover:border-red-500`}>Cancel Order</button>
                            )}
                            {order.canReturn && (
                              <button
                                type="button"
                                onClick={() => setReturnModal({ orderId: order._id })}
                                className={`${ui.actionBtn} text-amber-700 border-b border-amber-200 hover:border-amber-600`}
                              >
                                Request Return
                              </button>
                            )}
                            {(order.canCancelReturn || canCancelReturn(order.status)) && (
                              <button
                                type="button"
                                onClick={() => handleCancelReturn(order._id)}
                                className={`${ui.actionBtn} text-muted-foreground border-b border-border hover:text-foreground`}
                              >
                                Cancel Return
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {order.products?.map((item, idx) => {
                            const coverIdx = item.productId?.coverImageIndex ?? 0;
                            const filename = item.productId?.image?.[coverIdx] || item.productId?.image?.[0];
                            const displayImg = filename ? (filename.includes('cloudinary.com') ? filename : `/${filename.split(/[\\/]/).pop()}`) : '/ErrorImage.png';
                            return (
                              <div key={idx} className="flex gap-4 items-center bg-secondary/50 p-3 relative group">
                                <img src={displayImg} className="w-16 h-16 object-contain bg-card border border-border" />
                                <div className="space-y-0.5">
                                  <p className={ui.bodyStrong}>{item.productId?.name || 'Product'}</p>
                                  <div className={`flex flex-wrap gap-x-3 gap-y-0.5 ${ui.actionBtn} text-muted-foreground`}>
                                    {item.size && <span>Size: {item.size}</span>}
                                    {item.metalType && (
                                      <span>
                                        Metal: {
                                          item.metalType === 'SS' ? '925 Silver' :
                                            item.metalType === 'RS' ? 'Rose Silver' :
                                              item.metalType === 'YS' ? 'Yellow Silver' :
                                                item.metalType
                                        }
                                      </span>
                                    )}
                                    {item.engraving && <span className="text-blue-600 bg-blue-50 px-2 rounded-sm border border-blue-100">"{item.engraving}"</span>}
                                    {item.stone && (
                                      <span className={`px-2 rounded-sm border whitespace-nowrap ${
                                        item.stone.toLowerCase().includes('ruby') ? 'text-red-600 bg-red-50 border-red-100' :
                                        item.stone.toLowerCase().includes('emerald') ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                        item.stone.toLowerCase().includes('sapphire') && !item.stone.toLowerCase().includes('pink') ? 'text-blue-600 bg-blue-50 border-blue-100' :
                                        item.stone.toLowerCase().includes('citrine') ? 'text-amber-600 bg-amber-50 border-amber-100' :
                                        item.stone.toLowerCase().includes('amethyst') ? 'text-purple-600 bg-purple-50 border-purple-100' :
                                        item.stone.toLowerCase().includes('pink') ? 'text-pink-600 bg-pink-50 border-pink-100' :
                                        item.stone.toLowerCase().includes('black') ? 'text-foreground bg-secondary border-border' :
                                        'text-muted-foreground bg-secondary border-border'
                                      }`}>
                                        {item.stone}
                                      </span>
                                    )}
                                    {item.finish && <span className="text-amber-600 bg-amber-50 px-2 rounded-sm border border-amber-100 whitespace-nowrap">{item.finish}</span>}
                                  </div>
                                  <p className={ui.body}>Qty: {item.quantity} × ₹{item.unitPriceAtPurchase}</p>
                                  {order.status === 'delivered' &&
                                    item.productId?._id &&
                                    !(order.reviewedProductIds || []).includes(String(item.productId._id)) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReviewModal({
                                          orderId: order._id,
                                          productId: item.productId._id,
                                          productName: item.productId?.name || 'Product',
                                        })
                                      }
                                      className={`${ui.linkBtn} mt-2 inline-block`}
                                    >
                                      Rate & Review
                                    </button>
                                  )}
                                  <Link
                                    to={`/products/${item.productId?._id}`}
                                    className={`${ui.actionBtn} text-muted-foreground hover:text-primary mt-1 inline-block`}
                                  >
                                    View Product
                                  </Link>
                                  {/* <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mt-2">
                                    Est. Delivery: {(() => {
                                      const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();
                                      const displayDate = order.expectedDeliveryDate 
                                        ? new Date(order.expectedDeliveryDate) 
                                        : new Date(orderDate.getTime() + 10 * 24 * 60 * 60 * 1000);
                                      return displayDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                    })()}
                                  </p> */}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-border border-dashed rounded-sm">
                    <p className={`${ui.body} uppercase tracking-[0.15em] font-black text-[10px] text-center`}>You have placed no order.</p>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'addresses' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="border-b border-border pb-6">
                  <p className={ui.eyebrow}>Delivery</p>
                  <h2 className={ui.pageTitle}>Address Book</h2>
                </div>

                {/* Default Address */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-secondary px-6 py-4 border-b border-border">
                    <h3 className={ui.cardHeader}>Default Address</h3>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                      <h4 className={`${ui.sectionLabel} mb-4`}>Default Billing Address</h4>
                      {addresses.length > 0 ? (
                        <div className={`${ui.body} space-y-1`}>
                          <p className={ui.bodyStrong}>{addresses[0].fullName}</p>
                          <p>{addresses[0].addressLine1}</p>
                          {addresses[0].addressLine2 && <p>{addresses[0].addressLine2}</p>}
                          <p>{addresses[0].city}, {addresses[0].postalCode}</p>
                          <p>{addresses[0].country}</p>
                          <p>{addresses[0].phoneNumber}</p>
                        </div>
                      ) : (
                        <p className={ui.body}>You have not set a default billing address.</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <h4 className={`${ui.sectionLabel} mb-4`}>Default Shipping Address</h4>
                      {addresses.length > 0 ? (
                        <div className={`${ui.body} space-y-1`}>
                          <p className={ui.bodyStrong}>{addresses[0].fullName}</p>
                          <p>{addresses[0].addressLine1}</p>
                          {addresses[0].addressLine2 && <p>{addresses[0].addressLine2}</p>}
                          <p>{addresses[0].city}, {addresses[0].postalCode}</p>
                          <p>{addresses[0].country}</p>
                          <p>{addresses[0].phoneNumber}</p>
                        </div>
                      ) : (
                        <p className={ui.body}>You have not set a default shipping address.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Addresses */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-secondary px-6 py-4 border-b border-border">
                    <h3 className={ui.cardHeader}>Additional Addresses</h3>
                  </div>
                  <div className="p-8">
                    {addresses.length > 1 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.slice(1).map((addr, idx) => (
                          <div key={addr._id} className="relative p-6 border border-border rounded-lg group hover:border-primary/30 transition-all space-y-4">
                            <button
                              onClick={() => handleAddressDelete(addr._id)}
                              className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <FaTimes className="h-3.5 w-3.5" />
                            </button>

                            <div className={`${ui.body} space-y-1 pr-6`}>
                              <p className={ui.bodyStrong}>{addr.fullName}</p>
                              <p>{addr.addressLine1}</p>
                              {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                              <p>{addr.city}, {addr.postalCode}</p>
                              <p>{addr.country}</p>
                              <p>{addr.phoneNumber}</p>
                            </div>

                            <button
                              onClick={() => handleMakeDefault(idx)}
                              className={`${ui.linkBtn} text-muted-foreground border-border hover:border-primary`}
                            >
                              Make Default
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={ui.body}>No additional addresses found.</p>
                    )}
                  </div>
                </div>

                {/* Add Address Button */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className={`flex items-center space-x-3 bg-primary text-primary-foreground px-8 py-4 rounded-sm hover:opacity-90 transition-all shadow-lg ${ui.actionBtn}`}
                  >
                    <FaPlus className="h-3 w-3" />
                    <span>Add New Address</span>
                  </button>
                  <Link to="/" className={`${ui.actionBtn} text-muted-foreground hover:text-primary transition-colors`}>Back</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Add Address Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-card w-full max-w-lg mx-4 shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh] rounded-lg border border-border font-sans">
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
              <div>
                <p className={ui.eyebrow}>Delivery</p>
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">New Delivery Address</h2>
              </div>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="px-8 py-6 space-y-5">
              <div className="space-y-1">
                <label className={ui.inputLabel}>Full Name</label>
                <input
                  name="fullName" value={formData.fullName} onChange={handleFormChange}
                  placeholder="Recipient's full name" required
                  className={ui.input}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={ui.inputLabel}>Phone</label>
                  <input
                    name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange}
                    placeholder="+91..." required
                    className={ui.input}
                  />
                </div>
                <div className="space-y-1">
                  <label className={ui.inputLabel}>Postal Code</label>
                  <input
                    name="postalCode" value={formData.postalCode} onChange={handleFormChange}
                    placeholder="Pincode" required
                    className={ui.input}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={ui.inputLabel}>Address Line 1</label>
                <input
                  name="addressLine1" value={formData.addressLine1} onChange={handleFormChange}
                  placeholder="House No., Building, Street" required
                  className={ui.input}
                />
              </div>

              <div className="space-y-1">
                <label className={ui.inputLabel}>Address Line 2 (Optional)</label>
                <input
                  name="addressLine2" value={formData.addressLine2} onChange={handleFormChange}
                  placeholder="Locality, Landmark"
                  className={ui.input}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={ui.inputLabel}>City</label>
                  <input
                    name="city" value={formData.city} onChange={handleFormChange}
                    placeholder="City" required
                    className={ui.input}
                  />
                </div>
                <div className="space-y-1">
                  <label className={ui.inputLabel}>Country</label>
                  <input
                    name="country" value={formData.country} onChange={handleFormChange}
                    placeholder="Country" required
                    className={ui.input}
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 bg-primary text-primary-foreground py-4 hover:opacity-90 transition-all disabled:opacity-50 ${ui.actionBtn}`}
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`px-6 border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-all ${ui.actionBtn}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card p-6 md:p-8 border border-border shadow-xl w-full max-w-sm relative animate-fadeIn">
            <h3 className={`${ui.cardHeader} text-foreground mb-4 text-center border-b border-border pb-4`}>
              Cancel Order?
            </h3>
            <p className={`${ui.body} mb-8 text-center`}>
              Are you sure you want to cancel this order? If you paid online securely, your refund will be automatically initiated to the source account.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => { setShowCancelModal(false); setOrderToCancel(null); }}
                className={`flex-1 bg-card border border-border text-foreground py-3 hover:bg-secondary transition-colors disabled:opacity-50 ${ui.actionBtn}`}
              >
                No
              </button>
              <button
                onClick={() => handleCancelOrder(orderToCancel)}
                className={`flex-1 bg-primary text-primary-foreground py-3 hover:opacity-90 transition-colors disabled:opacity-50 ${ui.actionBtn}`}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
