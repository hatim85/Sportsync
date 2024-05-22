import React, { useState } from 'react'
import { FaEye, FaEyeSlash, FaHome } from 'react-icons/fa';
import { FaSpinner } from 'react-icons/fa';
import { Alert, Spinner } from 'flowbite-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { signInStart, signInSuccess, signInFailure } from '../../redux/slices/userSlice.js'
import { toast } from 'react-toastify';

function SignIn() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const { loading, error: errorMessage } = useSelector(state => state.user);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            return dispatch(signInFailure('Please fill the required details'));
        }
        try {
            dispatch(signInStart());
            const res = await fetch(`${import.meta.env.VITE_PORT}/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success === false) {
                dispatch(signInFailure(data.message));
                toast.error(data.message);
            }
            if (res.ok) {
                dispatch(signInSuccess(data));
                localStorage.setItem("token", data.token);
                toast.success("Login Successful");
                navigate('/');
            }
        }
        catch (error) {
            dispatch(signInFailure(error.message));
            toast.error(error.message);
        }

    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            {/* <Spinner size='sm' color="gray" visible={loading} /> */}
            {/* <FaSpinner className='h-5 w-5 animate-spin'/> */}
            {/* {loading && <Spinner size='sm' color="gray" visible={loading} />}  */}
            <div className='flex justify-center items-center w-screen h-[15vh]'>
                <Link to="/"><p className="absolute left-4"><FaHome className='h-5 w-5' />Back</p></Link>
                <Link to="/"><h1 className='font-bold text-3xl'>SportSync</h1></Link>
            </div>
            <div className='flex items-center justify-center h-full'>
                <div className='h-screen w-[50%] hidden md:block'>
                    <img src="./LoginImg.jpeg" alt="" className='w-full h-full' />
                </div>
                <div className='flex justify-center items-center flex-col w-[50%] h-screen'>
                    <h1 className='font-bold text-2xl'>Login</h1>
                    <form onSubmit={handleSubmit}>
                        <div className='mt-5 mb-5'>
                            <label value="email">Email Address</label><br />
                            <input
                                type="email"
                                placeholder='Enter Email'
                                id='email'
                                value={formData.email}
                                onChange={handleChange}
                                className={'md:w-[30vw] md:h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
                            />
                        </div>

                        <div className='relative mb-5'>
                            <label value="password">Password</label><br />
                            <div className="password-input">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder='Enter Password'
                                    id='password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={'md:w-[30vw] md:h-[5vh] sm:w-[50vw] rounded-md border border-gray-400 px-2 focus:border-blue-800 outline-none'}
                                />{showPassword ? <FaEye onClick={togglePasswordVisibility} className='cursor-pointer absolute bottom-2 right-2' /> : <FaEyeSlash onClick={togglePasswordVisibility} className='cursor-pointer absolute bottom-2 right-2' />}
                            </div>
                        </div>

                        <button className='bg-blue-800 mb-5 mt-5 w-[30vw] rounded-md font-bold text-white px-4 py-2'>{
                            loading ? (
                                <>
                                    <span className='pl-3'>Loading...</span>
                                </>
                            ) : 'Login'
                        }</button>
                    </form>
                    <div>No account? <Link to='/signup' className='text-blue-500'>Create One!</Link></div>
                    {
                        errorMessage && (
                            <Alert className='mt-5' color='failure'>
                                {errorMessage}
                            </Alert>
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default SignIn