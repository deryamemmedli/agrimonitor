import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import axios from 'axios'

function Fields() {
  const { user, currentRole } = useAuth()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    area_hectares: '',
    crop_type: '',
    latitude: '',
    longitude: '',
    polygon_coordinates: '',
  })

  useEffect(() => {
    fetchFields()
  }, [])

  const fetchFields = async () => {
    try {
      const response = await axios.get('/api/fields/')
      setFields(response.data)
    } catch (error) {
      console.error('Failed to fetch fields:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setFormData({
      name: '',
      area_hectares: '',
      crop_type: '',
      latitude: '',
      longitude: '',
      polygon_coordinates: '',
    })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        area_hectares: parseFloat(formData.area_hectares),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      }
      await axios.post('/api/fields/', data)
      fetchFields()
      handleClose()
    } catch (error) {
      console.error('Failed to create field:', error)
      alert('Failed to create field')
    }
  }

  const handleDelete = async (id) => {
    if (!canManageFields) {
      alert('You do not have permission to delete fields. Please switch to farmer role.')
      return
    }
    
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await axios.delete(`/api/fields/${id}`)
        await fetchFields()
        alert('Field deleted successfully')
      } catch (error) {
        console.error('Failed to delete field:', error)
        const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete field'
        alert(`Failed to delete field: ${errorMessage}`)
      }
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    )
  }

  // Agronomists can view fields but not create/edit/delete
  // Check both currentRole and user.role for compatibility
  const canManageFields = currentRole === 'farmer' || user?.role === 'farmer' || (typeof user?.role === 'string' && user.role.toLowerCase() === 'farmer')

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">{canManageFields ? 'My Fields' : 'All Fields'}</Typography>
        {canManageFields ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Add Field
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            View only - Switch to farmer role to manage fields
          </Typography>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Area (ha)</TableCell>
              <TableCell>Crop Type</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.name}</TableCell>
                <TableCell>{field.area_hectares}</TableCell>
                <TableCell>{field.crop_type || 'N/A'}</TableCell>
                <TableCell>
                  {field.latitude.toFixed(4)}, {field.longitude.toFixed(4)}
                </TableCell>
                <TableCell>
                  {canManageFields && (
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(field.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  {!canManageFields && (
                    <Typography variant="body2" color="text.secondary">
                      View only
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Field</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Field Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Area (hectares)"
              name="area_hectares"
              type="number"
              value={formData.area_hectares}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Crop Type"
              name="crop_type"
              value={formData.crop_type}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Latitude"
              name="latitude"
              type="number"
              value={formData.latitude}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Longitude"
              name="longitude"
              type="number"
              value={formData.longitude}
              onChange={handleChange}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default Fields

