import express from 'express'
import { getProduct, createProduct, deleteProduct, updateProduct, getProducts, getProductsByCategory, search, similarProduct, getRelatedByTab, updateImages } from '../controllers/productController.js'
import upload from '../utils/multer.js';

const router = express.Router();

router.put('/update/:productId', upload.array('images', 4), updateProduct);
router.delete('/delete/:productId', deleteProduct);
router.post('/create', upload.array('images', 4), createProduct);
router.get('/getbyId/:productId', getProduct);
router.get('/getAllproducts', getProducts);
router.get('/getProductsByCategory/:categoryId', getProductsByCategory);
router.get('/search/:q', search);
router.get('/related/:productId', getRelatedByTab)
router.get('/similar/:productId', similarProduct)
router.put('/updateimg/:productId', upload.array('images', 4), updateImages)
export default router
