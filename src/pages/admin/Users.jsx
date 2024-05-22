import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, getUsersFailure, getUsersStart, getUsersSuccess } from '../../redux/slices/userSlice';

const Users = () => {
  const dispatch = useDispatch();
  const {users}=useSelector(state=>state.user)
  const { loading, error } = useSelector((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 10

  useEffect(() => {
    fetchUsers(currentPage)
  }, [ currentPage]);

  useEffect(() => {
    if (users.length > 0) {
      setTotalUsers(users.length);
    }
  }, [users])

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const renderPagination = () => {
    const disableNext = currentPage * pageSize >= totalUsers;
    return (
      <div className='w-[100%] flex justify-between'>
        <button className='bg-blue-500 rounded-lg text-white px-3 py-3' onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span> Page {currentPage} </span>
        {/* disabled={disableNext} */}
        <button className='bg-blue-500 rounded-lg text-white px-3 py-3' onClick={nextPage} >Next</button>
      </div>
    );
  };

  const handleDelete = async (userId) => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        // Handling non-successful status codes
        const errorData = await res.json();
      }

      dispatch(deleteUserSuccess());

    }
    catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const fetchUsers = async (page) => {

    dispatch(getUsersStart());

    try {
      const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/getusers?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        // Handling non-successful status codes
        const errorData = await res.json();
      }

      // Handling successful update
      const data = await res.json();
      dispatch(getUsersSuccess(data));
    } catch (error) {
      // Handling errors
      dispatch(getUsersFailure(error.message));
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {Object.values(users).map((user) => (
          <>
            <li key={user._id}>
              {user.username}
            </li>
            <button onClick={() => handleDelete(user._id)}>delete</button>
          </>
        ))}
      </ul>
      {renderPagination()}
    </div>
  );
};

export default Users;
