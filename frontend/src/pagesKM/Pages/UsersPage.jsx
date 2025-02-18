import React from 'react'
import { useGetAllStudentsWithClassInfoQuery } from '../../redux/api/classApiSlice'

const UsersPage = ({ classId }) => {
  const { data } = useGetAllStudentsWithClassInfoQuery()
  console.log({ data: data })
  return <div></div>
}

export default UsersPage
