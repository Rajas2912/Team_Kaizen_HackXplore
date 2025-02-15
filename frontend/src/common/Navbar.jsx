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
        <button
          class="MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium css-10r8nrq-MuiButtonBase-root-MuiIconButton-root"
          tabindex="0"
          type="button"
          id=":r4:"
          aria-label="Collapse navigation menu"
        >
          <MenuIcon />
        </button>
        {/* Center: App Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Kaizen.Edu
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
