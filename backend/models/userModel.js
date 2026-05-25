import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    username: {
        type: String,
        maxLength: 100
    },
    firstName: {
        type: String,
        maxLength: 50
    },
    lastName: {
        type: String,
        maxLength: 50
    },
    password: {
        type: String,
        maxLength: 255
    },
    email: {
        type: String,
        unique: true,
        maxLength: 100
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    phone: {
        type: String,
        maxLength: 13
    },
    userType: {
        type: String,
        enum: ['customer', 'admin'],
        required: true,
        default: 'customer'
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
