import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Select,
  FormControl,
  Chip,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Map as MapIcon,
  Agriculture as AgricultureIcon,
  Assignment as AssignmentIcon,
  LocalHospital as LocalHospitalIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 240

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Map View', icon: <MapIcon />, path: '/map' },
  { text: 'Fields', icon: <AgricultureIcon />, path: '/fields' },
  { text: 'Requests', icon: <AssignmentIcon />, path: '/requests' },
  { text: 'Treatments', icon: <LocalHospitalIcon />, path: '/treatments' },
]

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, currentRole, availableRoles, switchRole } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuClick = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleProfileMenuClose()
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img 
            src="/logo.png" 
            alt="AgriMonitor Logo" 
            style={{ 
              width: 40, 
              height: 40,
              objectFit: 'contain'
            }} 
            onError={(e) => {
              // Fallback if image doesn't exist
              e.target.style.display = 'none'
            }}
          />
          <Typography variant="h6" noWrap component="div">
            AgriMonitor
          </Typography>
        </Box>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleMenuClick(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <img 
              src="/logo.png" 
              alt="AgriMonitor Logo" 
              style={{ 
                width: 32, 
                height: 32,
                objectFit: 'contain'
              }} 
              onError={(e) => {
                // Fallback if image doesn't exist
                e.target.style.display = 'none'
              }}
            />
            <Typography variant="h6" noWrap component="div">
              {menuItems.find(item => item.path === location.pathname)?.text || 'AgriMonitor'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {availableRoles.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={currentRole || user?.role || ''}
                  onChange={(e) => {
                    const newRole = e.target.value
                    if (newRole !== currentRole) {
                      switchRole(newRole)
                    }
                  }}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                    '& .MuiSelect-select': {
                      color: 'white',
                      padding: '8px 32px 8px 14px',
                    },
                  }}
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                  {availableRoles.length === 1 && (
                    <MenuItem 
                      value={availableRoles[0] === 'farmer' ? 'agronomist' : 'farmer'}
                      onClick={async (e) => {
                        e.stopPropagation()
                        const newRole = availableRoles[0] === 'farmer' ? 'agronomist' : 'farmer'
                        await switchRole(newRole)
                      }}
                    >
                      + Add {availableRoles[0] === 'farmer' ? 'Agronomist' : 'Farmer'} Role
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
            <Typography variant="body2">{user?.full_name}</Typography>
            <IconButton onClick={handleProfileMenuOpen} size="small">
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.full_name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              {availableRoles.length > 1 && (
                <MenuItem onClick={() => {
                  const otherRole = availableRoles.find(r => r !== currentRole)
                  if (otherRole) {
                    switchRole(otherRole)
                    handleProfileMenuClose()
                  }
                }}>
                  <ListItemIcon>
                    <SwapHorizIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Switch Role</ListItemText>
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout

