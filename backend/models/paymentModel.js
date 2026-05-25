import mongoose from 'mongoose'
import Order from './orderModel.js';

const paymentSchema=mongoose.Schema({
    amount:{
        type:Number,
        maxLength:10,
    },
    paymentDate:{
        type:Date,
        default:Date.now,
    },
    paymentMethod:{
        type:String,
        enum:['cash','card','upi','razorpay'],
        default:'cash'
    },
    razorpay_order_id:{
        type:String,
        // required:true
    },
    razorpay_payment_id:{
        type:String,
        // required:true
    },
    razorpay_signature:{
        type:String,
        // required:true
    }
});

const Payment = mongoose.model('Payment', paymentSchema)
export default Payment;