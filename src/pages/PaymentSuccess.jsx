import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DummyHeader from '../components/DummyHeader'

function PaymentSuccess() {
    // const searchQuery=useSearchParams()[0]
    // const referenceNum=searchQuery.get("reference")
  return (
    <>
        <DummyHeader/>
        <div className="container mx-auto mt-10 flex items-center flex-col">
            <img src='../../ordersuccess.png' alt="success img" />
            <h1 className="text-3xl mt-5 font-semibold mb-6">Order Placed Successfully!</h1>
            <p className="text-lg mb-8">Thank you for your purchase.</p>
            <Link to="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">Continue Shopping</Link>
        </div>
    </>
  )
}

export default PaymentSuccess