import React, { useState } from 'react'
import './ClassPage.css'
import { useGetClassDetailsQuery } from '../../redux/api/classApiSlice'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Modal,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  useGetLecturesByClassQuery,
  useUploadLectureMutation,
} from '../../redux/api/lectureApiSlice'
import { useSelector } from 'react-redux'

import CreateViva from '../../pagesPP/Viva/CreateViva'
import ShowAllViva from '../../pagesPP/Viva/AllVivaById'
import TakePicture from '../../pagesPP/Viva/TakePicture'
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const ClassPage = ({ classId }) => {
  const { data: classData, isLoading, error } = useGetClassDetailsQuery(classId)
  const navigate = useNavigate()
  const [value, setValue] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const { userInfo  } = useSelector((state) => state.user)
  const [lectureData, setLectureData] = useState({
    title: '',
    description: '',
    youtubeLink: '',
    video: null,
  })
  console.log(userInfo.role);
  const [uploadLecture] = useUploadLectureMutation()
  const { data: lectures } = useGetLecturesByClassQuery(classId)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  if (isLoading) return <div className="loading">Loading class details...</div>
  if (error) return <div className="error">Error loading class details</div>

  const handleUploadLecture = () => {
    setOpenModal(true)
  }

  const handleInputChange = (e) => {
    setLectureData({ ...lectureData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setLectureData({ ...lectureData, video: e.target.files[0] })
  }

  const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('title', lectureData.title)
    formData.append('description', lectureData.description)
    formData.append('youtubeLink', lectureData.youtubeLink)
    formData.append('video', lectureData.video)
    formData.append('classId', classId)
    formData.append('teacherId', userInfo._id)
    try {
      await uploadLecture(formData).unwrap()
      console.log('Lecture uploaded successfully')
      setOpenModal(false)
    } catch (error) {
      console.error('Error uploading lecture:', error)
    }
  }
  
  return (
    <>
   
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Lectures" {...a11yProps(0)} />
            <Tab label="Assignments" {...a11yProps(1)} />
            <Tab label="Quizzes" {...a11yProps(2)} />
            <Tab label="Viva Assignment" {...a11yProps(3)} />
          </Tabs>
        </Box>

        {/* Lectures Tab */}
        <CustomTabPanel value={value} index={0}>
          <div className="class-container">
            <section className="class-header">
              <h1 className="class-title">{classData?.classData?.name}</h1>
              <p className="class-code">
                Class Code: {classData?.classData?.classCode}
              </p>
              <p className="class-teacher">
                Teacher: {classData?.classData?.teacher?.name}
              </p>
            </section>

            <div className="action-buttons">
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={handleUploadLecture}
              >
                Upload Lecture
              </Button>
            </div>
          </div>

          <div className="allLectures">
            {lectures?.lectures?.map((lecture) => (
              <Card key={lecture._id} className="lecture-card">
                <CardContent>
                  <Typography variant="h6">{lecture.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {lecture.description}
                  </Typography>
                  {lecture.youtubeLink && (
                    <div className="youtube-container">
                      <iframe
                        width="100%"
                        height="200"
                        src={lecture.youtubeLink
                          .replace('watch?v=', 'embed/')
                          .replace('youtu.be/', 'www.youtube.com/embed/')}
                        title={lecture.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                </CardActions>
              </Card>
            ))}
          </div>
        </CustomTabPanel>

        {/* Assignments Tab */}
        <CustomTabPanel value={value} index={1}>
          <Typography>Assignments will be listed here.</Typography>
        </CustomTabPanel>

        {/* Quizzes Tab */}
        <CustomTabPanel value={value} index={2}>
          <Typography>Quizzes will be listed here.</Typography>
        </CustomTabPanel>

        {/* Viva Assignment Tab */}
        <CustomTabPanel value={value} index={3}>
         <ShowAllViva classId={classId}/>
        </CustomTabPanel>
      </Box>

      {/* Upload Lecture Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box className="modal-box">
          <Typography variant="h6">Upload Lecture</Typography>
          <TextField
            name="title"
            label="Title"
            fullWidth
            margin="dense"
            value={lectureData.title}
            onChange={handleInputChange}
          />
          <TextField
            name="description"
            label="Description"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            value={lectureData.description}
            onChange={handleInputChange}
          />
          <TextField
            name="youtubeLink"
            label="YouTube Video Link"
            fullWidth
            margin="dense"
            value={lectureData.youtubeLink}
            onChange={handleInputChange}
          />
          <input
            type="file"
            accept="video/*"
            style={{ marginTop: '10px' }}
            onChange={handleFileChange}
          />
          <div className="modal-actions">
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Upload
            </Button>
          </div>
        </Box>
      </Modal>

    </>
  )
}

export default ClassPage
