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
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Wait a bit to ensure state is updated
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)
    } catch (err) {
      console.error('Login error in component:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed'
      setError(errorMessage)
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
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Typography align="center">
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login

