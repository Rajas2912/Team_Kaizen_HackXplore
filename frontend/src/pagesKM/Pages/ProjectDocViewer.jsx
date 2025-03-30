import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ProjectDocViewer = ({ docId }) => {
  if (!docId) {
    return (
      <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="text.secondary">No document ID provided</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1 }}>
        <iframe
          src={`https://docs.google.com/document/d/${docId}/edit`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          title="Google Doc"
          allowFullScreen
        />
      </Box>
    </Box>
  );
};

export default ProjectDocViewer;