import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/userModel.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoute.js';
import authRoutes from './routes/authRoute.js';
import categoryRoutes from './routes/categoryRoute.js';
import productRoutes from './routes/productRoute.js';
import cartRoutes from './routes/cartRoute.js';
import orderRoutes from './routes/orderRoute.js';
import reviewRoutes from './routes/reviewRoute.js';
import paymentRoutes from './routes/paymentRoute.js';
import adminRoutes from './routes/adminRoute.js';
import settingsRoutes from "./routes/settingsRoute.js";
import wishlistRoutes from "./routes/wishlistRoute.js";
import { paymentWebhook } from './controllers/paymentController.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Razorpay from 'razorpay';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin'

dotenv.config();

const port = process.env.PORT || 5000;

connectDB();

const app = express();

const verifyFn = (req, res, buf) => {
  req.rawBody = buf.toString();
};

app.use(express.json({ verify: verifyFn }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, verify: verifyFn }));
const allowedOrigins = [
  'https://silver-wale.vercel.app',
  'https://app.silverwale.com',
  'https://silverwale.com',
  'https://brigid-draftable-minisculely.ngrok-free.dev',
  process.env.CLIENT // e.g. http://localhost:5173
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('ngrok-free.dev') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

const firebaseAdminSdkBase64 =process.env.FIREBASE_ADMINSDK_BASE64;
const firebaseAdminSdkJson = Buffer.from(firebaseAdminSdkBase64, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(firebaseAdminSdkJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, 'client', 'dist')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'client', 'dist', 'index.html'));
});

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.post('/api/webhook', paymentWebhook);
app.get('/api/getkey', (req, res) => res.status(200).json({ key: process.env.RAZORPAY_API_KEY }));

// Serve static images from frontend/public
app.use('/images', express.static(path.resolve(__dirname, '../frontend/public')));
app.use(express.static(path.resolve(__dirname, '../frontend/public')));

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
