import { apiSlice } from './apiSlice'
import { BASE_URL } from '../constants'

const ASSIGNMENT_URL = `${BASE_URL}/assignment`

const assignmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Upload a new assignment
    uploadAssignment: builder.mutation({
      query: (formData) => ({
        url: `${ASSIGNMENT_URL}/upload`,
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
      invalidatesTags: ['Assignment'],
    }),

    // Get an assignment by ID
    getAssignmentById: builder.query({
      query: (assignmentId) => ({
        url: `${ASSIGNMENT_URL}/${assignmentId}`,
        credentials: 'include',
      }),
      providesTags: (result, error, assignmentId) => [
        { type: 'Assignment', id: assignmentId },
      ],
    }),

    // Get all assignments by class ID
    getAssignmentsByClass: builder.query({
      query: (classId) => ({
        url: `${ASSIGNMENT_URL}/class/${classId}`,
        credentials: 'include',
      }),
      providesTags: ['Assignment'],
    }),

    // Delete an assignment by ID
    deleteAssignment: builder.mutation({
      query: (assignmentId) => ({
        url: `${ASSIGNMENT_URL}/${assignmentId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Assignment'],
    }),

    // Update an assignment by ID
    updateAssignment: builder.mutation({
      query: ({ assignmentId, formData }) => ({
        url: `${ASSIGNMENT_URL}/${assignmentId}`,
        method: 'PUT',
        body: formData,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: 'Assignment', id: assignmentId },
      ],
    }),

    // Submit an answer for an assignment
    submitAnswer: builder.mutation({
      query: (formData) => ({
        url: `${ASSIGNMENT_URL}/submit-answer`,
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: 'Assignment', id: assignmentId },
      ],
    }),

    // Get submissions for an assignment
    getSubmissions: builder.query({
      query: (assignmentId) => ({
        url: `${ASSIGNMENT_URL}/submissions/${assignmentId}`,
        credentials: 'include',
      }),
      providesTags: (result, error, assignmentId) => [
        { type: 'Submission', id: assignmentId },
      ],
    }),
  }),
})

export const {
  useUploadAssignmentMutation,
  useGetAssignmentByIdQuery,
  useGetAssignmentsByClassQuery,
  useDeleteAssignmentMutation,
  useUpdateAssignmentMutation,
  useSubmitAnswerMutation,
  useGetSubmissionsQuery,
} = assignmentApiSlice
