import React, { useEffect, useState } from 'react';
import { fetchAddressesStart, fetchAddressesSuccess, fetchAddressesFailure, deleteAddressStart, deleteAddressSuccess, deleteAddressFailure } from '../redux/slices/addressSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

function AddressCard() {
    const dispatch = useDispatch();
    const { addresses, loading, error } = useSelector(state => state.address);
    const { currentUser } = useSelector(state => state.user)
    const userId = currentUser._id
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
        }
        catch (error) {
            dispatch(fetchAddressesFailure(error.message));
        }
    }

    const handleAddressDelete=async(addressId)=>{
        dispatch(deleteAddressStart());
        try{
            const response=await fetch(`${import.meta.env.VITE_PORT}/api/user/deleteaddress/${addressId}`,{
                method:'DELETE',
                headers:{
                    'Content-Type':'application/json'
                }
            })

            if(!response.ok){
                throw new Error(response && 'something went wrong in response')
            }

            const data=await response.json();
            dispatch(deleteAddressSuccess(data));
            toast.success('Address Deleted');
        }
        catch(error){
            dispatch(deleteAddressFailure(error.message));
        }
    }

    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
    }

    const handleDisplayAll = () => {
        setDisplayAll(true);
        setSelectedAddress(null);
    };

    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">My Addresses</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600 mb-4">Error: {error}</p>}
            <Link to='/addressform' className='absolute right-0 top-20 mt-3'>
                <button className="bg-blue-500 text-white rounded-md px-4 py-2">Add Address</button>
            </Link>
            {selectedAddress ? (
                <>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <p className="font-semibold">{selectedAddress.name}</p>
                        <p>{selectedAddress.addressLine1}</p>
                        {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
                        <p>{selectedAddress.city}, {selectedAddress.postalCode}</p>
                        <p>{selectedAddress.country}</p>
                    </div>
                    <button className="bg-blue-500 text-white rounded-md px-4 py-2" onClick={handleDisplayAll}>Change</button>
                </>
            ) : displayAll ? (
                <ul className="space-y-4">
                    {addresses.map(address => (
                        <li key={address.id} className="bg-white relative p-4 rounded-lg shadow-md">
                            <p className="font-semibold">{address.name}</p>
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{address.city}, {address.postalCode}</p>
                            <p>{address.country}</p>
                            <button className="mt-2 bg-blue-500 text-white rounded-md px-4 py-2" onClick={() => handleAddressSelect(address)}>Select</button>
                            <button className="mt-2 absolute right-5 top-0 rounded-md py-2" onClick={() => handleAddressDelete(address._id)}><FaTrash className='text-gray-600 h-5 w-5'/></button>
                        </li>
                    ))}
                </ul>
            ) : (
                <button className="bg-blue-500 text-white rounded-md px-4 py-2" onClick={handleDisplayAll}>Change</button>
            )}
        </div>
    );
}

export default AddressCard;

