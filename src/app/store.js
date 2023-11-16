import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../features/api/apiSlice";
import usersReducer from "../features/users/usersSlice";

export const store = configureStore({
 reducer: {
  [apiSlice.reducerPath]: apiSlice.reducer,
  users: usersReducer,
 },

 middleware: getDefaultMiddleware => {
  return getDefaultMiddleware().concat(apiSlice.middleware);
 },

 devTools: true
});