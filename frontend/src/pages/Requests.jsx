import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import axios from 'axios'

function Requests() {
  const { user, currentRole } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedField, setSelectedField] = useState(null)
  const [formData, setFormData] = useState({
    message: '',
    proposed_price: '',
    health_issue_description: '',
  })
  const [fields, setFields] = useState([])

  useEffect(() => {
    fetchRequests()
    if (currentRole === 'agronomist') {
      fetchFields()
    }
  }, [user, currentRole])

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/requests/')
      setRequests(response.data)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFields = async () => {
    try {
      const response = await axios.get('/api/fields/')
      setFields(response.data)
    } catch (error) {
      console.error('Failed to fetch fields:', error)
    }
  }

  const handleOpen = (field) => {
    setSelectedField(field)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedField(null)
    setFormData({
      message: '',
      proposed_price: '',
      health_issue_description: '',
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
      // Fetch latest NDVI for the field
      const ndviResponse = await axios.get(`/api/ndvi/field/${selectedField.id}`)
      const latestNdvi = ndviResponse.data[0]?.ndvi_value || 0.5

      const data = {
        field_id: selectedField.id,
        message: formData.message,
        proposed_price: parseFloat(formData.proposed_price),
        before_ndvi_value: latestNdvi,
        health_issue_description: formData.health_issue_description,
      }
      await axios.post('/api/requests/', data)
      fetchRequests()
      handleClose()
    } catch (error) {
      console.error('Failed to create request:', error)
      alert('Failed to create request')
    }
  }

  const handleAccept = async (id) => {
    try {
      await axios.post(`/api/requests/${id}/accept`)
      fetchRequests()
    } catch (error) {
      console.error('Failed to accept request:', error)
      alert('Failed to accept request')
    }
  }

  const handleReject = async (id) => {
    try {
      await axios.post(`/api/requests/${id}/reject`)
      fetchRequests()
    } catch (error) {
      console.error('Failed to reject request:', error)
      alert('Failed to reject request')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return
    }
    try {
      await axios.delete(`/api/requests/${id}`)
      fetchRequests()
    } catch (error) {
      console.error('Failed to delete request:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to delete request'
      alert(errorMessage)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Treatment Requests
      </Typography>

      {currentRole === 'agronomist' && (
        <Box mb={2}>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Create New Request
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>NDVI</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>Field #{request.field_id}</TableCell>
                <TableCell>{request.message}</TableCell>
                <TableCell>${request.proposed_price}</TableCell>
                <TableCell>{request.before_ndvi_value.toFixed(3)}</TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    color={
                      request.status === 'accepted'
                        ? 'success'
                        : request.status === 'rejected'
                        ? 'error'
                        : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {currentRole === 'farmer' && request.status === 'pending' && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleAccept(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {(currentRole === 'agronomist' || (currentRole === 'farmer' && request.status !== 'accepted')) && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(request.id)}
                      title="Delete request"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Create Treatment Request</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Select Field"
              margin="normal"
              SelectProps={{
                native: true,
              }}
              onChange={(e) => {
                const field = fields.find((f) => f.id === parseInt(e.target.value))
                setSelectedField(field)
              }}
            >
              <option value="">Select a field</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name} ({field.area_hectares} ha)
                </option>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              required
            />
            <TextField
              fullWidth
              label="Proposed Price"
              name="proposed_price"
              type="number"
              value={formData.proposed_price}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Health Issue Description"
              name="health_issue_description"
              value={formData.health_issue_description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!selectedField}>
              Create Request
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default Requests

