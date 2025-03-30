import React, { useState, useEffect } from 'react';
import { 
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  Zoom,
  Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const DocEditor = ({ docId, open, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const iframeUrl = `https://docs.google.com/document/d/${docId}/edit${isEditing ? '?usp=sharing' : '?rm=minimal&embedded=true'}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      fullScreen={isFullscreen}
      TransitionComponent={Zoom}
      PaperProps={{
        sx: {
          height: isFullscreen ? '100vh' : '80vh',
          transition: 'all 0.3s ease',
          bgcolor: 'background.paper',
          borderRadius: isFullscreen ? 0 : 2,
          overflow: 'hidden'
        }
      }}
    >
      <Box 
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          display: 'flex',
          gap: 1,
          bgcolor: 'rgba(0,0,0,0.4)',
          p: 1,
          borderRadius: 1,
          backdropFilter: 'blur(4px)'
        }}
      >
        <Tooltip title={isEditing ? 'View mode' : 'Edit mode'} arrow>
          <IconButton
            onClick={() => setIsEditing(!isEditing)}
            sx={{ color: 'white' }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} arrow>
          <IconButton
            onClick={() => setIsFullscreen(!isFullscreen)}
            sx={{ color: 'white' }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Close" arrow>
          <IconButton
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5' }}>
        <Fade in={true} timeout={500}>
          <Box sx={{ 
            height: '100%',
            width: '100%',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}>
            <iframe
              src={iframeUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                minHeight: '500px'
              }}
              onLoad={() => setLoaded(true)}
              allow="autoplay; clipboard-write"
            />
          </Box>
        </Fade>
      </DialogContent>
    </Dialog>
  );
};

export default DocEditor;