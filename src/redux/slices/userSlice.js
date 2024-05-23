import { createSlice } from '@reduxjs/toolkit'
import localStorage from 'redux-persist/es/storage';

const initialState = {
    currentUser: null,
    users: [],
    addresses: [],
    error: null,
    loading: false,
    totalUsers: 0,
    lastMonthUsers: 0
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
            state.error = false
        },
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;
            localStorage.setItem('currentUser', JSON.stringify(action.payload))
            state.loading = false;
            state.error = null;
        },
        signInFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        signUpStart: (state) => {
            state.loading = true;
            state.error = false
        },
        signUpSuccess: (state, action) => {
            state.currentUser = action.payload;
            localStorage.setItem('currentUser', JSON.stringify(action.payload))
            state.loading = false;
            state.error = null;
        },
        signUpFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        updateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteUserStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteUserSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        deleteUserFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        signoutSuccess: (state) => {
            state.currentUser = null;
            localStorage.removeItem('currentUser')
            state.error = null;
            state.loading = false;
        },
        getUsersStart(state) {
            state.loading = true;
            state.error = null;
        },
        getUsersSuccess(state, action) {
            state.loading = false;
            state.error=null;
            state.users = action.payload;
            // return state;
        },
        getUsersFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        getUserStart(state) {
            state.loading = true;
            state.error = null;
        },
        getUserSuccess(state, action) {
            state.loading = false;
            state.user = action.payload;
        },
        getUserFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {
    signInStart,
    signInFailure,
    signInSuccess,
    updateStart,
    updateSuccess,
    updateFailure,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    signoutSuccess,
    getUsersStart,
    getUsersSuccess,
    getUsersFailure,
    getUserStart,
    getUserSuccess,
    getUserFailure,
    signUpStart,
    signUpFailure,
    signUpSuccess
} = userSlice.actions;

export const fetchUsers = () => async (dispatch) => {

    dispatch(getUsersStart());

    try {
        const res = await fetch(`${import.meta.env.VITE_PORT}/api/users/getusers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            // Handling non-successful status codes
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to update product');
        }

        // Handling successful update
        const data = await res.json();
        dispatch(getUsersSuccess(data));
    } catch (error) {
        // Handling errors
        dispatch(getUsersFailure(error.response.data.message));
    }
}

export const fetchUser = (userId) => async (dispatch) => {
    dispatch(getUserStart());
    try {
        const res = await fetch(`/api/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to update product');
        }
        // const response = await axios.get(`/api/users/${userId}`);
        dispatch(getUserSuccess(response.data));
    } catch (error) {
        dispatch(getUserFailure(error.response.data.message));
    }
};

export const updateUser = (userId, formData) => async (dispatch) => {
    dispatch(updateStart());
    try {
        const res = await fetch(`${import.meta.env.VITE_PORT}/api/user/update/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to update user');
        }

        const data = await res.json();
        dispatch(updateSuccess(data));
    } catch (error) {
        dispatch(updateFailure(error.message));
    }
};

export default userSlice.reducer;