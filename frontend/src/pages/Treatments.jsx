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
} from '@mui/material'
import axios from 'axios'

function Treatments() {
  const { user, currentRole } = useAuth()
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState(null)
  const [formData, setFormData] = useState({
    after_ndvi_value: '',
  })

  useEffect(() => {
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    try {
      const response = await axios.get('/api/treatments/')
      setTreatments(response.data)
    } catch (error) {
      console.error('Failed to fetch treatments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenVerify = (treatment) => {
    setSelectedTreatment(treatment)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedTreatment(null)
    setFormData({ after_ndvi_value: '' })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    try {
      await axios.put(
        `/api/treatments/${selectedTreatment.id}/verify`,
        null,
        { params: { after_ndvi_value: parseFloat(formData.after_ndvi_value) } }
      )
      fetchTreatments()
      handleClose()
    } catch (error) {
      console.error('Failed to verify treatment:', error)
      alert('Failed to verify treatment')
    }
  }

  const handleStart = async (id) => {
    try {
      await axios.put(`/api/treatments/${id}/start`)
      fetchTreatments()
    } catch (error) {
      console.error('Failed to start treatment:', error)
      alert('Failed to start treatment')
    }
  }

  const handleComplete = async (id) => {
    try {
      await axios.put(`/api/treatments/${id}/complete`, {
        treatment_type: 'spraying',
        notes: 'Treatment completed',
      })
      fetchTreatments()
    } catch (error) {
      console.error('Failed to complete treatment:', error)
      alert('Failed to complete treatment')
    }
  }

  const handleFarmerConfirm = async (id) => {
    try {
      await axios.put(`/api/treatments/${id}/farmer-confirm`)
      fetchTreatments()
    } catch (error) {
      console.error('Failed to confirm treatment:', error)
      alert('Failed to confirm treatment')
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
        Treatments
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Request ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Before NDVI</TableCell>
              <TableCell>After NDVI</TableCell>
              <TableCell>Improvement</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {treatments.map((treatment) => (
              <TableRow key={treatment.id}>
                <TableCell>{treatment.request_id}</TableCell>
                <TableCell>
                  <Chip
                    label={treatment.status}
                    color={
                      treatment.status === 'verified'
                        ? 'success'
                        : treatment.status === 'completed'
                        ? 'info'
                        : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {treatment.before_ndvi_value?.toFixed(3) || 'N/A'}
                </TableCell>
                <TableCell>
                  {treatment.after_ndvi_value?.toFixed(3) || 'N/A'}
                </TableCell>
                <TableCell>
                  {treatment.improvement_percentage !== null
                    ? `${treatment.improvement_percentage.toFixed(1)}%`
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {currentRole === 'agronomist' && (
                    <>
                      {treatment.status === 'scheduled' && (
                        <Button
                          size="small"
                          onClick={() => handleStart(treatment.id)}
                        >
                          Start
                        </Button>
                      )}
                      {treatment.status === 'in_progress' && (
                        <Button
                          size="small"
                          onClick={() => handleComplete(treatment.id)}
                        >
                          Complete
                        </Button>
                      )}
                      {treatment.status === 'completed' && !treatment.agronomist_confirmed && (
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleOpenVerify(treatment)}
                        >
                          Verify
                        </Button>
                      )}
                    </>
                  )}
                  {currentRole === 'farmer' &&
                    treatment.agronomist_confirmed &&
                    !treatment.farmer_confirmed && (
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleFarmerConfirm(treatment.id)}
                      >
                        Confirm
                      </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleVerify}>
          <DialogTitle>Verify Treatment</DialogTitle>
          <DialogContent>
            <Typography variant="body2" gutterBottom>
              Before NDVI: {selectedTreatment?.before_ndvi_value?.toFixed(3)}
            </Typography>
            <TextField
              fullWidth
              label="After NDVI Value"
              name="after_ndvi_value"
              type="number"
              value={formData.after_ndvi_value}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ step: '0.001', min: '0', max: '1' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter the NDVI value after treatment to calculate improvement percentage.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Verify
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default Treatments

