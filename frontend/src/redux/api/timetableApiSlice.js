import { apiSlice } from './apiSlice'
import { BASE_URL } from '../constants'

const TIMETABLE_URL = `${BASE_URL}/timetable`

export const timetableApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Save or update a timetable
    saveTimetable: builder.mutation({
      query: (data) => ({
        url: `${TIMETABLE_URL}`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Timetable'],
    }),

    // Get timetable by user ID
    getTimetableByUserId: builder.query({
      query: (userId) => ({
        url: `${TIMETABLE_URL}/${userId}`,
        credentials: 'include',
      }),
      providesTags: (result, error, arg) => [{ type: 'Timetable', id: arg }],
    }),

    // Delete timetable by user ID
    deleteTimetableByUserId: builder.mutation({
      query: (userId) => ({
        url: `${TIMETABLE_URL}/${userId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Timetable'],
    }),

    // Update specific schedule items in a timetable
    updateScheduleItems: builder.mutation({
      query: ({ userId, updates }) => ({
        url: `${TIMETABLE_URL}/${userId}`,
        method: 'PATCH',
        body: { updates },
        credentials: 'include',
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Timetable', id: arg.userId },
      ],
    }),
  }),
})

export const {
  useSaveTimetableMutation,
  useGetTimetableByUserIdQuery,
  useDeleteTimetableByUserIdMutation,
  useUpdateScheduleItemsMutation,
} = timetableApiSlice
