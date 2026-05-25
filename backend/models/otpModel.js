import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    // Store pending form data so we don't need to re-send it on verify
    pendingUserData: {
        type: Object,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        // MongoDB TTL index: automatically deletes the document when it expires
        index: { expires: 0 }
    }
}, { timestamps: true });

const OtpVerification = mongoose.model('OtpVerification', otpSchema);
export default OtpVerification;
