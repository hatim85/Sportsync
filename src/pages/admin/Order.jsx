import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllAdminOrdersStart, getAllAdminOrdersSuccess, getAllAdminOrdersFailure } from '../../redux/slices/orderSlice';

function Order() {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.order);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalOrders,setTotalOrders]=useState(0)
    const pageSize = 10

    useEffect(() => {
        fetchAllOrders(currentPage)
    }, [currentPage])

    const fetchAllOrders = async (req, res) => {
        dispatch(getAllAdminOrdersStart())
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/orders/getadminorders?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (!res.ok) { throw new Error("invalid response: ", res) }
            const data = await res.json()
            dispatch(getAllAdminOrdersSuccess(data))
        } catch (error) {
            dispatch(getAllAdminOrdersFailure(error.message))
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
            <div className='w-[100%] flex justify-between'>
                <button className='bg-blue-500 rounded-lg text-white px-3 py-3' onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                <span> Page {currentPage} </span>
                <button className='bg-blue-500 rounded-lg text-white px-3 py-3' onClick={nextPage} disableNext >Next</button>
            </div>
        );
    };

    const formatDate=(dateString)=>{
        const date=new Date(dateString);
        return date.toLocaleDateString();
    }

    return (
        <>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OrderId</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UserId</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PaymentId</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OrderDate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">{order._id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {order.userId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {order.totalAmount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {order.paymentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {formatDate(order.orderDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {order.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                    {renderPagination()}
        </>
    )
}

export default Order