import React, { useState } from 'react'
import { Avatar, Typography, Box, IconButton } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'

const Navbar = ({ onToggleSidebar }) => {
  return (
    <nav className="navbar">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={1.5}
        sx={{ borderBottom: '1px' }}
      >
        {/* Center: App Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My App
        </Typography>

        {/* Right side: Profile and Settings */}
        <Box display="flex" alignItems="center">
          <Avatar
            alt="User Name"
            src="/path-to-profile-image.jpg"
            sx={{ mr: 2 }}
          />
          <Typography variant="h6">User Name</Typography>
          <IconButton color="inherit" sx={{ ml: 2 }}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>
    </nav>
  )
}

export default Navbar
