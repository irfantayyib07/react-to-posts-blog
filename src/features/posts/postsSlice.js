import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import { apiSlice } from "../api/apiSlice";

const postsAdapter = createEntityAdapter({
 sortComparer: (a, b) => b.date.localeCompare(a.date)
});

const initialState = postsAdapter.getInitialState()

// SLICE

export const extendedPostApiSlice = apiSlice.injectEndpoints({
 endpoints: builder => ({
  getPosts: builder.query({
   query: () => '/posts',
   transformResponse: responseData => {
    let min = 1;
    const loadedPosts = responseData.map(post => {
     if (!post?.date) post.date = sub(new Date(), { minutes: min++ }).toISOString();
     if (!post?.reactions) post.reactions = {
      thumbsUp: 0,
      wow: 0,
      heart: 0,
      rocket: 0,
      coffee: 0
     }
     return post;
    });
    return postsAdapter.setAll(initialState, loadedPosts)
   },
   providesTags: (result, error, arg) => { // result is the state (with ids array and entities object)
    return [
     { type: 'Post', id: "LIST" },
     ...result.ids.map(id => ({ type: 'Post', id }))
    ]
   }
  }),

  getPostsByUserId: builder.query({
   query: id => `/posts/?userId=${id}`,
   transformResponse: responseData => {
    let min = 1;
    const loadedPosts = responseData.map(post => {
     if (!post?.date) post.date = sub(new Date(), { minutes: min++ }).toISOString();
     if (!post?.reactions) post.reactions = {
      thumbsUp: 0,
      wow: 0,
      heart: 0,
      rocket: 0,
      coffee: 0
     }
     return post;
    });
    return postsAdapter.setAll(initialState, loadedPosts)
   },
   providesTags: (result, error, arg) => [
    ...result.ids.map(id => ({ type: 'Post', id }))
   ]
  }),

  addNewPost: builder.mutation({
   query: initialPost => ({
    url: '/posts',
    method: 'POST',
    body: {
     ...initialPost,
     userId: Number(initialPost.userId),
     date: new Date().toISOString(),
     reactions: {
      thumbsUp: 0,
      wow: 0,
      heart: 0,
      rocket: 0,
      coffee: 0
     }
    }
   }),
   invalidatesTags: [
    { type: 'Post', id: "LIST" }
   ]
  }),

  updatePost: builder.mutation({
   query: initialPost => ({
    url: `/posts/${initialPost.id}`,
    method: 'PUT',
    body: {
     ...initialPost,
     date: new Date().toISOString()
    }
   }),
   invalidatesTags: (result, error, arg) => [
    { type: 'Post', id: arg.id }
   ]
  }),

  deletePost: builder.mutation({
   query: ({ id }) => ({
    url: `/posts/${id}`,
    method: 'DELETE',
    body: { id }
   }),
   invalidatesTags: (result, error, arg) => [
    { type: 'Post', id: arg.id }
   ]
  }),

  addReaction: builder.mutation({
   query: ({ postId, reactions }) => ({
    url: `posts/${postId}`,
    method: 'PATCH',
    // In a real app, we'd probably need to base this on user ID somehow
    // so that a user can't do the same reaction more than once
    body: { reactions }
   }),
   
   async onQueryStarted({ postId, reactions }, { dispatch, queryFulfilled }) {
    // `updateQueryData` requires the endpoint name and cache key arguments,
    // so it knows which piece of cache state to update
    const patchResult = dispatch(
     extendedPostApiSlice.util.updateQueryData('getPosts', undefined, draft => {
      // The `draft` is Immer-wrapped and can be "mutated" like in createSlice
      const post = draft.entities[postId]
      if (post) post.reactions = reactions
     })
    )
    try {
     await queryFulfilled
    } catch {
     patchResult.undo()
    }
   }
  })

 })
});

// HOOKS

export const {
 useGetPostsQuery,
 useGetPostsByUserIdQuery,
 useAddNewPostMutation,
 useUpdatePostMutation,
 useDeletePostMutation,
 useAddReactionMutation,
} = extendedPostApiSlice;

// SELECTORS (for convenience)

// returns the query result object (from cache)
export const retrieveAllPosts = extendedPostApiSlice.endpoints.getPosts.select()

// Creates memoized selector
const selectPostState = createSelector(
 // (state) => {
 //  console.log(state.api.queries); // its result changes based on thunk initiation (in index.js)
 // },
 retrieveAllPosts,
 res => res.data // data is a normalized state object with ids & entities
)

export const {
 selectAll: selectAllPosts,
 selectById: selectPostById,
 selectIds: selectPostIds
 // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(state => selectPostState(state) ?? initialState);
