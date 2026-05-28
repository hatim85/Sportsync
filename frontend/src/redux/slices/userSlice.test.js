import { describe, it, expect } from 'vitest';
import userReducer, {
  signInStart,
  signInSuccess,
  signInFailure,
  clearError,
} from './userSlice.js';

describe('userSlice reducer', () => {
  it('sets loading on signInStart', () => {
    const state = userReducer(undefined, signInStart());
    expect(state.loading).toBe(true);
    expect(state.error).toBe(false);
  });

  it('stores user data on signInSuccess', () => {
    const payload = { _id: 'u1', email: 'u1@test.com' };
    const state = userReducer(undefined, signInSuccess(payload));
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.currentUser).toEqual(payload);
  });

  it('stores error on signInFailure and clears it', () => {
    const failedState = userReducer(undefined, signInFailure('Invalid credentials'));
    expect(failedState.loading).toBe(false);
    expect(failedState.error).toBe('Invalid credentials');

    const clearedState = userReducer(failedState, clearError());
    expect(clearedState.error).toBeNull();
  });
});
