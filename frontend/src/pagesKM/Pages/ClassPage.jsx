import React from 'react'
import './ClassPage.css'
import { useGetClassDetailsQuery } from '../../redux/api/classApiSlice'
import {
  Box,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Button,
  Chip,
  IconButton,
} from '@mui/material'
import PropTypes from 'prop-types'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import AssignmentIcon from '@mui/icons-material/Assignment'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate } from 'react-router-dom'
import CreateViva from '../../pagesPP/Viva/CreateViva'
import ShowAllViva from '../../pagesPP/Viva/AllVivaById'
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
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  if (isLoading) return <div className="loading">Loading class details...</div>
  if (error) return <div className="error">Error loading class details</div>

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
            <Tab label="Assignments" {...a11yProps(0)} />
            <Tab label="Quizzes" {...a11yProps(1)} />
            <Tab label="Viva Assignment" {...a11yProps(2)} />
            <Tab label="" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Box className="class-container">
            {/* Class Header */}
            <Paper className="class-header" elevation={3}>
              <Typography variant="h4" component="h1" className="class-title">
                {classData.classData?.name}
              </Typography>
              <Typography variant="subtitle1" className="class-code">
                Class Code: {classData.classData?.classCode}
              </Typography>
              <Typography variant="subtitle2" className="class-teacher">
                Teacher: {classData.classData?.teacher?.name}
              </Typography>
            </Paper>

            {/* Main Content Grid */}
            <Grid container spacing={3} className="class-content">
              {/* Students List */}
              <Grid item xs={12} md={4}>
                <Paper className="students-card" elevation={2}>
                  <Typography variant="h6" className="students-title">
                    <PeopleAltIcon className="students-icon" />
                    Students ({classData.classData?.students?.length})
                  </Typography>
                  <List className="students-list">
                    {classData.classData?.students?.map((student) => (
                      <ListItem key={student._id} className="student-item">
                        <ListItemAvatar>
                          <Avatar
                            src={student.profile_pic}
                            className="student-avatar"
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={student.name}
                          secondary={student.email}
                          className="student-details"
                        />
                      </ListItem>
                    ))}
                    {classData.classData?.students?.length === 0 && (
                      <Typography variant="body2" className="no-students-text">
                        No students enrolled yet
                      </Typography>
                    )}
                  </List>
                </Paper>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box className="action-buttons">
              <Button
                variant="contained"
                className="upload-button"
                onClick={() => navigate(`/class/${classId}/upload-lecture`)}
              >
                Upload Lecture
              </Button>
            </Box>
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          Assignments
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          Quizzes
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
        <ShowAllViva classId={classId} />
        </CustomTabPanel>
      </Box>
    </>
  )
}

export default ClassPage
