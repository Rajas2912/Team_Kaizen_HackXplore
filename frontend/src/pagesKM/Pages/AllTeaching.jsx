import {
  Button,
  Dialog,
  Card,
  CardContent,
  Typography,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
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
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [classCode, setClassCode] = useState('')
  const { data, isLoading, error, refetch } = useGetAllClassesQuery(
    userInfo._id
  )
  const [joinClass, { isLoading: isJoining }] = useJoinClassMutation()

  const handleJoinClass = async () => {
    if (!classCode) {
      alert('Please enter a class code.')
      return
    }

    try {
      const response = await joinClass({
        classCode,
        studentId: userInfo._id,
      }).unwrap()
      alert(response.message) // Show success message
      setIsJoinModalOpen(false) // Close the join modal
      refetch() // Refresh the class list
    } catch (error) {
      alert(error.data?.message || 'Failed to join class.') // Show error message
    }
    setClassCode('')
  }

  if (isLoading) return <p>Loading classes...</p>
  if (error) return <p>Error fetching classes</p>

  return (
    <section>
      <div className="buttonContainer">
        {userInfo.role === 'teacher' && (
          <Button
            variant="contained"
            endIcon={<FaPlus />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Class
          </Button>
        )}
        {userInfo.role === 'student' && (
          <Button
            variant="contained"
            endIcon={<FaPlus />}
            onClick={() => setIsJoinModalOpen(true)}
          >
            Join Class
          </Button>
        )}
      </div>

      {/* Create Class Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <CreateClass refetch={refetch} onClose={() => setIsModalOpen(false)} />
      </Dialog>

      {/* Join Class Dialog */}
      <Dialog
        open={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Join Class</DialogTitle>
        <DialogContent>
          <TextField
            name="classCode"
            label="Enter Class Code"
            fullWidth
            margin="dense"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
          <Button
            onClick={handleJoinClass}
            disabled={isJoining}
            variant="contained"
            color="primary"
          >
            {isJoining ? 'Joining...' : 'Join'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Class List */}
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
