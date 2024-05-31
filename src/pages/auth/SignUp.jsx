import React, { useState } from 'react'
import { FaHome } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'

function SignUp() {
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isFormValid = formData.username && formData.email && formData.password && formData.confirmPassword && formData.phone;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword){
      toast.error('Passwords do not match');
      return setErrorMessage('Passwords do not match');
    }
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      toast.error('Please fill out all fields');
      return setErrorMessage('Please fill out all fields');
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success === false) {
        toast.error(data.message);
        return setErrorMessage(data.message);
      }
      setLoading(false);
      if (res.ok) {
        toast.success('Account created successfully');
        navigate('/signin');
      }
    }
    catch (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
    }
    finally {
      setLoading(false)
    }
  }
  return (
    <>
      <div className='flex justify-center items-center w-screen h-[15vh]'>
        <Link to="/"><p className="absolute left-4"><FaHome className='h-5 w-5' />Back</p></Link>
        <Link to="/"><h1 className='font-bold text-3xl'>SportSync</h1></Link>
      </div>
      <div className='flex items-center h-full justify-center'>
        <div className='h-screen w-[50%] hidden md:block'>
          <img src="./LoginImg.jpeg" onError={(e) => e.target.src = './ErrorImage.png'} className='w-full h-full' />
        </div>
        <div className='flex justify-center items-center flex-col w-[50%] h-screen'>
          <h1 className='font-bold text-2xl'>Sign Up</h1>

          <form onSubmit={handleSubmit}>
            <div className='mt-5'>
              <label htmlFor="name">Name</label><br />
              <input
                type="text"
                placeholder='Enter Name'
                id='username'
                value={formData.username}
                onChange={handleChange}
                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
              />
            </div>

            <div className='mt-5'>
              <label htmlFor="Email">Email Address</label><br />
              <input
                type="text"
                placeholder='Enter Email'
                id='email'
                value={formData.email}
                onChange={handleChange}
                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
              />
            </div>

            <div className='mt-5'>
              <label htmlFor="Phone">Phone</label><br />
              <input
                type="number"
                placeholder='Enter Phone No'
                value={formData.phone}
                onChange={handleChange}
                id='phone'
                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
              />
            </div>

            <div className='mt-5'>
              <label htmlFor="Password">Password</label><br />
              <input
                type="password"
                placeholder='Enter password'
                value={formData.password}
                onChange={handleChange}
                id='password'
                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
              />
            </div>

            <div className='mt-5'>
              <label htmlFor="Confirm Password">Confirm Password</label><br />
              <input
                type="password"
                placeholder='Enter password again'
                value={formData.confirmPassword}
                id='confirmPassword'
                onChange={handleChange}
                className={'md:w-[30vw] h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
              />
            </div>

            {error && <div className="text-red-600 mt-2">{error}</div>}

            <button type='submit' className='bg-blue-800 mb-5 mt-7 w-[30vw] rounded-md font-bold text-white px-4 py-2'>Register</button>
          </form>
          <div>Already had an Account? <Link to="/signin" className='text-blue-500'>Login!</Link></div>
        </div>
      </div>
    </>
  )
}

export default SignUp