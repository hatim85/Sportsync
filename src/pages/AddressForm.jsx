import React, { useState } from 'react';
import { addAddressFailure, addAddressStart, addAddressSuccess } from '../redux/slices/addressSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import DummyHeader from '../components/DummyHeader.jsx';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function AddressForm() {
    const { currentUser } = useSelector((state) => state.user);
    const { addresses } = useSelector((state) => state.address);
    const userId = currentUser._id;
    const dispatch = useDispatch();
    const navigate=useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: '',
        phoneNumber: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        await addAddress(userId, formData);
    };

    const addAddress = async (userId, addressData) => {
        dispatch(addAddressStart());
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/user/createaddress/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addressData)
            });
            if (!response.ok) {
                throw new Error('Failed to add address');
            }
            const data = await response.json();
            toast.success('added successfully')
            dispatch(addAddressSuccess(data));
            navigate('/cart')
        } catch (error) {
            toast.error('something went wrong')
            dispatch(addAddressFailure(error.message));
        }
    };

    return (
        <>
            <DummyHeader />
            <div className='flex items-center justify-center h-full'>
                <div className='h-screen w-[50%] hidden md:block'>
                    <img src="./LoginImg.jpeg" alt="./ErrorImage" className='w-full h-full' />
                </div>
                <div className='flex justify-center items-center flex-col w-[50%] h-screen'>
                    <h1 className='font-bold text-2xl mt-10'>Address</h1>
                    <form onSubmit={handleSubmit}> {/* Use onSubmit event on the form */}
                        <div className='mt-5'>
                            <label htmlFor="name">Full Name</label><br />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
                                required
                            />
                        </div>
                        <div className='mt-5'>
                            <label htmlFor="addressLine1">AddressLine1</label><br />
                            <input
                                type="text"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                placeholder="Address Line 1"
                                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
                                required
                            />
                        </div>
                        <div className='mt-5'>
                            <label htmlFor="addressLine2">AddressLine2</label><br />
                            <input
                                type="text"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleChange}
                                placeholder="Address Line 2"
                                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
                            />
                        </div>
                        <div className='mt-5'>
                            <label htmlFor="city">City</label><br />
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
                                required
                            />
                        </div>
                        <div className='mt-5'>
                            <label htmlFor="postalCode">Postal code</label><br />
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                placeholder="Postal Code"
                                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
                                required
                            />
                        </div>
                        <div className='mt-5'>
                            <label htmlFor="country">Country</label><br />
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                placeholder="Country"
                                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
                                required
                            />
                        </div>
                        <div className='mt-5'>
                            <label htmlFor="phoneNumber">Phone</label><br />
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Phone"
                                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
                                required
                            />
                        </div>
                        <button type="submit" className='bg-blue-800 mb-5 mt-7 w-[30vw] rounded-md font-bold text-white px-4 py-2'>Submit</button> {/* Submit button within the form */}
                    </form>
                </div>
            </div>
        </>
    );
}

export default AddressForm;