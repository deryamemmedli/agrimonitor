import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
} from '@mui/material'
import axios from 'axios'

function Dashboard() {
  const { user, currentRole } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && currentRole) {
      fetchStats()
    }
  }, [user, currentRole])

  const fetchStats = async () => {
    if (!user || !currentRole) return
    
    setLoading(true)
    try {
      if (currentRole === 'farmer') {
        const [fieldsRes, requestsRes, treatmentsRes] = await Promise.all([
          axios.get('/api/farmers/fields'),
          axios.get('/api/requests/'),
          axios.get('/api/treatments/'),
        ])
        setStats({
          fields: fieldsRes.data.length,
          requests: requestsRes.data.length,
          treatments: treatmentsRes.data.length,
        })
      } else if (currentRole === 'agronomist') {
        const [requestsRes, treatmentsRes] = await Promise.all([
          axios.get('/api/requests/'),
          axios.get('/api/treatments/'),
        ])
        setStats({
          requests: requestsRes.data.length,
          treatments: treatmentsRes.data.length,
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Set default values on error
      setStats({
        fields: currentRole === 'farmer' ? 0 : undefined,
        requests: 0,
        treatments: 0,
      })
    } finally {
      setLoading(false)
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
        Welcome, {user?.full_name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Current Role: {currentRole ? currentRole.charAt(0).toUpperCase() + currentRole.slice(1) : user?.role}
        {currentRole && currentRole !== user?.role && ` (Original: ${user?.role})`}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats?.fields !== undefined && (
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Fields
                </Typography>
                <Typography variant="h4">{stats.fields}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Requests
              </Typography>
              <Typography variant="h4">{stats?.requests || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Treatments
              </Typography>
              <Typography variant="h4">{stats?.treatments || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard

