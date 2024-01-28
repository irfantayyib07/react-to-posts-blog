import { apiSlice } from "../api/apiSlice";
import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";

const usersAdapter = createEntityAdapter({});

const initialState = usersAdapter.getInitialState();

export const extendedUsersApiSlice = apiSlice.injectEndpoints({
 endpoints: builder => ({
  getUsers: builder.query({
   query: () => "/users",
   transformResponse: res => {
    return usersAdapter.setAll(initialState, res);
   },
   providesTags: (result, error, arg) => {
    return [
     { type: "User", id: "LIST" },
     ...result.ids.map(id => ({ type: 'User', id }))
    ]
   }
  })
 })
});

export const {
 useGetUsersQuery
} = extendedUsersApiSlice;

export const {
 selectAll: selectAllUsers,
 selectById: selectUserById,
} = usersAdapter.getSelectors(state => extendedUsersApiSlice.endpoints.getUsers.select()(state).data ?? initialState);
