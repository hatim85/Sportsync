import React, { useState } from 'react';
import { addAddressFailure, addAddressStart, addAddressSuccess } from '../redux/slices/addressSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function AddressForm() {
    const { currentUser } = useSelector((state) => state.user);
    const { addresses } = useSelector((state) => state.address);
    const userId = currentUser._id;
    const dispatch = useDispatch();
    const navigate=useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
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
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Simple Navigation / Header */}
            <div className='flex items-center justify-between px-8 py-6 border-b border-gray-50'>
                <button 
                  onClick={() => navigate(-1)} 
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest text-[10px] font-bold"
                >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                </button>
                <Link to="/" className='text-2xl md:text-3xl font-serif tracking-[0.3em] uppercase text-foreground'>Sportsync</Link>
                <div className="w-16"></div> {/* Spacer */}
            </div>

            <div className='flex-grow flex'>
                {/* Left: Aesthetic Image */}
                <div className='hidden lg:block lg:w-1/2 relative overflow-hidden'>
                    <img src="./LoginImg.jpeg" alt="Delivery" className='w-full h-full object-cover grayscale-[0.3]' />
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Right: Address Form */}
                <div className='w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 overflow-y-auto'>
                    <div className='w-full max-w-lg space-y-10 py-8'>
                        <div className="space-y-4">
                            <h1 className='text-4xl font-serif italic text-foreground tracking-tight'>Delivery Details</h1>
                            <p className="text-muted-foreground text-sm tracking-wide">Please provide a precise address for safe and timely delivery.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className='space-y-1'>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Recipient's Name"
                                    className='w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm'
                                    required
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-1'>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="+91..."
                                        className='w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm'
                                        required
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        placeholder="Pincode"
                                        className='w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm'
                                        required
                                    />
                                </div>
                            </div>

                            <div className='space-y-1'>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 1</label>
                                <input
                                    type="text"
                                    name="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    placeholder="House No., Building, Street"
                                    className='w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm'
                                    required
                                />
                            </div>

                            <div className='space-y-1'>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    name="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    placeholder="Locality, Landmark"
                                    className='w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm'
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-1'>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className='w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm'
                                        required
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Country"
                                        className='w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm'
                                        required
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className='w-full bg-primary text-primary-foreground py-4 rounded-sm text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-lg mt-8'
                            >
                                Save & Continue
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddressForm;