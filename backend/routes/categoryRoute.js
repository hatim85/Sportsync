import express from 'express'
import { updateimg,createCategory,deleteCategory,getCategories, getCategoryProducts, getzeroindeximg, getAllCategories, getCategoryById, updateCategory, removeCategoryImage } from '../controllers/categoryController.js'
import upload from '../utils/multer.js';

const router=express.Router();

router.delete('/delete/:categoryId',deleteCategory);
router.post('/create',createCategory);
router.get('/getAllcategory',getAllCategories);
router.get('/getbyId/:categoryId',getCategoryById);
router.get('/getcategoryproducts/:categoryId',getCategoryProducts);
router.put('/update/:categoryId',updateCategory);
router.put('/removeImage/:categoryId',removeCategoryImage);
router.put('/updateimg/:categoryId',upload.array("files",3),updateimg);
router.get('/getzeroimg',getzeroindeximg)
export default router
