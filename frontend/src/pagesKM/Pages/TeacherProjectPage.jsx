import React, { useState, useEffect } from 'react';
import GitHubViewer from '../../New_pages/GithubRepo';
import ProjectDocViewer from './ProjectDocViewer';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
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
  Badge,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import GitHubIcon from '@mui/icons-material/GitHub';

const TeacherProjectPage = ({ currentUser }) => {
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [selectedRepoUrl, setSelectedRepoUrl] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [response, setResponse] = useState({
    status: 'accepted',
    message: '',
    docLink: ''
  });
  const [viewingDocId, setViewingDocId] = useState(null);
  const [docViewerOpen, setDocViewerOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://localhost:4001/api/projects/teacher-requests/${currentUser._id}`);
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    try {
      const res = await fetch('http://localhost:4001/api/projects/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedRequest._id,
          status: response.status,
          teacherResponse: response.message,
          googleDocId: response.docLink
        })
      });
      
      if (!res.ok) throw new Error('Failed to submit response');
      const updatedRequest = await res.json();
      
      setRequests(requests.map(req => 
        req._id === updatedRequest._id ? updatedRequest : req
      ));
      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDoc = (docId) => {
    if (!docId) {
      setError('No Google Doc attached to this project');
      return;
    }
    
    if (viewingDocId === docId) {
        console.log(docId)
        console.log("2")
      // If clicking the same doc, toggle the viewer
      setDocViewerOpen(!docViewerOpen);
    } else {
      // If clicking a different doc, show that one
      console.log(docId)
      console.log("3")
      setViewingDocId(docId);
      setDocViewerOpen(true);
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      requested: { color: 'warning', label: 'Pending' },
      accepted: { color: 'success', label: 'Accepted' },
      rejected: { color: 'error', label: 'Rejected' },
      completed: { color: 'primary', label: 'Completed' }
    };
    return <Chip color={statusMap[status].color} label={statusMap[status].label} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Project Requests</Typography>
      
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}

      {loading ? (
        <CircularProgress />
      ) : requests.length === 0 ? (
        <Typography>No project requests found</Typography>
      ) : (
        <Card>
          <List>
            {requests.map((request) => (
              <div key={request._id}>
                <ListItem>
                  <ListItemAvatar>
                    <Badge 
                      badgeContent={request.status === 'requested' ? '!' : 0} 
                      color="error"
                    >
                      <Avatar src={request.student?.profile_pic} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography fontWeight="bold">{request.title}</Typography>
                        {getStatusChip(request.status)}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography>From: {request.student?.name}</Typography>
                        <Typography>{request.description}</Typography>
                        {request.teacherResponse && (
                          <Typography sx={{ mt: 1 }}>
                            <strong>Your response:</strong> {request.teacherResponse}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  {request.status === 'requested' && (
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        setSelectedRequest(request);
                        setOpenDialog(true);
                      }}
                    >
                      Respond
                    </Button>
                  )}
                  <Button
                    sx={{ ml: 2 }}
                    variant="outlined"
                    onClick={() => handleViewDoc(request.googleDocId)}
                    startIcon={<DescriptionIcon />}
                    endIcon={viewingDocId === request.googleDocId ? 
                      (docViewerOpen ? <ExpandLess /> : <ExpandMore />) : null}
                    disabled={!request.googleDocId}
                  >
                    View Doc
                  </Button>
                  {request.githubRepo && (
                    <Button
                      sx={{ ml: 2 }}
                      variant="outlined"
                      onClick={() => {
                        setSelectedRepoUrl(request.githubRepo);
                        setGithubModalOpen(true);
                      }}
                      startIcon={<GitHubIcon />}
                    >
                      View GitHub
                    </Button>
                  )}
                </ListItem>
                
                {/* Document Viewer Section */}
                <Collapse in={viewingDocId === request.googleDocId && docViewerOpen}>
  <Box sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
    <Typography variant="h6" gutterBottom>
      Document Viewer: {request.title}
    </Typography>
    {request.googleDocId ? (
      <Box sx={{ height: '60vh', border: '1px solid #ddd', borderRadius: 1 }}>
        <ProjectDocViewer docId={request.googleDocId} />
      </Box>
    ) : (
      <Typography color="text.secondary">
        No document attached to this project
      </Typography>
    )}
  </Box>
</Collapse>
                
                <Divider />
              </div>
            ))}
          </List>
        </Card>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Respond to Request</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography><strong>Project:</strong> {selectedRequest?.title}</Typography>
            <Typography><strong>Student:</strong> {selectedRequest?.student?.name}</Typography>
            <Typography><strong>Request:</strong> {selectedRequest?.studentRequest}</Typography>
          </Box>
          {selectedRequest?.githubRepo && (
            <Typography sx={{ mb: 2 }}>
              <strong>GitHub Repo:</strong> <a href={selectedRequest.githubRepo} target="_blank" rel="noopener noreferrer">
                {selectedRequest.githubRepo}
              </a>
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              fullWidth
              variant={response.status === 'accepted' ? 'contained' : 'outlined'}
              color="success"
              startIcon={<CheckIcon />}
              onClick={() => setResponse({...response, status: 'accepted'})}
            >
              Accept
            </Button>
            <Button
              fullWidth
              variant={response.status === 'rejected' ? 'contained' : 'outlined'}
              color="error"
              startIcon={<CloseIcon />}
              onClick={() => setResponse({...response, status: 'rejected'})}
            >
              Reject
            </Button>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Response"
            value={response.message}
            onChange={(e) => setResponse({...response, message: e.target.value})}
            sx={{ mb: 2 }}
          />

          {response.status === 'accepted' && (
            <TextField
              fullWidth
              label="Google Doc Link (optional)"
              placeholder="Paste Google Doc ID or URL"
              value={response.docLink}
              onChange={(e) => setResponse({...response, docLink: e.target.value})}
              helperText="Create a Google Doc and paste its ID or URL here"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleRespond}
            disabled={!response.message}
          >
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            height: '90vh'
          }
        }}
      >
        <DialogTitle>
          GitHub Repository Viewer
          <IconButton
            aria-label="close"
            onClick={() => setGithubModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <GitHubViewer initialUrl={selectedRepoUrl} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TeacherProjectPage;