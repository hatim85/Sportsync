import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllAdminOrdersStart, getAllAdminOrdersSuccess, getAllAdminOrdersFailure } from '../../redux/slices/orderSlice';
import {
  STATUS_LABELS,
  formatExpectedDelivery,
  canCancelOrder,
  shouldShowDeliveryEstimate,
  formatDeliveredOn,
} from '../../utils/orderStatus.js';

const ADMIN_STATUSES = [
  'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered',
  'return_requested', 'return_approved', 'return_pickup_scheduled', 'return_picked_up', 'refunded', 'cancelled',
];

function Order() {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.order);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalOrders, setTotalOrders] = useState(0)
    const [paymentAlerts, setPaymentAlerts] = useState([])
    const pageSize = 10

    useEffect(() => {
        fetchAllOrders(currentPage)
        fetchPaymentAlerts()
        return () => {
            dispatch(getAllAdminOrdersSuccess([]))
        }
    }, [currentPage])

    const fetchPaymentAlerts = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/admin/payment-alerts`, {
                credentials: 'include',
            });
            if (!res.ok) return;
            const data = await res.json();
            setPaymentAlerts(data.alerts || []);
        } catch (e) {
            console.error('Payment alerts fetch failed', e);
        }
    }

    const resolveAlert = async (alertId) => {
        try {
            await fetch(`${import.meta.env.VITE_PORT}/api/admin/payment-alerts/${alertId}/resolve`, {
                method: 'PATCH',
                credentials: 'include',
            });
            fetchPaymentAlerts();
        } catch (e) {
            console.error(e);
        }
    }

    const fetchAllOrders = async (page) => {
        dispatch(getAllAdminOrdersStart())
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/getadminorders?page=${page}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            })
            if (!res.ok) { throw new Error("invalid response: ", res) }
            const data = await res.json()
            setTotalOrders(data.totalOrders)
            dispatch(getAllAdminOrdersSuccess(data))
        } catch (error) {
            dispatch(getAllAdminOrdersFailure(error.message))
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/updatestatus/${orderId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update status');
            fetchAllOrders(currentPage); // refresh list
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Failed to update order status');
        }
    }

    const nextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        setCurrentPage(currentPage - 1);
    };

    const renderPagination = () => {
        const disableNext = currentPage * pageSize >= totalOrders;
        return (
            <div className='w-[100%] flex justify-between items-center my-8 pt-6 border-t border-border'>
                <button 
                  className='bg-card border border-border text-foreground px-6 py-2 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-secondary transition-colors disabled:opacity-50' 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase"> Page {currentPage} </span>
                <button 
                  className='bg-primary text-primary-foreground px-6 py-2 rounded-sm text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-50' 
                  onClick={nextPage} 
                  disabled={currentPage * pageSize >= totalOrders}
                >
                  Next
                </button>
            </div>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {paymentAlerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-sm p-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-800">
                        Payment alerts ({paymentAlerts.length})
                    </p>
                    {paymentAlerts.map((alert) => (
                        <div key={alert._id} className="flex flex-wrap justify-between gap-2 text-sm text-red-900">
                            <span>
                                <strong className="uppercase text-[10px]">{alert.type}</strong>
                                {' — '}{alert.message}
                                {alert.orderId?._id && (
                                    <span className="text-red-700"> (Order {String(alert.orderId._id).slice(-8)})</span>
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={() => resolveAlert(alert._id)}
                                className="text-[10px] font-bold uppercase tracking-widest underline"
                            >
                                Mark resolved
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <h2 className="text-2xl font-serif italic text-foreground">Admin Orders</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}
            {orders && orders.map((order) => {
                console.log('Admin order:', order);
                return (
                <div key={order._id} className="bg-card border border-border rounded-sm p-6 mb-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-50">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order ID: <span className="text-foreground">{order._id}</span></p>
                            <p className="text-sm font-medium">User: {order.userId?.firstName ? `${order.userId.firstName} ${order.userId.lastName || ''}`.trim() : (order.userId?.username || 'N/A')} ({order.userId?.email || 'N/A'})</p>
                            <p className="text-xs text-muted-foreground">Order Date: {formatDate(order.orderDate)} • Method: <span className="uppercase font-bold text-foreground">{order.paymentMethod || 'COD'}</span></p>
                            {shouldShowDeliveryEstimate(order.status) ? (
                              <p className="text-xs font-semibold text-foreground pt-1">
                                Delivery {formatExpectedDelivery(order.expectedDeliveryDate)}
                              </p>
                            ) : formatDeliveredOn(order.deliveredAt || order.expectedDeliveryDate) ? (
                              <p className="text-xs font-semibold text-green-700 pt-1">
                                Delivered on {formatDeliveredOn(order.deliveredAt || order.expectedDeliveryDate)}
                              </p>
                            ) : null}
                            {order.returnReason && (
                              <p className="text-xs text-amber-700 mt-1">Return reason: {order.returnReason}</p>
                            )}
                            {order.refundNote && (
                              <p className="text-xs text-emerald-700 mt-1">{order.refundNote}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                <p className="font-bold text-lg">₹{order.totalAmount}</p>
                                <span className="text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter font-bold bg-secondary border border-border">{STATUS_LABELS[order.status] || order.status}</span>
                                {order.paymentMethod === 'online' && (
                                    <div className="flex flex-col gap-1 mt-2 p-2 bg-blue-50 border border-blue-100 rounded-sm">
                                        <p className="text-[10px] font-bold tracking-widest text-blue-800"><span className="uppercase">Razorpay Order:</span> <span className="font-mono text-blue-600">{order.razorpay_order_id}</span></p>
                                        {order.paymentId?.razorpay_payment_id && (
                                            <p className="text-[10px] font-bold tracking-widest text-blue-800"><span className="uppercase">Razorpay Payment:</span> <span className="font-mono text-blue-600">{order.paymentId.razorpay_payment_id}</span></p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-4 md:mt-0 min-w-[200px]">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Update Status</label>
                            <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="border border-border rounded-sm px-3 py-2 text-xs font-bold uppercase bg-card"
                            >
                                {ADMIN_STATUSES.map((s) => (
                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                ))}
                            </select>
                            {canCancelOrder(order.status) && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Cancel this order? Online payments will be refunded automatically.')) {
                                            updateOrderStatus(order._id, 'cancelled');
                                        }
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Products</h4>
                        {order.products && order.products.map((item) => {
                            console.log('Admin order item:', item);
                            const coverIdx = item.productId?.coverImageIndex ?? 0;
                            const filename = item.productId?.image?.[coverIdx] || item.productId?.image?.[0];
                            const displayImg = filename ? (filename.includes('cloudinary.com') ? filename : `/${filename.split(/[\\/]/).pop()}`) : '/ErrorImage.png';
                            return (
                            <div key={item._id} className="flex items-center gap-6 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <a href={`/products/${item.productId?._id}`} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={displayImg}
                                        alt={item.productId?.name}
                                        className="w-20 h-20 object-contain bg-secondary border border-border rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                                        onError={(e) => e.target.src = '/ErrorImage.png'}
                                    />
                                </a>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-foreground">{item.productId?.name}</p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                       {item.size && <span>Size: {item.size}</span>}
                                       {item.color && <span>Color: {item.color}</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Quantity: <span className="font-bold text-foreground">{item.quantity}</span></p>
                                    <p className="text-xs text-muted-foreground">Unit Price: <span className="font-bold text-foreground">₹{item.unitPriceAtPurchase}</span></p>
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
                )})}
            {renderPagination()}
        </div>
    )
}

export default Order