import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import {
  GitHub,
  Code,
  People,
  CalendarToday,
  Person,
  Visibility,
  Link,
  Group,
  InsertChart
} from '@mui/icons-material';
import ForkRightIcon from '@mui/icons-material/ForkRight';

const GitHubViewer = ({ initialUrl = '' }) => {
  const [repoUrl, setRepoUrl] = useState(initialUrl);
  const [owner, setOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [rateLimit, setRateLimit] = useState({ remaining: 60, reset: 0 });
  const [contributors, setContributors] = useState([]);
  const [contributorCommits, setContributorCommits] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  // Extract owner and repo name from URL

  // Add this useEffect to auto-load if initialUrl is provided
  useEffect(() => {
    if (initialUrl) {
      fetchRepoData();
    }
  }, [initialUrl]);



  const extractRepoInfo = (url) => {
    try {
      // Handle various GitHub URL formats
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match && match.length >= 3) {
        return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const fetchRepoData = async () => {
    if (!repoUrl) return;
    
    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      setError('Invalid GitHub repository URL. Format: https://github.com/owner/repo');
      return;
    }

    setOwner(repoInfo.owner);
    setRepoName(repoInfo.repo);
    setLoading(true);
    setError('');

    try {
      // Basic headers without authentication
      const headers = {
        Accept: 'application/vnd.github.v3+json'
      };

      // Check rate limit first
      const rateLimitResponse = await axios.get('https://api.github.com/rate_limit', { headers });
      setRateLimit({
        remaining: rateLimitResponse.data.resources.core.remaining,
        reset: rateLimitResponse.data.resources.core.reset
      });

      if (rateLimitResponse.data.resources.core.remaining < 5) {
        const resetTime = new Date(rateLimitResponse.data.resources.core.reset * 1000);
        throw new Error(`GitHub API rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`);
      }

      // Fetch repository basic info
      const repoResponse = await axios.get(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`,
        { headers }
      );
      setRepoData(repoResponse.data);

      // Fetch commits (limited to 30 most recent)
      const commitsResponse = await axios.get(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits?per_page=30`,
        { headers }
      );
      setCommits(commitsResponse.data);

      // Fetch branches
      const branchesResponse = await axios.get(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/branches`,
        { headers }
      );
      setBranches(branchesResponse.data);

      const contributorsResponse = await axios.get(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contributors`,
        { headers }
      );
      setContributors(contributorsResponse.data);
      const commitsByContributor = {};
      commits.forEach(commit => {
        const author = commit.author?.login || commit.commit.author.name;
        commitsByContributor[author] = (commitsByContributor[author] || 0) + 1;
      });
      setContributorCommits(commitsByContributor);

    } catch (err) {
      if (err.response?.status === 404) {
        setError('Repository not found. Make sure it exists and is public.');
      } else if (err.response?.status === 403) {
        // Rate limit exceeded
        const resetTime = new Date(err.response.headers['x-ratelimit-reset'] * 1000);
        setError(`GitHub API rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`);
      } else {
        setError(err.message || 'Failed to fetch repository data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRepoData();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="xl" className="bg-white min-h-screen">
      {/* Header */}
      <Box className="bg-black text-white py-4 mb-8">
        <Container maxWidth="xl">
          <Typography variant="h4" component="h1" className="font-bold">
            GitHub Repository Activity Viewer
          </Typography>
          <Typography variant="subtitle1">
            View public repository activity without authentication
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" className="py-4">
        {/* Repository Input Form */}
        <Paper elevation={3} className="p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="GitHub Repository URL"
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Link color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GitHub />}
                  className="h-14"
                >
                  {loading ? 'Loading...' : 'View Activity'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Rate Limit Info */}
        <Alert severity="info" className="mb-6">
          GitHub API requests remaining: {rateLimit.remaining} (resets at {new Date(rateLimit.reset * 1000).toLocaleTimeString()})
        </Alert>

        {error && (
          <Alert severity="error" className="mb-6">
            {error}
          </Alert>
        )}

        {repoData && (
          <>
            {/* Repository Info */}
            <Card className="mb-6">
              <CardHeader
                avatar={<Avatar src={repoData.owner?.avatar_url} />}
                title={
                  <Typography variant="h5" component="h2">
                    <a 
                      href={repoData.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {repoData.full_name}
                    </a>
                  </Typography>
                }
                subheader={repoData.description}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item>
                    <Chip icon={<Code />} label={`Stars: ${repoData.stargazers_count}`} variant="outlined" />
                  </Grid>
                  <Grid item>
                    <Chip icon={<ForkRightIcon />} label={`Forks: ${repoData.forks_count}`} variant="outlined" />
                  </Grid>
                  <Grid item>
                    <Chip icon={<Visibility />} label={`Watchers: ${repoData.watchers_count}`} variant="outlined" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Paper elevation={2} className="mb-6">
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab icon={<Code />} label={`Commits (${commits.length})`} />
                <Tab icon={<ForkRightIcon />} label={`Branches (${branches.length})`} />
                <Tab icon={<Group />} label={`Contributors (${contributors.length})`} />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            <Box className="mb-8">
              {activeTab === 0 && (
                <Card>
                  <CardHeader
                    title="Recent Commits"
                    subheader={`Showing ${commits.length} most recent commits`}
                  />
                  <Divider />
                  <List>
                    {commits.map((commit) => (
                      <React.Fragment key={commit.sha}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar src={commit.author?.avatar_url} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" className="font-medium">
                                {commit.commit.message.split('\n')[0]}
                              </Typography>
                            }
                            secondary={
                              <>
                                <span className="flex items-center">
                                  <Person fontSize="small" className="mr-1" />
                                  {commit.commit.author.name}
                                </span>
                                <span className="flex items-center">
                                  <CalendarToday fontSize="small" className="mr-1" />
                                  {formatDate(commit.commit.author.date)}
                                </span>
                              </>
                            }
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            href={commit.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Button>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Card>
              )}

              {activeTab === 1 && (
                <Card>
                  <CardHeader title="Branches" />
                  <Divider />
                  <List>
                    {branches.map((branch) => (
                      <React.Fragment key={branch.name}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar className="bg-blue-100 text-blue-600">
                              <ForkRightIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={branch.name}
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Card>
              )}

{activeTab === 2 && (
    <Card>
      <CardHeader
        title="Top Contributors"
        subheader={`Showing ${contributors.length} contributors`}
      />
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Contributor</TableCell>
              <TableCell align="right">Commits</TableCell>
              <TableCell align="right">Contributions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contributors.map((contributor) => (
              <TableRow key={contributor.id}>
                <TableCell component="th" scope="row">
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      src={contributor.avatar_url} 
                      alt={contributor.login}
                      className="mr-2"
                    />
                    <a 
                      href={contributor.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {contributor.login}
                    </a>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Badge 
                    badgeContent={contributorCommits[contributor.login] || 0} 
                    color="primary"
                  >
                    <InsertChart color="action" />
                  </Badge>
                </TableCell>
                <TableCell align="right">
                  {contributor.contributions}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )}
            </Box>
          </>
        )}
      </Container>
    </Container>
  );
};

export default GitHubViewer;