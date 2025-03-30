import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Avatar, 
  IconButton, 
  Badge,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Description as DescriptionIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Add as AddIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const CollaborativeProjectReport = () => {
  const [userType, setUserType] = useState('teacher'); // or 'student'
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [docHistory, setDocHistory] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mock data - in a real app, this would come from API calls
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          title: 'AI Research Project',
          description: 'Exploring machine learning algorithms',
          students: ['Student 1', 'Student 2'],
          teacher: 'Dr. Smith',
          status: 'in-progress',
          lastUpdated: '2023-05-15',
          docId: 'mock-doc-id-1'
        },
        {
          id: '2',
          title: 'Blockchain Implementation',
          description: 'Building a decentralized application',
          students: ['Student 3'],
          teacher: 'Prof. Johnson',
          status: 'completed',
          lastUpdated: '2023-04-28',
          docId: 'mock-doc-id-2'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Load document content when a project is selected
  useEffect(() => {
    if (selectedProject) {
      setIsLoading(true);
      // In a real app, this would call Google Docs API
      setTimeout(() => {
        setDocContent(`
          <h1>${selectedProject.title}</h1>
          <h2>Project Report</h2>
          <p>${selectedProject.description}</p>
          <h3>Introduction</h3>
          <p>This section would contain collaborative content from students and teachers.</p>
          <h3>Methodology</h3>
          <p>Details about the project approach would appear here.</p>
        `);
        setIsLoading(false);
      }, 800);
    }
  }, [selectedProject]);

  const handleCreateProject = () => {
    // In a real app, this would call your backend API
    const newProject = {
      id: `new-${projects.length + 1}`,
      title: newProjectTitle,
      description: newProjectDescription,
      students: [],
      teacher: 'Current User',
      status: 'draft',
      lastUpdated: new Date().toISOString(),
      docId: `mock-doc-id-new-${projects.length + 1}`
    };
    
    setProjects([...projects, newProject]);
    setOpenNewProjectDialog(false);
    setNewProjectTitle('');
    setNewProjectDescription('');
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: `comment-${comments.length + 1}`,
        author: userType === 'student' ? 'Student' : 'Teacher',
        text: newComment,
        timestamp: new Date().toISOString(),
        resolved: false
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const toggleResolveComment = (commentId) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, resolved: !comment.resolved } 
        : comment
    ));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // In a real implementation, these would call Google Docs API
  const loadGoogleDoc = (docId) => {
    console.log(`Loading Google Doc with ID: ${docId}`);
    // Here you would implement the Google Docs API integration
    // For example:
    // gapi.client.docs.documents.get({
    //   documentId: docId
    // }).then(response => {
    //   setDocContent(response.result.body.content);
    // });
  };

  const saveToGoogleDoc = (content) => {
    console.log(`Saving content to Google Doc`);
    // Google Docs API update would go here
  };

  const requestGuidance = () => {
    // This would notify the teacher in a real app
    alert('Guidance requested from teacher!');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        className="z-10 bg-white text-gray-800 shadow-sm"
        sx={{ width: { sm: `calc(100% - 240px)` }, ml: { sm: `240px` } }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="mr-2 sm:hidden"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" className="flex-grow">
            {selectedProject ? selectedProject.title : 'Project Reports'}
          </Typography>
          <div className="flex items-center space-x-2">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="primary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <AccountCircleIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        className="block sm:hidden"
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <ProjectSidebar 
          projects={projects} 
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          userType={userType}
          onNewProjectClick={() => setOpenNewProjectDialog(true)}
        />
      </Drawer>
      <Drawer
        variant="permanent"
        className="hidden sm:block"
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
        open
      >
        <ProjectSidebar 
          projects={projects} 
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          userType={userType}
          onNewProjectClick={() => setOpenNewProjectDialog(true)}
        />
      </Drawer>

      {/* Main Content */}
      <main className="flex-grow p-4 mt-16 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        ) : selectedProject ? (
          <div className="space-y-6">
            {/* Project Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{selectedProject.title}</h1>
                <p className="text-gray-600 mt-2">{selectedProject.description}</p>
                <div className="flex items-center mt-4 space-x-4">
                  <Chip 
                    icon={<SchoolIcon fontSize="small" />} 
                    label={`Teacher: ${selectedProject.teacher}`} 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<GroupIcon fontSize="small" />} 
                    label={`${selectedProject.students.length} student(s)`} 
                    variant="outlined" 
                  />
                  <Chip 
                    label={selectedProject.status === 'completed' ? 'Completed' : 'In Progress'} 
                    color={selectedProject.status === 'completed' ? 'success' : 'primary'} 
                    variant="outlined" 
                  />
                </div>
              </div>
              {userType === 'student' && (
                <Button 
                  variant="contained" 
                  startIcon={<SendIcon />}
                  onClick={requestGuidance}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Request Guidance
                </Button>
              )}
            </div>

            <Divider />

            {/* Collaborative Document Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <DescriptionIcon className="text-blue-500" />
                  <span className="font-medium">Collaborative Document</span>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(selectedProject.lastUpdated).toLocaleString()}
                </div>
              </div>
              
              {/* In a real app, this would be replaced with Google Docs embed or proper API integration */}
              <div 
                className="p-6 min-h-[400px] prose max-w-none"
                dangerouslySetInnerHTML={{ __html: docContent }}
              />
              
              {/* Document editing controls */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-2">
                {userType === 'teacher' ? (
                  <>
                    <Button 
                      variant="outlined" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => loadGoogleDoc(selectedProject.docId)}
                    >
                      View Edits
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<EditIcon />}
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => loadGoogleDoc(selectedProject.docId)}
                    >
                      Add Feedback
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="contained" 
                    startIcon={<EditIcon />}
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => loadGoogleDoc(selectedProject.docId)}
                  >
                    Edit Document
                  </Button>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium flex items-center space-x-2">
                  <span>Comments & Feedback</span>
                  <Chip label={comments.length} size="small" />
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div 
                      key={comment.id} 
                      className={`p-3 rounded-lg border ${comment.resolved ? 'border-green-100 bg-green-50' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            {comment.author.charAt(0)}
                          </Avatar>
                          <div>
                            <div className="font-medium">{comment.author}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {userType === 'teacher' && (
                          <IconButton 
                            size="small" 
                            onClick={() => toggleResolveComment(comment.id)}
                            color={comment.resolved ? 'success' : 'default'}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        )}
                      </div>
                      <div className="mt-2 pl-10 text-gray-700">
                        {comment.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Add your feedback or questions.
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-2">
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={userType === 'teacher' ? 'Add feedback for students...' : 'Ask a question to your teacher...'}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button 
                    variant="contained" 
                    startIcon={<SendIcon />}
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleAddComment}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <DescriptionIcon className="text-gray-400 text-5xl mb-4" />
            <h2 className="text-2xl font-medium text-gray-700 mb-2">No Project Selected</h2>
            <p className="text-gray-500 max-w-md mb-6">
              {userType === 'teacher' 
                ? 'Select a project to view student reports or create a new project.' 
                : 'Select a project to collaborate on or request a new project.'}
            </p>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setOpenNewProjectDialog(true)}
            >
              {userType === 'teacher' ? 'Create New Project' : 'Request New Project'}
            </Button>
          </div>
        )}
      </main>

      {/* New Project Dialog */}
      <Dialog 
        open={openNewProjectDialog} 
        onClose={() => setOpenNewProjectDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {userType === 'teacher' ? 'Create New Project' : 'Request Project Guidance'}
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4 mt-2">
            <TextField
              fullWidth
              label="Project Title"
              variant="outlined"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
            />
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={4}
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
            />
            {userType === 'student' && (
              <TextField
                fullWidth
                label="Teacher to Request"
                variant="outlined"
                select
                SelectProps={{ native: true }}
                defaultValue=""
              >
                <option value="">Select a teacher</option>
                <option value="1">Dr. Smith</option>
                <option value="2">Prof. Johnson</option>
                <option value="3">Dr. Williams</option>
              </TextField>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewProjectDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateProject}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {userType === 'teacher' ? 'Create Project' : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Sidebar component
const ProjectSidebar = ({ projects, selectedProject, setSelectedProject, userType, onNewProjectClick }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Typography variant="h6" className="font-medium">
          {userType === 'teacher' ? 'My Guided Projects' : 'My Projects'}
        </Typography>
      </div>
      <div className="flex-grow overflow-y-auto">
        <List>
          {projects.map((project) => (
            <ListItem 
              button 
              key={project.id}
              selected={selectedProject?.id === project.id}
              onClick={() => setSelectedProject(project)}
              className="border-b border-gray-100"
            >
              <ListItemIcon>
                <DescriptionIcon className={selectedProject?.id === project.id ? "text-blue-500" : "text-gray-500"} />
              </ListItemIcon>
              <ListItemText 
                primary={project.title} 
                secondary={
                  <span className={`text-xs ${project.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                    {project.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                } 
              />
            </ListItem>
          ))}
        </List>
      </div>
      <div className="p-4 border-t border-gray-200">
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewProjectClick}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {userType === 'teacher' ? 'New Project' : 'Request Project'}
        </Button>
      </div>
    </div>
  );
};

export default CollaborativeProjectReport;