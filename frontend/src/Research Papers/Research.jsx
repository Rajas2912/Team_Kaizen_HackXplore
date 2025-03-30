import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Link,
  Grid,
  Container,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Article as ArticleIcon,
  People as PeopleIcon
} from '@mui/icons-material';

const Research = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPapers = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('http://localhost:5000/research', { query });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch research data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className="py-12">
      {/* Header */}
      <Box className="text-center mb-12">
        <Typography 
          variant="h2" 
          className="font-bold text-gray-800 mb-4"
          sx={{ 
            fontSize: { xs: '2rem', md: '3rem' },
            background: 'linear-gradient(45deg, #4f46e5 30%, #10b981 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Academic Insight Engine
        </Typography>
        <Typography variant="subtitle1" className="text-gray-500">
          Discover, analyze, and connect with cutting-edge research
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper elevation={3} className="p-6 mb-12 bg-gradient-to-r from-blue-50 to-green-50">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search research topics (e.g., 'Quantum Machine Learning')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchPapers()}
              InputProps={{
                className: "bg-white rounded-lg"
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={searchPapers}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : <SearchIcon />}
              className="h-14 bg-gradient-to-r from-blue-600 to-green-600 hover:shadow-lg transition-all"
            >
              {loading ? 'Analyzing...' : 'Discover'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Paper elevation={2} className="p-4 mb-8 bg-red-50">
          <Typography color="error" className="text-center">
            ⚠️ {error}
          </Typography>
        </Paper>
      )}

      {/* Results */}
      {results && (
        <Box className="space-y-12">
          {/* Overview Section */}
          <Paper elevation={2} className="p-6 bg-indigo-50 rounded-xl">
            <Typography variant="h5" className="font-bold mb-4 text-indigo-800 flex items-center">
              <ArticleIcon className="mr-2" /> Research Overview
            </Typography>
            <Typography className="text-gray-700 leading-relaxed">
              {results.overview}
            </Typography>
          </Paper>

          {/* Papers Section */}
          <Box>
            <Typography variant="h5" className="font-bold mb-6 text-gray-800">
              📚 Key Papers
            </Typography>
            <Grid container spacing={4}>
              {results.papers.map((paper, index) => (
                <Grid item xs={12} key={index}>
                  <Accordion 
                    elevation={3} 
                    className="rounded-lg overflow-hidden transition-all hover:shadow-lg"
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      className="bg-gradient-to-r from-blue-50 to-green-50"
                    >
                      <Box className="w-full">
                        <Typography variant="h6" className="font-medium text-gray-800">
                          {paper.title}
                        </Typography>
                        <Box className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(paper.authors) && paper.authors.slice(0, 3).map((author, i) => (
                            <Chip
                              key={i}
                              avatar={<Avatar>{author[0]}</Avatar>}
                              label={author}
                              variant="outlined"
                              size="small"
                              className="border-blue-100 bg-blue-50"
                            />
                          ))}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails className="bg-white">
                      <Box className="space-y-4">
                        <Typography variant="body1" className="text-gray-700">
                          {paper.summary}
                        </Typography>
                        {paper.url && (
                          <Button
                            variant="outlined"
                            href={paper.url}
                            target="_blank"
                            rel="noopener"
                            startIcon={<ArticleIcon />}
                            className="border-blue-400 text-blue-600 hover:bg-blue-50"
                          >
                            View Full Paper
                          </Button>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Research;