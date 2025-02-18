import { apiSlice } from './apiSlice'
import { BASE_URL } from '../constants'

const POST_URL = `${BASE_URL}/post`

const postApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new post
    createPost: builder.mutation({
      query: (formData) => ({
        url: `${POST_URL}`,
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
      invalidatesTags: ['Post'],
    }),

    // Like or unlike a post
    likePost: builder.mutation({
      query: ({ postId, userId }) => ({
        url: `${POST_URL}/${postId}/like`,
        method: 'PUT',
        body: { userId },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Post', id: arg.postId },
      ],
    }),

    // Add a comment to a post
    addComment: builder.mutation({
      query: ({ postId, text, userId }) => ({
        url: `${POST_URL}/${postId}/comment`,
        method: 'POST',
        body: { text, userId },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Post', id: arg.postId },
      ],
    }),

    // Get all posts for a specific class
    getPostsByClass: builder.query({
      query: (classId) => ({
        url: `${POST_URL}/${classId}`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'Post', id: arg.classId }],
    }),
  }),
})

export const {
  useCreatePostMutation,
  useLikePostMutation,
  useAddCommentMutation,
  useGetPostsByClassQuery,
} = postApiSlice
