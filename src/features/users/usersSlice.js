import { apiSlice } from "../api/apiSlice";
import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";

const usersAdapter = createEntityAdapter({});

const initialState = usersAdapter.getInitialState();

export const extendedUserApiSlice = apiSlice.injectEndpoints({
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

const retrieveAllUsers = extendedUserApiSlice.endpoints.getUsers.select();

const selectUsersState = createSelector(
 retrieveAllUsers,
 res => res.data
);

export const {
 useGetUsersQuery
} = extendedUserApiSlice;

export const {
 selectAll: selectAllUsers,
 selectById: selectUserById,
} = usersAdapter.getSelectors(state => selectUsersState(state) ?? initialState);
