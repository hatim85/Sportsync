import express from 'express'
import User from '../models/userModel.js';
import Address from '../models/addressModel.js';
import Product from '../models/productModel.js';
import { addAddress, deleteUser, deleteUserAddress, getUserAddresses, getUsers,  signout } from '../controllers/userController.js';
const router=express.Router()

router.delete('/delete/:userId',deleteUser);
router.post('/signout',signout);
router.get('/getusers',getUsers);
router.post('/createaddress/:userId',addAddress);
router.get('/address/:userId',getUserAddresses);
router.delete('/deleteaddress/:addressId',deleteUserAddress);


export default router;