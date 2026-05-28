import User from '../models/userModel.js'
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken'
import admin from 'firebase-admin'
import bcryptjs from 'bcryptjs';
import OtpVerification from '../models/otpModel.js';
import { sendOtpEmail } from '../utils/emailService.js';

export const signup = async (req, res, next) => {
    const { firstName, lastName, email, password, phone } = req.body;
    console.log("firstName: ", firstName, " lastName: ", lastName, " email: ", email);

    if (!firstName || !lastName || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword, 
        phone
    });
    try {

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: pass, ...rest } = newUser._doc;
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

        res
            .status(201)
            .cookie('access_token', token, {
                httpOnly: true,
                expires: expiryDate,
                sameSite: 'none',
                secure: true
            })
            .json({ ...rest, token });
    } catch (error) {
        next(error);
    }
}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password || email === "" || password === "") {
        return next(errorHandler(400, 'All fields are required'));
    }

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) {
            return next(errorHandler(404, 'User not found'));
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(400, 'Invalid password'));
        }

        const token = jwt.sign(
            { id: validUser._id, userType: validUser.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: pass, ...rest } = validUser._doc;

        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        res
            .status(200)
            .cookie('access_token', token, {
                httpOnly: true,
                expires: expiryDate,
                sameSite: 'none',
                secure: true
            })
            .json({ ...rest, token });
    }
    catch (error) {
        next(error);
    }
};

export const firebaseSignin = async (req, res) => {
    const { accessToken, phone } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(accessToken);
        const firebaseUid = decodedToken.uid;
        const email = decodedToken.email;
        const displayName = decodedToken.name || '';
        const nameParts = displayName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        console.log("decoded token: ", decodedToken);
        console.log("Firebase uid: ", firebaseUid, " email: ", email, " firstName: ", firstName, " lastName: ", lastName, " phone: ", phone);

        let user = await User.findOne({ firebaseUid });

        if (!user) {
            console.log("entered not user")
            const existingEmailUser = await User.findOne({ email });
            if (existingEmailUser) {
                // Link accounts by setting the firebaseUid
                existingEmailUser.firebaseUid = firebaseUid;
                // If they don't have a phone, update it if provided
                if (!existingEmailUser.phone && phone) {
                    existingEmailUser.phone = phone;
                }
                // Backfill firstName/lastName from Google if missing
                if (!existingEmailUser.firstName && firstName) {
                    existingEmailUser.firstName = firstName;
                }
                if (!existingEmailUser.lastName && lastName) {
                    existingEmailUser.lastName = lastName;
                }
                await existingEmailUser.save();
                user = existingEmailUser;
                console.log("Successfully linked existing account with Google Sign-In");
            } else {
                user = new User({
                    firebaseUid,
                    firstName,
                    lastName,
                    email,
                    phone
                });

                await user.save();
            }
        } else {
            // Returning Google user — backfill firstName/lastName if missing (legacy accounts)
            let needsSave = false;
            if (!user.firstName && firstName) {
                user.firstName = firstName;
                needsSave = true;
            }
            if (!user.lastName && lastName) {
                user.lastName = lastName;
                needsSave = true;
            }
            if (needsSave) await user.save();
        }

        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        const userObj = user.toObject ? user.toObject() : user;
        const { password: _pw, ...userSafe } = userObj;
        res
            .status(200)
            .cookie('access_token', token, {
                httpOnly: true,
                expires: expiryDate,
                sameSite: 'none',
                secure: true
            })
            .json({ ...userSafe, token });
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const checkUser = async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (user) {
            res.status(200).json({ isNewUser: false, user });
        } else {
            res.status(200).json({ isNewUser: true });
        }
    } catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const addPhone = async (req, res) => {
    const { userId, phone } = req.body;

    if (!userId || !phone) {
        return res.status(400).json({ message: 'User ID and phone number are required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userWithSamePhone = await User.findOne({ phone });
        if (userWithSamePhone) {
            return res.status(400).json({ message: 'Phone number already exists.' });
        }

        user.phone = phone;
        await user.save();

        res.status(200).json({ message: 'Phone number updated successfully', user });
    } catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const sendOtp = async (req, res, next) => {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.firebaseUid || !existingUser.password) {
                return res.status(400).json({
                    success: false,
                    message: "This email is registered via Google Sign-In. Please sign in with Google."
                });
            }
            return res.status(400).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is already registered"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await OtpVerification.deleteMany({ email });

        const otpRecord = new OtpVerification({
            email,
            otp,
            pendingUserData: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone
            },
            expiresAt
        });
        await otpRecord.save();

        await sendOtpEmail(email, otp);

        res.status(200).json({
            success: true,
            message: "OTP sent to your email successfully"
        });
    } catch (error) {
        console.error("Error in sendOtp: ", error);
        next(error);
    }
};

export const verifyOtpAndSignup = async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required"
        });
    }

    try {
        const otpRecord = await OtpVerification.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired or does not exist. Please request a new one."
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code. Please check and try again."
            });
        }

        if (new Date() > otpRecord.expiresAt) {
            await OtpVerification.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        const { firstName, lastName, password, phone } = otpRecord.pendingUserData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            await OtpVerification.deleteMany({ email });
            return res.status(400).json({
                success: false,
                message: "Email is already registered"
            });
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password,
            phone
        });

        await newUser.save();
        await OtpVerification.deleteMany({ email });

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: pass, ...rest } = newUser._doc;
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

        res
            .status(201)
            .cookie('access_token', token, {
                httpOnly: true,
                expires: expiryDate,
                sameSite: 'none',
                secure: true
            })
            .json({
                success: true,
                message: "Email verified and account created successfully",
                user: rest,
                token
            });
    } catch (error) {
        console.error("Error in verifyOtpAndSignup: ", error);
        next(error);
    }
};

export const forgotPasswordSendOtp = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address."
            });
        }

        // Google OAuth Check
        if (user.firebaseUid || !user.password) {
            return res.status(400).json({
                success: false,
                message: "This account is registered via Google. Please sign in using Google."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await OtpVerification.deleteMany({ email });

        const otpRecord = new OtpVerification({
            email,
            otp,
            pendingUserData: {
                isForgotPassword: true
            },
            expiresAt
        });
        await otpRecord.save();

        await sendOtpEmail(email, otp);

        res.status(200).json({
            success: true,
            message: "OTP sent to your email successfully"
        });
    } catch (error) {
        console.error("Error in forgotPasswordSendOtp:", error);
        next(error);
    }
};

export const forgotPasswordReset = async (req, res, next) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address."
            });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        if (user.firebaseUid || !user.password) {
            return res.status(400).json({
                success: false,
                message: "This account is registered via Google. Please sign in using Google."
            });
        }

        const otpRecord = await OtpVerification.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired or does not exist. Please request a new one."
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code. Please check and try again."
            });
        }

        if (new Date() > otpRecord.expiresAt) {
            await OtpVerification.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);
        user.password = hashedPassword;
        await user.save();

        await OtpVerification.deleteMany({ email });

        res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login with your new password."
        });
    } catch (error) {
        console.error("Error in forgotPasswordReset:", error);
        next(error);
    }
};
