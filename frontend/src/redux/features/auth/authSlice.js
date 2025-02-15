import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      console.log({ action: action })
      state.userInfo = action.payload
      localStorage.setItem('userInfo', JSON.stringify(action.payload))
      const expireIn = new Date().getTime() + 7 * 24 * 60 * 60 * 1000
      localStorage.setItem('expireIn', expireIn)
    },
    logout: (state) => {
      state.userInfo = null
      localStorage.clear()
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

export default authSlice.reducer
