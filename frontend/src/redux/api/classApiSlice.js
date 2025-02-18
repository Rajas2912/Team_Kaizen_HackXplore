import { apiSlice } from './apiSlice'
import { BASE_URL } from '../constants'

const CLASS_URL = `${BASE_URL}/class`

const classApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createClass: builder.mutation({
      query: (data) => ({
        url: `${CLASS_URL}/create`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Class'],
    }),
    joinClass: builder.mutation({
      query: (data) => ({
        url: `${CLASS_URL}/join`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation({
      query: ({ classId, data }) => ({
        url: `${CLASS_URL}/update/${classId}`,
        method: 'PUT',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Class'],
    }),

    deleteClass: builder.mutation({
      query: ({ classId, teacherId }) => ({
        url: `${CLASS_URL}/delete/${classId}`,
        method: 'DELETE',
        body: { teacherId }, // Pass teacherId in the body
        credentials: 'include',
      }),
      invalidatesTags: ['Class'],
    }),
    getClassDetails: builder.query({
      query: (classId) => ({
        url: `${CLASS_URL}/${classId}`,
        credentials: 'include',
      }),
    }),
    getAllClasses: builder.query({
      query: (userId) => ({
        url: `${CLASS_URL}/getAllClasses`,
        method: 'POST',
        body: { userId },
        credentials: 'include',
      }),
    }),

    leaveClass: builder.mutation({
      query: (classId) => ({
        url: `${CLASS_URL}/leave/${classId}`,
        method: 'PUT',
        credentials: 'include',
      }),
      invalidatesTags: ['Class'],
    }),
  }),
})

export const {
  useCreateClassMutation,
  useJoinClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetClassDetailsQuery,
  useLeaveClassMutation,
  useGetAllClassesQuery,
} = classApiSlice
