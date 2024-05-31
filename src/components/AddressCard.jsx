import React, { useEffect, useState } from 'react';
import { fetchAddressesStart, fetchAddressesSuccess, fetchAddressesFailure, deleteAddressStart, deleteAddressSuccess, deleteAddressFailure } from '../redux/slices/addressSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

function AddressCard() {
    const dispatch = useDispatch();
    const { addresses, loading, error } = useSelector(state => state.address);
    const { currentUser } = useSelector(state => state.user);
    const userId = currentUser._id;
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [displayAll, setDisplayAll] = useState(false);

    useEffect(() => {
        fetchAddress(userId);
    }, [userId]);

    const fetchAddress = async (userId) => {
        dispatch(fetchAddressesStart());
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/user/address/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            dispatch(fetchAddressesSuccess(data));
            // Select the most recently added address by default
            if (data.length > 0) {
                setSelectedAddress(data[0]);
            }
        } catch (error) {
            dispatch(fetchAddressesFailure(error.message));
        }
    };

    const handleAddressDelete = async (addressId) => {
        dispatch(deleteAddressStart());
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT}/api/user/deleteaddress/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete address');
            }

            await response.json();
            dispatch(deleteAddressSuccess(addressId));
            toast.success('Address deleted');
            fetchAddress(userId);
        } catch (error) {
            dispatch(deleteAddressFailure(error.message));
        }
    };

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
    };

    const handleDisplayAll = () => {
        setDisplayAll(true);
        setSelectedAddress(null);
    };

    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md relative">
            <h2 className="text-2xl font-bold mb-4">My Addresses</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600 mb-4">Error: {error}</p>}
            <Link to='/addressform' className='absolute right-0 top-4'>
                <button className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition duration-300">Add Address</button>
            </Link>
            {addresses.length === 0 && !loading && !error && <p>No address added</p>}
            {selectedAddress ? (
                <>
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                        <p className="font-semibold"><span className="font-bold">Full Name: </span>{selectedAddress.fullName}</p>
                        <p><span className="font-bold">Address Line 1: </span>{selectedAddress.addressLine1}</p>
                        {selectedAddress.addressLine2 && <p><span className="font-bold">Address Line 2: </span>{selectedAddress.addressLine2}</p>}
                        <p><span className="font-bold">City: </span>{selectedAddress.city}</p>
                        <p><span className="font-bold">Postal Code: </span>{selectedAddress.postalCode}</p>
                        <p><span className="font-bold">Country: </span>{selectedAddress.country}</p>
                        <p><span className="font-bold">Phone Number: </span>{selectedAddress.phoneNumber}</p>
                    </div>
                    <button className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition duration-300" onClick={handleDisplayAll}>Change</button>
                </>
            ) : displayAll ? (
                <ul className="space-y-4">
                    {addresses.map((address, key) => (
                        <li key={key} className="bg-white relative p-4 rounded-lg shadow-md">
                            <p className="font-semibold"><span className="font-bold">Full Name: </span>{address.fullName}</p>
                            <p><span className="font-bold">Address Line 1: </span>{address.addressLine1}</p>
                            {address.addressLine2 && <p><span className="font-bold">Address Line 2: </span>{address.addressLine2}</p>}
                            <p><span className="font-bold">City: </span>{address.city}</p>
                            <p><span className="font-bold">Postal Code: </span>{address.postalCode}</p>
                            <p><span className="font-bold">Country: </span>{address.country}</p>
                            <p><span className="font-bold">Phone Number: </span>{address.phoneNumber}</p>
                            <button className="mt-2 bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition duration-300" onClick={() => handleAddressSelect(address)}>Select</button>
                            <button className="mt-2 absolute right-4 top-4 rounded-md py-2" onClick={() => handleAddressDelete(address._id)}><FaTrash className='text-gray-600 hover:text-red-600 transition duration-300 h-5 w-5' /></button>
                        </li>
                    ))}
                </ul>
            ) : (
                addresses.length > 0 && (
                    <button className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition duration-300" onClick={handleDisplayAll}>Change</button>
                )
            )}
        </div>
    );
}

export default AddressCard;