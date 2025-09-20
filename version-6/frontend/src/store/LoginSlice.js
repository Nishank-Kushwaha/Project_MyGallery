import {createSlice} from "@reduxjs/toolkit";

const LoginSlice = createSlice({
    name: "login",
    initialState: {loginStatus: false,loginData: {}},
    reducers: {
        loginSuccess: (store) => {
            store.loginStatus = true;
        },
        loginSuccessData: (store,action) => {
            store.loginData = action.payload;
        },
        logoutSuccess: (store) => {
            store.loginStatus = false;
            store.loginData = {};
        }
    }
});

export const loginActions = LoginSlice.actions;
export default LoginSlice;