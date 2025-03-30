import React from 'react';
import { Box, Typography, Button, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SchoolIcon from '@mui/icons-material/School';

const Nvbar2 = ({ classesData }) => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const [teachingMenuAnchor, setTeachingMenuAnchor] = React.useState(null);

  // Main navigation items - MUST MATCH EXACTLY with your dock implementation
  const mainTabs = [
    { 
      label: 'Dashboard', 
      onClick: () => navigate('/dashboard'), 
      icon: <DashboardIcon /> 
    },
    { 
      label: 'Home', 
      onClick: () => navigate('/class'), 
      icon: <HomeIcon /> 
    },
    { 
      label: 'Teaching', 
      icon: <LibraryBooksIcon />,
      children: classesData?.map(classItem => ({
        label: classItem.name,
        onClick: () => navigate(`/class/${classItem._id}`) // EXACT SAME PATH as dock
      })) || []
    },
    { 
      label: 'Students', 
      onClick: () => navigate('/students'), 
      icon: <SchoolIcon /> 
    },
  ];

  const handleTeachingMenuOpen = (event) => {
    setTeachingMenuAnchor(event.currentTarget);
  };

  const handleTeachingMenuClose = () => {
    setTeachingMenuAnchor(null);
  };
  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        backgroundColor: '#0f0f0f',
        borderBottom: '1px solid #222',
        borderRadius: '1rem',
        margin: '0.5rem',
      }}
    >
      {/* Left side - App Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          color: 'white',
          fontFamily: 'Montserrat-Regular',
          mr: 4,
        }}
      >
        Kaizen.Edu
      </Typography>

      {/* Center - Navigation Tabs */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {mainTabs.map((tab) => (
          <React.Fragment key={tab.label}>
            {tab.children ? (
              <>
                <Button
                  startIcon={tab.icon}
                  onClick={handleTeachingMenuOpen}
                  sx={{
                    color: 'white',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '10px',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#2a2a2a',
                    },
                  }}
                >
                  {tab.label}
                </Button>
                <Menu
                  anchorEl={teachingMenuAnchor}
                  open={Boolean(teachingMenuAnchor)}
                  onClose={handleTeachingMenuClose}
                >
                  {tab.children.map((child) => (
                    <MenuItem 
                      key={child.label} 
                      onClick={() => {
                        child.onClick();
                        handleTeachingMenuClose();
                      }}
                    >
                      {child.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button
                startIcon={tab.icon}
                onClick={tab.onClick}
                sx={{
                  color: 'white',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '10px',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    backgroundColor: '#2a2a2a',
                  },
                }}
              >
                {tab.label}
              </Button>
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Right side - User Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          alt={userInfo?.name}
          src={userInfo?.profile_pic}
          sx={{ width: 40, height: 40 }}
        />
        <Typography variant="body1" sx={{ color: 'white' }}>
          {userInfo?.name}
        </Typography>
        <IconButton sx={{ color: 'white' }}>
          <SettingsIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Nvbar2;