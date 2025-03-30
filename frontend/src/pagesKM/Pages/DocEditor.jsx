import React, { useState } from 'react';
import { 
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  Zoom,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Edit as EditIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

const DocEditor = ({ docId, open, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Clean and validate the docId
  const cleanDocId = () => {
    if (!docId) return null;
    
    // Extract ID from URL if full URL was passed
    const urlMatch = docId.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) return urlMatch[1];
    
    // Return as-is if it's already just an ID
    const idMatch = docId.match(/^[a-zA-Z0-9_-]+$/);
    if (idMatch) return docId;
    
    return null;
  };

  const validDocId = cleanDocId();
  const iframeUrl = validDocId 
    ? `https://docs.google.com/document/d/${validDocId}/edit${isEditing ? '' : '?rm=minimal&embedded=true'}`
    : null;

  const handleOpenInNewTab = () => {
    if (validDocId) {
      window.open(`https://docs.google.com/document/d/${validDocId}/edit`, '_blank');
    }
  };

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
          bgcolor: 'rgba(0,0,0,0.7)',
          p: 1,
          borderRadius: 1,
          backdropFilter: 'blur(4px)'
        }}
      >
        {validDocId && (
          <>
            <Tooltip title={isEditing ? 'View mode' : 'Edit mode'} arrow>
              <IconButton
                onClick={() => setIsEditing(!isEditing)}
                sx={{ color: 'white' }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Open in new tab" arrow>
              <IconButton
                onClick={handleOpenInNewTab}
                sx={{ color: 'white' }}
              >
                <OpenInNewIcon />
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
          </>
        )}
        
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
        {validDocId ? (
          <Fade in={true} timeout={500}>
            <Box sx={{ 
              height: '100%',
              width: '100%',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}>
              {!loaded && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}>
                  <CircularProgress />
                </Box>
              )}
              <iframe
                src={iframeUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  minHeight: '500px',
                  visibility: loaded ? 'visible' : 'hidden'
                }}
                onLoad={() => setLoaded(true)}
                allow="autoplay; clipboard-write"
                title="Google Docs Editor"
              />
            </Box>
          </Fade>
        ) : (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            flexDirection: 'column',
            p: 4,
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="error" gutterBottom>
              Invalid Document ID
            </Typography>
            <Typography>
              The provided Google Docs link is not valid. Please check the URL format.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Example format: https://docs.google.com/document/d/ABC123xyz/edit
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocEditor;