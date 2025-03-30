import React, { useState, useRef, useEffect } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import { Toolbar } from 'markmap-toolbar';
import 'markmap-toolbar/dist/style.css';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import { Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';

const transformer = new Transformer();

function renderToolbar(mm, wrapper) {
  if (!wrapper) return;
  while (wrapper.firstChild) wrapper.firstChild.remove();

  const toolbar = new Toolbar();
  toolbar.attach(mm);

  toolbar.register({
    id: 'alert',
    title: 'Show Alert',
    content: 'Alert',
    onClick: () => alert('You made it!'),
  });

  toolbar.setItems([...Toolbar.defaultItems, 'alert']);
  wrapper.append(toolbar.render());
}

const Mindmap = () => {
  const [value, setValue] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const refSvg = useRef(null);
  const refMm = useRef(null);
  const refToolbar = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/mipmap', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.text();
        setValue(data);
        setShowModal(false);
      } else {
        throw new Error('Failed to process the PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (refMm.current) return;

    const mm = Markmap.create(refSvg.current);
    refMm.current = mm;
    renderToolbar(mm, refToolbar.current);
  }, []);

  useEffect(() => {
    if (!refMm.current) return;

    const { root } = transformer.transform(value);
    refMm.current.setData(root).then(() => {
      refMm.current.fit();
    });
  }, [value]);

  return (
    <Box className="flex flex-col h-screen bg-gray-50">
      {/* Modal for PDF Upload */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <Typography variant="h6">Upload PDF to Generate Mindmap</Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setShowModal(false)}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent className="py-6">
          <Paper
            variant="outlined"
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors ${isLoading ? 'opacity-50' : ''}`}
            onClick={() => !isLoading && fileInputRef.current.click()}
          >
            {isLoading ? (
              <div className="flex flex-col items-center">
                <CircularProgress className="mb-4" />
                <Typography>Processing your PDF...</Typography>
              </div>
            ) : (
              <>
                <UploadIcon className="text-4xl text-gray-400 mb-4" />
                <Typography variant="body1" className="mb-2 text-center">
                  Drag & drop your PDF here, or click to browse
                </Typography>
                <Typography variant="body2" color="textSecondary" className="mb-4">
                  Supported format: PDF
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<UploadIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current.click();
                  }}
                >
                  Select PDF
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </>
            )}
          </Paper>
          
          {error && (
            <Typography color="error" className="mt-4 text-center">
              {error}
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions className="px-6 py-4">
          <Button
            onClick={() => setShowModal(false)}
            color="secondary"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mindmap Display */}
      <Box className="flex-1 relative">
        <svg
          ref={refSvg}
          className="w-full h-full border border-gray-200 rounded-lg shadow-sm bg-white"
        />
        <div
          ref={refToolbar}
          className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-1"
        />
      </Box>

      {/* Floating action button to reopen upload modal */}
      {!showModal && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadIcon />}
          className="fixed bottom-6 right-6 shadow-lg"
          onClick={() => setShowModal(true)}
        >
          Upload New PDF
        </Button>
      )}
    </Box>
  );
};

export default Mindmap;