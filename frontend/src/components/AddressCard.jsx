import React, { useEffect, useState } from 'react';
import { fetchAddressesStart, fetchAddressesSuccess, fetchAddressesFailure, deleteAddressStart, deleteAddressSuccess, deleteAddressFailure } from '../redux/slices/addressSlice';
import { addAddressStart, addAddressSuccess, addAddressFailure } from '../redux/slices/addressSlice';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaTimes, FaPlus, FaCheck } from 'react-icons/fa';

function AddressCard({ onAddressSelect }) {
    const dispatch = useDispatch();
    const { addresses, loading } = useSelector(state => state.address);
    const { currentUser } = useSelector(state => state.user);
    const userId = currentUser._id;

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', addressLine1: '', addressLine2: '',
        city: '', postalCode: '', country: '', phoneNumber: ''
    });

    useEffect(() => {
        fetchAddress(userId);
    }, [userId]);

    const fetchAddress = async (uid) => {
        dispatch(fetchAddressesStart());
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/address/${uid}`);
            if (!res.ok) throw new Error('Failed to fetch addresses');
            const data = await res.json();
            dispatch(fetchAddressesSuccess(data));
            if (data.length > 0) {
                setSelectedAddress(data[0]);
                if (onAddressSelect) onAddressSelect(data[0]);
            }
        } catch (err) {
            dispatch(fetchAddressesFailure(err.message));
        }
    };

    const handleSelect = (addr) => {
        setSelectedAddress(addr);
        if (onAddressSelect) onAddressSelect(addr);
        setShowAll(false);
    };

    const handleDelete = async (addressId) => {
        dispatch(deleteAddressStart());
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/deleteaddress/${addressId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            dispatch(deleteAddressSuccess(addressId));
            toast.success('Address removed');
            if (selectedAddress?._id === addressId) {
                setSelectedAddress(null);
                if (onAddressSelect) onAddressSelect(null);
            }
            fetchAddress(userId);
        } catch (err) {
            dispatch(deleteAddressFailure(err.message));
        }
    };

    const handleFormChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setSaving(true);
        dispatch(addAddressStart());
        try {
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/createaddress/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to add address');
            const data = await res.json();
            dispatch(addAddressSuccess(data));
            toast.success('Address added');
            setShowAddForm(false);
            setFormData({ fullName: '', addressLine1: '', addressLine2: '', city: '', postalCode: '', country: '', phoneNumber: '' });
            fetchAddress(userId);
        } catch (err) {
            dispatch(addAddressFailure(err.message));
            toast.error('Could not add address');
        } finally {
            setSaving(false);
        }
    };

    const formatAddress = (addr) =>
        [addr.addressLine1, addr.addressLine2, addr.city, addr.postalCode, addr.country]
            .filter(Boolean).join(', ');

    return (
        <div className="space-y-6">
            {loading && <p className="text-xs text-muted-foreground uppercase tracking-widest animate-pulse">Loading addresses...</p>}

            {/* Selected address display */}
            {selectedAddress && !showAll && (
                <div className="border border-primary p-6 space-y-3 bg-secondary/50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <FaMapMarkerAlt className="text-foreground mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-foreground">{selectedAddress.fullName}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{formatAddress(selectedAddress)}</p>
                                <p className="text-xs text-muted-foreground">{selectedAddress.phoneNumber}</p>
                            </div>
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest bg-primary text-primary-foreground px-2 py-1">Selected</span>
                    </div>
                    <button
                        onClick={() => setShowAll(true)}
                        className="text-[10px] font-bold uppercase tracking-widest border-b border-border text-muted-foreground hover:text-foreground hover:border-primary transition-all pb-0.5"
                    >
                        Change Address
                    </button>
                </div>
            )}

            {/* All addresses list */}
            {showAll && (
                <div className="space-y-3">
                    {addresses.map((addr) => (
                        <button
                            key={addr._id}
                            onClick={() => handleSelect(addr)}
                            className={`w-full text-left p-5 border transition-all flex items-start justify-between group ${
                                selectedAddress?._id === addr._id
                                    ? 'border-primary bg-secondary'
                                    : 'border-border hover:border-border'
                            }`}
                        >
                            <div className="flex items-start space-x-3 flex-1">
                                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    selectedAddress?._id === addr._id ? 'border-primary bg-primary' : 'border-border'
                                }`}>
                                    {selectedAddress?._id === addr._id && <FaCheck className="text-primary-foreground text-[6px]" />}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-foreground">{addr.fullName}</p>
                                    <p className="text-xs text-muted-foreground">{formatAddress(addr)}</p>
                                    <p className="text-xs text-muted-foreground">{addr.phoneNumber}</p>
                                </div>
                            </div>
                            <span
                                onClick={(e) => { e.stopPropagation(); handleDelete(addr._id); }}
                                className="text-muted-foreground hover:text-red-500 transition-colors ml-4 flex-shrink-0 p-1"
                            >
                                <FaTimes className="h-3 w-3" />
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* No address state */}
            {addresses.length === 0 && !loading && (
                <div className="text-center py-8 border border-dashed border-border">
                    <FaMapMarkerAlt className="text-gray-200 h-8 w-8 mx-auto mb-3" />
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">No saved addresses</p>
                </div>
            )}

            {/* Add Address Button */}
            <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
            >
                <div className="w-6 h-6 border border-border group-hover:border-primary rounded-sm flex items-center justify-center transition-colors">
                    <FaPlus className="h-2.5 w-2.5" />
                </div>
                <span>Add New Address</span>
            </button>

            {/* Inline Add Address Modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
                    <div className="relative bg-card w-full max-w-lg mx-4 shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
                            <h2 className="text-xl font-serif italic text-foreground">New Delivery Address</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <FaTimes className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleAddAddress} className="px-8 py-6 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                                <input
                                    name="fullName" value={formData.fullName} onChange={handleFormChange}
                                    placeholder="Recipient's full name" required
                                    className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</label>
                                    <input
                                        name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange}
                                        placeholder="+91..." required
                                        className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Postal Code</label>
                                    <input
                                        name="postalCode" value={formData.postalCode} onChange={handleFormChange}
                                        placeholder="Pincode" required
                                        className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 1</label>
                                <input
                                    name="addressLine1" value={formData.addressLine1} onChange={handleFormChange}
                                    placeholder="House No., Building, Street" required
                                    className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address Line 2 (Optional)</label>
                                <input
                                    name="addressLine2" value={formData.addressLine2} onChange={handleFormChange}
                                    placeholder="Locality, Landmark"
                                    className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">City</label>
                                    <input
                                        name="city" value={formData.city} onChange={handleFormChange}
                                        placeholder="City" required
                                        className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Country</label>
                                    <input
                                        name="country" value={formData.country} onChange={handleFormChange}
                                        placeholder="Country" required
                                        className="w-full border-b border-border py-2 outline-none focus:border-primary transition-colors bg-transparent text-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-primary text-primary-foreground py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all disabled:bg-gray-400"
                                >
                                    {saving ? 'Saving...' : 'Save Address'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-6 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddressCard;