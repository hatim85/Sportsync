import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess
} from '../../redux/slices/userSlice.js'
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import { toast } from 'react-toastify';

function Profile() {
  const dispatch = useDispatch();
  const {currentUser} = useSelector(state => state.user);
  const [showModal, setShowModal] = useState(false);
  const [editable, setEditable] = useState(true);
  const userId=currentUser._id
  const [formData, setFormData] = useState({
    // username: currentUser.username,
    // email: currentUser.email,
    // phone: currentUser.phone,
    // address: currentUser.address
  });
  const [error, setError] = useState('');
  const navigate=useNavigate();

  const handleEdit = () => {
    setEditable(true);
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/delete/${userId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
        toast.failure(data.message);
      }
      const data = await res.json();
      toast.success("Deactivated account successfully")
      dispatch(deleteUserSuccess(data.userId));
      navigate('/');
    }
    catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/signout`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        toast.failure(data.message)
      }
      else {
        dispatch(signoutSuccess());
        localStorage.removeItem('user');
        toast.success("Signed Out Successfully")
        navigate('/')
      }
    }
    catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Personal Information</h1>
          <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={handleSignout}>Signout</button>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-sm font-medium text-gray-600">Username</div>                                                                             {/*currentUser.username*/}
          <div className="text-sm text-gray-800">{editable ? <input type="text" name="username" value={currentUser.username} onChange={handleChange} /> : ''}</div>
          <div className="text-sm font-medium text-gray-600">Mobile Number</div>
          <div className="text-sm text-gray-800">{editable ? <input type="text" name="phone" value={currentUser.phone} onChange={handleChange} /> : ''}</div>
          <div className="text-sm font-medium text-gray-600">Email</div>
          <div className="text-sm text-gray-800">{editable ? <input type="email" name="email" value={currentUser.email} onChange={handleChange} /> : ''}</div>
        </div>
        <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={handleDeleteUser}>Deactivate Account</button>
        <Link to={'/'}><button className="mt-4 ml-5 px-4 py-2 bg-blue-500 text-white rounded">Back to Home</button></Link>
        <Link to={'/myorders'}><button className="mt-4 ml-5 px-4 py-2 bg-blue-500 text-white rounded">My Orders</button></Link>
      </div>
    </>
  )
}

export default Profile
