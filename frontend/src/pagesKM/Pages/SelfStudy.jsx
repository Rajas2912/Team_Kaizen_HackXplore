import React, { useState } from 'react';
import Mindmap from '../../pages_rajas/Mindmap';
import {
  Button,
  Box,
  Typography,
  Paper,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  AccountTree as MindMapIcon,
  VisibilityOff as VisibilityOffIcon,
  NoteAdd as NoteAddIcon,
  CloudUpload as CloudUploadIcon,
  AutoGraph as AutoGraphIcon
} from '@mui/icons-material';

const SelfStudy = () => {
  const [showMindmap, setShowMindmap] = useState(false);
  const [viewMode, setViewMode] = useState('mindmap'); // 'mindmap' or 'notes'

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Container maxWidth="xl" className="py-8">
      <Paper elevation={3} className="p-6 mb-6">
        <Typography variant="h4" component="h1" className="mb-4 font-bold text-gray-800">
          Self-Study Toolkit
        </Typography>
        
        <Typography variant="body1" className="mb-6 text-gray-600">
          Transform your learning materials into interactive mindmaps or structured notes.
        </Typography>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            className="bg-gray-100 rounded-lg"
          >
            <ToggleButton value="mindmap" aria-label="mindmap view">
              <Tooltip title="Mindmap View">
                <div className="flex items-center gap-2 px-3 py-2">
                  <MindMapIcon fontSize="small" />
                  <span className="hidden sm:inline">Mindmap</span>
                </div>
              </Tooltip>
            </ToggleButton>

          </ToggleButtonGroup>

        </div>

        <Box className="flex justify-center">
          <Button
            onClick={() => setShowMindmap(!showMindmap)}
            variant="contained"
            color="secondary"
            startIcon={showMindmap ? <VisibilityOffIcon /> : <MindMapIcon />}
            className="transition-all duration-300 transform hover:scale-105"
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
              '&:hover': {
                boxShadow: '0 5px 8px 3px rgba(33, 150, 243, .4)',
              },
            }}
          >
            {showMindmap ? 'Hide Mindmap' : 'Create Mindmap'}
          </Button>
        </Box>
      </Paper>

      {showMindmap && (
        <Paper elevation={2} className="p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="font-semibold text-gray-700">
              Interactive Mindmap
            </Typography>
            <Tooltip title="Fullscreen">
              <IconButton color="primary">
                <span className="material-icons">fullscreen</span>
              </IconButton>
            </Tooltip>
          </div>
          <Mindmap />
        </Paper>
      )}

      {viewMode === 'notes' && !showMindmap && (
        <Paper elevation={2} className="p-6 mt-6 rounded-lg">
          <Typography variant="h6" className="mb-4 font-semibold text-gray-700">
            Study Notes
          </Typography>
          <Box className="bg-gray-50 p-4 rounded border border-gray-200 min-h-[300px]">
            <Typography color="textSecondary">
              {showMindmap 
                ? "Switch from mindmap view to see your notes here." 
                : "Your structured notes will appear here. Upload materials to get started."}
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default SelfStudy;