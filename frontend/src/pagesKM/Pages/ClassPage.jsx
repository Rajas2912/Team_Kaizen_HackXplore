import React from 'react'
import Main from '../../common/Main'
import './ClassPage.css'
import { useParams } from 'react-router'
import { useGetClassDetailsQuery } from '../../redux/api/classApiSlice'
const ClassPage = ({ classId }) => {
  const { data } = useGetClassDetailsQuery(classId)
  console.log(data)
  return (
    <section id="classPage">
      {data?.name}
      <p>kjg</p>
      {classId}
      hello
    </section>
  )
}

export default ClassPage
