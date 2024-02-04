import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import { apiSlice } from "../api/apiSlice";
import { v4 as uuidv4 } from 'uuid';

const postsAdapter = createEntityAdapter({
 sortComparer: (a, b) => b.date.localeCompare(a.date)
});

const initialState = postsAdapter.getInitialState()

// SLICE

export const extendedPostsApiSlice = apiSlice.injectEndpoints({
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
     ...result?.ids.map(id => ({ type: 'Post', id }))
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
    ...result?.ids.map(id => ({ type: 'Post', id }))
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

   transformResponse: (res, meta, arg) => {
    postsAdapter.updateOne({
     id: "temporaryID",
     changes: {
      id: res.id,
     }
    })
   },

   async onQueryStarted(initialPost, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
     extendedPostsApiSlice.util.updateQueryData('getPosts', undefined, draft => {
      initialPost = {
       ...initialPost,
       userId: Number(initialPost.userId),
       id: "temporaryID",
       date: new Date().toISOString(),
       reactions: {
        thumbsUp: 0,
        wow: 0,
        heart: 0,
        rocket: 0,
        coffee: 0
       }
      }
      postsAdapter.addOne(draft, initialPost);
     })
    )
    try {
     await queryFulfilled
    } catch {
     patchResult.undo()
    }
   }
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

   async onQueryStarted(initialPost, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
     extendedPostsApiSlice.util.updateQueryData('getPosts', undefined, draft => {
      initialPost.date = new Date().toISOString();
      postsAdapter.upsertOne(draft, initialPost);
     })
    )
    try {
     await queryFulfilled
    } catch {
     patchResult.undo()
    }
   }
  }),

  deletePost: builder.mutation({
   query: ({ id }) => ({
    url: `/posts/${id}`,
    method: 'DELETE',
    body: { id }
   }),

   async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
     extendedPostsApiSlice.util.updateQueryData('getPosts', undefined, draft => {
      postsAdapter.removeOne(draft, id);
     })
    )
    try {
     await queryFulfilled
    } catch {
     patchResult.undo()
    }
   }
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
     extendedPostsApiSlice.util.updateQueryData('getPosts', undefined, draft => {
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
} = extendedPostsApiSlice;

// SELECTORS (for convenience)

// returns the query result object (from cache)
export const retrieveAllPosts = extendedPostsApiSlice.endpoints.getPosts.select()

// Creates memoized selector
const selectPostsState = createSelector(
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
} = postsAdapter.getSelectors(state => selectPostsState(state) ?? initialState);
