import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import axios from 'axios'

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'farmer',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Role is already in lowercase ("farmer" or "agronomist") which matches backend enum
      const registrationData = {
        ...formData,
        role: formData.role.toLowerCase() // Ensure lowercase to match backend enum
      }
      await axios.post('/api/auth/register', registrationData)
      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Registration failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <img 
              src="/logo.png" 
              alt="AgriMonitor Logo" 
              style={{ 
                width: 60, 
                height: 60,
                objectFit: 'contain'
              }} 
              onError={(e) => {
                // Fallback if image doesn't exist
                e.target.style.display = 'none'
              }}
            />
            <Typography variant="h4" component="h1">
              AgriMonitor
            </Typography>
          </Box>
          <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
            Register
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
              >
                <MenuItem value="farmer">Farmer</MenuItem>
                <MenuItem value="agronomist">Agronomist</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Typography align="center">
              Already have an account? <Link to="/login">Login</Link>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  )
}

export default Register

