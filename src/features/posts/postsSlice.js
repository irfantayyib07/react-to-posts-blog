import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import { apiSlice } from "../api/apiSlice";

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date)
});

const initialState = postsAdapter.getInitialState()

// SLICE

export const extendedApiSlice = apiSlice.injectEndpoints({
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
      providesTags: (result, error, arg) => [
        { type: 'Post', id: "LIST" },
        ...result.ids.map(id => ({ type: 'Post', id }))
      ]
    }),

  })
});

// SELECTORS (for convenience)

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(state => state.posts)

// export const selectAllPosts = (state) => state.posts.posts;
export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;
export const getCount = (state) => state.posts.count;

// export const selectPostById = (state, postId) => {
//  return state.posts.posts.find(post => post.id === postId);
// }

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter(post => post.userId === userId)
)


export const { increaseCount, reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;