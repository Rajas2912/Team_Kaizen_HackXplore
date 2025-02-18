import { apiSlice } from './apiSlice'
import { BASE_URL } from '../constants'

const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation({
      query: (data) => ({
        url: `${BASE_URL}/comment/comments`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Comment'],
    }),

    getCommentsByLecture: builder.query({
      query: (lectureId) => ({
        url: `${BASE_URL}/comment/lectures/${lectureId}/comments`,
        credentials: 'include',
      }),
      providesTags: ['Comment'],
    }),

    updateComment: builder.mutation({
      query: ({ commentId, ...body }) => ({
        url: `${BASE_URL}/comment/comments/${commentId}`,
        method: 'PUT',
        body: body,
        credentials: 'include',
      }),
      invalidatesTags: ['Comment'],
    }),

    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `${BASE_URL}/comment/comments/${commentId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Comment'],
    }),
  }),
})

export const {
  useCreateCommentMutation,
  useGetCommentsByLectureQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApiSlice
