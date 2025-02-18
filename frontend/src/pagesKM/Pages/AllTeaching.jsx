import { Button, Dialog, Card, CardContent, Typography } from '@mui/material'
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import CreateClass from './CreateClass'
import './AllTeaching.css'
import {
  useGetAllClassesQuery,
  useJoinClassMutation,
} from '../../redux/api/classApiSlice'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AllTeaching = ({ navigate }) => {
  const { userInfo } = useSelector((state) => state.user)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, isLoading, error, refetch } = useGetAllClassesQuery()
  const [joinClass] = useJoinClassMutation()
  if (isLoading) return <p>Loading classes...</p>
  if (error) return <p>Error fetching classes</p>

  return (
    <section>
      <div className="buttonContainer">
        {userInfo.role == 'teacher' && (
          <Button
            variant="contained"
            endIcon={<FaPlus />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Class
          </Button>
        )}
        {userInfo.role == 'student' && (
          <Button variant="contained" endIcon={<FaPlus />}>
            Join Class
          </Button>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <CreateClass refetch={refetch} onClose={() => setIsModalOpen(false)} />
      </Dialog>
      <div className="classList">
        {data?.classes?.length > 0 ? (
          data.classes.map((classItem) => (
            <div
              key={classItem._id}
              onClick={() => navigate(`/class/${classItem._id}`)}
              className="classCardWrapper"
            >
              <Card className="classCard">
                <div className="classHeader">{classItem.name}</div>
                <CardContent className="classContent">
                  <Typography className="classCode">
                    Class Code: {classItem.classCode}
                  </Typography>
                  <Typography className="teacherInfo">
                    Teacher: {classItem.teacher.name} ({classItem.teacher.email}
                    )
                  </Typography>
                  <Typography className="studentCount">
                    Students: {classItem.students.length}
                  </Typography>
                  {/* <button className="joinButton">Join Class</button> */}
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <p>No classes available</p>
        )}
      </div>
    </section>
  )
}

export default AllTeaching
