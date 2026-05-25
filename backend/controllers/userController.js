import bcryptjs from 'bcryptjs'
import { errorHandler } from '../utils/error.js'
import User from '../models/userModel.js'
import Address from '../models/addressModel.js'

export const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await User.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: 'User has been deleted' });
    } catch (error) {
        next(error);
    }
};

export const signout=(req,res,next)=>{
    try {
        res
            .clearCookie('access_token', {
                sameSite: 'none',
                secure: true
            })
            .status(200)
            .json('Signout successfull');
    } catch (error) {
        next(error);
    }
}

export const getUsers = async (req, res, next) => {
    // if (req.userType !== 'admin') {
    //   return next(errorHandler(403, 'You are not allowed to see all users'));
    // }
    try {
      const page = req.query.page || 1;
      const pageSize = 10;
      const skip = (page - 1) * pageSize;
  
      const totalUsers = await User.countDocuments();
      let users = await User.find().skip(skip).limit(pageSize);
  
      res.status(200).json({ users, totalUsers });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


export const addAddress=async(req,res)=>{
    try {
        const {userId}=req.params;
        const {  fullName,country, addressLine1, addressLine2, city, postalCode, phoneNumber, isDefault } = req.body;

        const newAddress = new Address({
            userId,
            fullName,
            addressLine1,
            addressLine2,
            city,
            country,
            postalCode,
            phoneNumber,
            isDefault
        });

        await newAddress.save();

        res.status(201).json({ message: 'Address added successfully', address: newAddress });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getUserAddresses = async (req, res) => {
    const userId = req.params.userId;

    try {
        const addresses = await Address.find({ userId });

        if (!addresses) {
            return res.status(404).json({ message: 'Addresses not found for the user' });
        }

        res.status(200).json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteUserAddress=async(req,res)=>{
    const addressId=req.params.addressId;

    if(!addressId){
        return res.status(404).json("Address not found")
    }

    try{
        await Address.findByIdAndDelete(addressId);
        res.status(200).json("Address deleted successfully");
    }
    catch(error){
        res.status(500).json(error);
    }
}

