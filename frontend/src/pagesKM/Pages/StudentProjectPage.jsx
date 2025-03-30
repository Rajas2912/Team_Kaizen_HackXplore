import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Chip, 
  Divider, 
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Collapse,
  Paper,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Person as PersonIcon,
  Send as SendIcon,
  Description as DescriptionIcon,
  GitHub as GitHubIcon,
  Close as CloseIcon,
  ExpandMore,
  ExpandLess,
  Search as SearchIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import ProjectDocViewer from './ProjectDocViewer';
import GitHubViewer from '../../New_pages/GithubRepo';
import Research from '../../Research Papers/Research';
const StudentProjectPage = ({ currentUser }) => {
  // State for Projects and Teachers
  const [teachers, setTeachers] = useState([]);
  const [docUrl, setDocUrl] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState({
    teachers: true,
    projects: true,
    research: false
  });
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [requestData, setRequestData] = useState({
    teacherId: '',
    title: '',
    description: '',
    message: '',
    githubRepo: ''
  });
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [selectedRepoUrl, setSelectedRepoUrl] = useState('');
  
  // State for Research Discovery
  const [researchQuery, setResearchQuery] = useState('');
  const [researchResults, setResearchResults] = useState(null);

  // Fetch teachers and projects on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teachers
        const teachersRes = await fetch('http://localhost:4001/api/projects/teachers');
        if (!teachersRes.ok) throw new Error('Failed to fetch teachers');
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);
        
        // Fetch projects
        const projectsRes = await fetch(`http://localhost:4001/api/projects/student-projects/${currentUser._id}`);
        if (!projectsRes.ok) throw new Error('Failed to fetch projects');
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(prev => ({ ...prev, teachers: false, projects: false }));
      }
    };
    
    fetchData();
  }, [currentUser]);

  // Extract Google Doc ID from URL
  const extractGoogleDocId = (url) => {
    if (!url) return '';
    const urlMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) return urlMatch[1];
    const idMatch = url.match(/^[a-zA-Z0-9_-]+$/);
    if (idMatch) return url;
    return '';
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedProject(null);
  };



  // Handle project request submission
  const handleRequest = async () => {
    try {
      const docId = extractGoogleDocId(docUrl);
      if (docUrl && !docId) {
        setError('Please enter a valid Google Docs URL');
        return;
      }
      
      const res = await fetch('http://localhost:4001/api/projects/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: requestData.teacherId,
          studentId: currentUser._id,
          title: requestData.title,
          description: requestData.description,
          studentRequest: requestData.message,
          googleDocId: docId,
          githubRepo: requestData.githubRepo 
        })
      });
      
      if (!res.ok) throw new Error('Failed to submit request');
      const newProject = await res.json();
      
      setProjects([newProject, ...projects]);
      setOpenDialog(false);
      setRequestData({
        teacherId: '',
        title: '',
        description: '',
        message: '',
        githubRepo: ''
      });
      setDocUrl('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Get status chip for project
  const getStatusChip = (status) => {
    const statusMap = {
      requested: { color: 'info', label: 'Pending' },
      accepted: { color: 'success', label: 'Accepted' },
      rejected: { color: 'error', label: 'Rejected' },
      completed: { color: 'primary', label: 'Completed' }
    };
    return <Chip color={statusMap[status].color} label={statusMap[status].label} size="small" />;
  };

  // Handle project selection
  const handleProjectSelect = (project) => {
    if (project && project._id !== selectedProject?._id) {
      setSelectedProject(project);
    } else {
      setSelectedProject(null);
    }
  };

  // Handle GitHub repo view
  const handleViewGitHub = (repoUrl) => {
    setSelectedRepoUrl(repoUrl);
    setGithubModalOpen(true);
  };

  // Search for research papers

  return (
    <Box className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Typography variant="h4" className="text-gray-800 font-bold mb-6">
        Project Management Portal
      </Typography>
      
      {/* Error Snackbar */}
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}

      {/* Navigation Tabs */}
      <Paper className="mb-6 rounded-lg shadow-sm">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            value="projects" 
            label="My Project Requests" 
            icon={<DescriptionIcon />}
            iconPosition="start"
            className="py-4 font-medium"
          />
          <Tab 
            value="teachers" 
            label="Available Teachers" 
            icon={<PersonIcon />}
            iconPosition="start"
            className="py-4 font-medium"
          />
          <Tab 
            value="research" 
            label="Research Discovery" 
            icon={<SearchIcon />}
            iconPosition="start"
            className="py-4 font-medium"
          />
        </Tabs>
      </Paper>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <Card className="rounded-xl shadow-sm">
          <Box className="p-4 border-b border-gray-100">
            <Typography variant="h6" className="text-gray-700 font-semibold">
              My Project Requests
            </Typography>
          </Box>
          
          {loading.projects ? (
            <Box className="flex justify-center items-center p-8">
              <CircularProgress />
            </Box>
          ) : projects.length === 0 ? (
            <Box className="p-8 text-center text-gray-500">
              <Typography>No projects yet</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                className="mt-4"
                onClick={() => setActiveTab('teachers')}
              >
                Request a Project
              </Button>
            </Box>
          ) : (
            <List className="divide-y divide-gray-100">
              {projects.map(project => (
                <React.Fragment key={project._id}>
                  <ListItem 
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedProject?._id === project._id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={project.teacher?.profile_pic} 
                        className="bg-blue-100 text-blue-600"
                      >
                        {project.teacher?.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <Typography className="font-medium text-gray-800">
                            {project.title}
                          </Typography>
                          {getStatusChip(project.status)}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography className="text-sm text-gray-600">
                            With: {project.teacher?.name}
                          </Typography>
                          <Typography className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {project.description}
                          </Typography>
                          {project.teacherResponse && (
                            <Typography className="text-sm text-gray-600 mt-1 line-clamp-2">
                              <span className="font-medium">Teacher's response:</span> {project.teacherResponse}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <Box className="flex gap-1 ml-2">
                      {project.githubRepo && (
                        <Tooltip title="View GitHub Repository">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewGitHub(project.githubRepo);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <GitHubIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={project.googleDocId ? "View Document" : "No document attached"}>
                        <IconButton
                          size="small"
                          disabled={!project.googleDocId}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProjectSelect(project);
                          }}
                          className={`${project.googleDocId ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300'}`}
                        >
                          <DescriptionIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectSelect(project);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedProject?._id === project._id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </ListItem>
                  
                  {/* Expanded Project Details */}
                  <Collapse in={selectedProject?._id === project._id} timeout="auto" unmountOnExit>
                    {selectedProject && (
                      <Box className="p-4 bg-gray-50 border-t border-gray-200">
                        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <Box>
                            <Typography variant="subtitle2" className="text-gray-500 mb-1">
                              Status
                            </Typography>
                            {selectedProject.status && getStatusChip(selectedProject.status)}
                          </Box>
                          {selectedProject.teacherResponse && (
                            <Box>
                              <Typography variant="subtitle2" className="text-gray-500 mb-1">
                                Teacher's Response
                              </Typography>
                              <Typography className="text-gray-800">
                                {selectedProject.teacherResponse}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        {selectedProject.githubRepo && (
                          <Box className="mb-4">
                            <Button
                              variant="outlined"
                              startIcon={<GitHubIcon />}
                              onClick={() => handleViewGitHub(selectedProject.githubRepo)}
                              className="text-sm"
                              fullWidth
                            >
                              View GitHub Repository
                            </Button>
                          </Box>
                        )}
                        
                        {selectedProject.googleDocId && (
                          <Box>
                            <Typography variant="subtitle2" className="text-gray-500 mb-2">
                              Project Document
                            </Typography>
                            <Box className="h-[70vh] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
                              <ProjectDocViewer docId={selectedProject.googleDocId} />
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Collapse>
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>
      )}

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <Card className="rounded-xl shadow-sm">
          <Box className="p-4 border-b border-gray-100">
            <Typography variant="h6" className="text-gray-700 font-semibold">
              Available Teachers
            </Typography>
          </Box>
          
          {loading.teachers ? (
            <Box className="flex justify-center items-center p-8">
              <CircularProgress />
            </Box>
          ) : teachers.length === 0 ? (
            <Box className="p-8 text-center text-gray-500">
              <Typography>No teachers available</Typography>
            </Box>
          ) : (
            <List className="divide-y divide-gray-100">
              {teachers.map(teacher => (
                <ListItem 
                  key={teacher._id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={teacher.profile_pic} 
                      className="bg-purple-100 text-purple-600"
                    >
                      {teacher.name?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography className="font-medium text-gray-800">
                        {teacher.name}
                      </Typography>
                    }
                    secondary={
                      <Typography className="text-sm text-gray-600">
                        {teacher.email}
                      </Typography>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SendIcon fontSize="small" />}
                    onClick={() => {
                      setRequestData(prev => ({ ...prev, teacherId: teacher._id }));
                      setOpenDialog(true);
                    }}
                    className="text-sm"
                  >
                    Request
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </Card>
      )}

      {/* Research Discovery Tab */}
      {activeTab === 'research' && (
        <Research></Research>
      )}

      {/* Request Project Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ className: "rounded-lg" }}
      >
        <DialogTitle className="text-gray-800 font-semibold border-b border-gray-100">
          Request Project Guidance
        </DialogTitle>
        <DialogContent className="space-y-4 py-4">
          <FormControl fullWidth size="small">
            <InputLabel>Teacher</InputLabel>
            <Select
              value={requestData.teacherId}
              onChange={(e) => setRequestData({...requestData, teacherId: e.target.value})}
              label="Teacher"
              required
              className="bg-gray-50"
            >
              {teachers.map(teacher => (
                <MenuItem key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="Project Title"
            value={requestData.title}
            onChange={(e) => setRequestData({...requestData, title: e.target.value})}
            required
            className="bg-gray-50"
          />

          <TextField
            fullWidth
            size="small"
            label="Project Description"
            multiline
            rows={3}
            value={requestData.description}
            onChange={(e) => setRequestData({...requestData, description: e.target.value})}
            required
            className="bg-gray-50"
          />

          <TextField
            fullWidth
            size="small"
            label="GitHub Repository URL"
            value={requestData.githubRepo}
            onChange={(e) => setRequestData({...requestData, githubRepo: e.target.value})}
            placeholder="https://github.com/username/repo"
            className="bg-gray-50"
          />

          <TextField
            fullWidth
            size="small"
            label="Google Docs URL (Optional)"
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="https://docs.google.com/document/d/your-doc-id"
            helperText="Create a Google Doc and share it with your teacher"
            className="bg-gray-50"
          />

          <TextField
            fullWidth
            size="small"
            label="Your Message to Teacher"
            multiline
            rows={4}
            value={requestData.message}
            onChange={(e) => setRequestData({...requestData, message: e.target.value})}
            required
            className="bg-gray-50"
          />
        </DialogContent>
        <DialogActions className="p-4 border-t border-gray-100">
          <Button 
            onClick={() => setOpenDialog(false)}
            className="text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRequest}
            disabled={!requestData.teacherId || !requestData.title || !requestData.message}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* GitHub Viewer Modal */}
      <Dialog
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          className: "h-[90vh] rounded-lg overflow-hidden"
        }}
      >
        <DialogTitle className="flex justify-between items-center border-b border-gray-100 bg-gray-50">
          <Typography className="text-gray-800 font-semibold">
            GitHub Repository: {selectedRepoUrl}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setGithubModalOpen(false)}
            size="small"
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className="p-0 bg-white">
          <GitHubViewer initialUrl={selectedRepoUrl} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudentProjectPage;