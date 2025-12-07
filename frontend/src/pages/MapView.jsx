import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet'
import { Box, Typography, Chip, CircularProgress, Paper, Grid, Button, FormControlLabel, Switch, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapView() {
  const { currentRole } = useAuth()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [center, setCenter] = useState([40.4093, 49.8671]) // Default to Azerbaijan
  const [showOnlyUnhealthy, setShowOnlyUnhealthy] = useState(false)
  const [fetchingNDVI, setFetchingNDVI] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [selectedFieldForRequest, setSelectedFieldForRequest] = useState(null)
  const [requestFormData, setRequestFormData] = useState({
    message: '',
    proposed_price: '',
    health_issue_description: '',
  })

  useEffect(() => {
    fetchMapData()
  }, [])

  const fetchMapData = async () => {
    try {
      setError(null)
      const response = await axios.get('/api/ndvi/map')
      setFields(response.data.fields || [])
      if (response.data.fields && response.data.fields.length > 0) {
        const avgLat = response.data.fields.reduce((sum, f) => sum + f.latitude, 0) / response.data.fields.length
        const avgLon = response.data.fields.reduce((sum, f) => sum + f.longitude, 0) / response.data.fields.length
        setCenter([avgLat, avgLon])
      }
    } catch (error) {
      console.error('Failed to fetch map data:', error)
      setError(error.response?.data?.detail || error.message || 'Failed to load map data')
    } finally {
      setLoading(false)
    }
  }

  const fetchNDVIForAllFields = async () => {
    setFetchingNDVI(true)
    try {
      const fieldsWithoutNDVI = fields.filter(f => !f.latest_ndvi || f.latest_ndvi === null)
      if (fieldsWithoutNDVI.length === 0) {
        alert('All fields already have NDVI data')
        setFetchingNDVI(false)
        return
      }
      
      // Fetch NDVI for each field without data
      const promises = fieldsWithoutNDVI.map(field => 
        axios.post(`/api/ndvi/field/${field.field_id}/fetch`)
          .catch(err => {
            console.error(`Failed to fetch NDVI for field ${field.field_id}:`, err)
            return null
          })
      )
      
      await Promise.all(promises)
      // Refresh map data
      await fetchMapData()
      alert(`NDVI data fetched for ${fieldsWithoutNDVI.length} field(s)`)
    } catch (error) {
      console.error('Failed to fetch NDVI data:', error)
      alert('Failed to fetch NDVI data. Please try again.')
    } finally {
      setFetchingNDVI(false)
    }
  }

  const handleOpenRequestDialog = (field) => {
    setSelectedFieldForRequest(field)
    setRequestFormData({
      message: '',
      proposed_price: '',
      health_issue_description: '',
    })
    setRequestDialogOpen(true)
  }

  const handleCloseRequestDialog = () => {
    setRequestDialogOpen(false)
    setSelectedFieldForRequest(null)
    setRequestFormData({
      message: '',
      proposed_price: '',
      health_issue_description: '',
    })
  }

  const handleRequestFormChange = (e) => {
    setRequestFormData({
      ...requestFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    if (!selectedFieldForRequest) return

    try {
      // Fetch latest NDVI for the field
      const ndviResponse = await axios.get(`/api/ndvi/field/${selectedFieldForRequest.field_id}`)
      const latestNdvi = ndviResponse.data[0]?.ndvi_value || 0.5

      const data = {
        field_id: selectedFieldForRequest.field_id,
        message: requestFormData.message,
        proposed_price: parseFloat(requestFormData.proposed_price),
        before_ndvi_value: latestNdvi,
        health_issue_description: requestFormData.health_issue_description,
      }
      await axios.post('/api/requests/', data)
      alert('Request sent successfully!')
      handleCloseRequestDialog()
    } catch (error) {
      console.error('Failed to create request:', error)
      alert('Failed to create request: ' + (error.response?.data?.detail || error.message))
    }
  }

  const getNDVIColor = (ndvi) => {
    if (!ndvi || ndvi === null) return '#808080' // Gray for no data
    if (ndvi < 0.3) return '#FF0000' // Red - Unhealthy
    if (ndvi < 0.5) return '#FFA500' // Orange - Poor
    if (ndvi < 0.7) return '#FFFF00' // Yellow - Moderate
    return '#00FF00' // Green - Healthy
  }
  
  const isUnhealthy = (ndvi) => {
    return ndvi !== null && ndvi !== undefined && ndvi < 0.5
  }

  const getNDVIStatus = (ndvi) => {
    if (!ndvi || ndvi === null) return 'No Data'
    if (ndvi < 0.3) return 'Unhealthy'
    if (ndvi < 0.5) return 'Poor'
    if (ndvi < 0.7) return 'Moderate'
    return 'Healthy'
  }

  const getNDVIChipColor = (ndvi) => {
    if (!ndvi || ndvi === null) return 'default'
    if (ndvi < 0.3) return 'error'
    if (ndvi < 0.5) return 'warning'
    if (ndvi < 0.7) return 'warning'
    return 'success'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchMapData}>
          Retry
        </Button>
      </Box>
    )
  }

  const filteredFields = showOnlyUnhealthy 
    ? fields.filter(f => isUnhealthy(f.latest_ndvi))
    : fields

  const unhealthyCount = fields.filter(f => isUnhealthy(f.latest_ndvi)).length
  const noDataCount = fields.filter(f => !f.latest_ndvi || f.latest_ndvi === null).length
  const realDataCount = fields.filter(f => f.is_real_data).length
  const mockDataCount = fields.filter(f => f.data_source === 'mock' && f.latest_ndvi).length

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Field Map with NDVI Data
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <Button 
            variant="contained" 
            onClick={fetchNDVIForAllFields}
            disabled={fetchingNDVI || noDataCount === 0}
          >
            {fetchingNDVI ? 'Fetching...' : `Fetch NDVI (${noDataCount} fields)`}
          </Button>
        </Box>
      </Box>

      {unhealthyCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {unhealthyCount} field(s) have unhealthy NDVI values (&lt;0.5). These are highlighted in red/orange on the map.
        </Alert>
      )}

      {noDataCount > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {noDataCount} field(s) don't have NDVI data yet. Click "Fetch NDVI" to get satellite data.
        </Alert>
      )}

      {realDataCount > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ {realDataCount} field(s) using REAL Sentinel 2 data from Planetary Computer
        </Alert>
      )}

      {mockDataCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ {mockDataCount} field(s) using MOCK data. Real Sentinel 2 data will be fetched on next update.
        </Alert>
      )}
      
      {/* Legend and Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            NDVI Health Status
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyUnhealthy}
                onChange={(e) => setShowOnlyUnhealthy(e.target.checked)}
                color="error"
              />
            }
            label="Show only unhealthy fields"
          />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: '#00FF00',
                  border: '2px solid #000',
                  borderRadius: '4px',
                }}
              />
              <Typography variant="body2"><strong>Healthy (≥0.7)</strong></Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: '#FFFF00',
                  border: '2px solid #000',
                  borderRadius: '4px',
                }}
              />
              <Typography variant="body2"><strong>Moderate (0.5-0.7)</strong></Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: '#FFA500',
                  border: '2px solid #000',
                  borderRadius: '4px',
                }}
              />
              <Typography variant="body2"><strong>Poor (0.3-0.5)</strong></Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: '#FF0000',
                  border: '2px solid #000',
                  borderRadius: '4px',
                }}
              />
              <Typography variant="body2"><strong>Unhealthy (&lt;0.3)</strong></Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ height: '600px', width: '100%', mt: 2, position: 'relative' }}>
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredFields.map((field) => {
            const ndviColor = getNDVIColor(field.latest_ndvi)
            const ndviStatus = getNDVIStatus(field.latest_ndvi)
            // Calculate radius based on area (hectares to meters)
            // 1 hectare ≈ 10,000 m², so radius ≈ sqrt(area * 10000 / π)
            const radius = Math.sqrt(field.area_hectares * 10000 / Math.PI)
            
            // Try to parse polygon coordinates if available
            let polygonCoords = null
            if (field.polygon_coordinates) {
              try {
                polygonCoords = JSON.parse(field.polygon_coordinates)
              } catch (e) {
                console.error('Failed to parse polygon coordinates:', e)
              }
            }

            return (
              <React.Fragment key={field.field_id}>
                <Marker position={[field.latitude, field.longitude]}>
                  <Popup maxWidth={300}>
                    <Typography variant="h6">{field.name}</Typography>
                    <Typography>Crop: {field.crop_type || 'N/A'}</Typography>
                    <Typography>Area: {field.area_hectares} ha</Typography>
                    {field.latest_ndvi !== null && field.latest_ndvi !== undefined ? (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`NDVI: ${field.latest_ndvi.toFixed(3)} - ${ndviStatus}`}
                          color={getNDVIChipColor(field.latest_ndvi)}
                          size="small"
                        />
                        {field.is_real_data && (
                          <Chip 
                            label={`✅ Real Sentinel 2 (${field.data_source})`} 
                            color="success" 
                            size="small" 
                            sx={{ ml: 1, mt: 0.5 }}
                          />
                        )}
                        {!field.is_real_data && field.data_source === 'mock' && (
                          <Chip 
                            label="⚠️ Mock Data" 
                            color="warning" 
                            size="small" 
                            sx={{ ml: 1, mt: 0.5 }}
                          />
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label="No NDVI Data"
                          color="default"
                          size="small"
                        />
                      </Box>
                    )}
                    {currentRole === 'agronomist' && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          fullWidth
                          onClick={() => handleOpenRequestDialog(field)}
                        >
                          Send Treatment Request
                        </Button>
                      </Box>
                    )}
                  </Popup>
                </Marker>
                {polygonCoords && Array.isArray(polygonCoords) && polygonCoords.length > 0 ? (
                  <Polygon
                    positions={polygonCoords}
                    pathOptions={{
                      color: ndviColor,
                      fillColor: ndviColor,
                      fillOpacity: isUnhealthy(field.latest_ndvi) ? 0.7 : 0.5,
                      weight: isUnhealthy(field.latest_ndvi) ? 4 : 2,
                    }}
                  />
                ) : (
                  <Circle
                    center={[field.latitude, field.longitude]}
                    radius={radius}
                    pathOptions={{
                      color: ndviColor,
                      fillColor: ndviColor,
                      fillOpacity: isUnhealthy(field.latest_ndvi) ? 0.7 : 0.5,
                      weight: isUnhealthy(field.latest_ndvi) ? 4 : 2,
                    }}
                  />
                )}
              </React.Fragment>
            )
          })}
        </MapContainer>
      </Box>

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onClose={handleCloseRequestDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitRequest}>
          <DialogTitle>
            Send Treatment Request - {selectedFieldForRequest?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Field: {selectedFieldForRequest?.name} ({selectedFieldForRequest?.area_hectares} ha)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Crop: {selectedFieldForRequest?.crop_type || 'N/A'}
              </Typography>
              {selectedFieldForRequest?.latest_ndvi !== null && selectedFieldForRequest?.latest_ndvi !== undefined && (
                <Typography variant="body2" color="text.secondary">
                  Current NDVI: {selectedFieldForRequest.latest_ndvi.toFixed(3)} - {getNDVIStatus(selectedFieldForRequest.latest_ndvi)}
                </Typography>
              )}
            </Box>
            <TextField
              fullWidth
              label="Message to Farmer"
              name="message"
              value={requestFormData.message}
              onChange={handleRequestFormChange}
              margin="normal"
              multiline
              rows={3}
              required
              placeholder="Explain the crop health issue and proposed treatment..."
            />
            <TextField
              fullWidth
              label="Proposed Price"
              name="proposed_price"
              type="number"
              value={requestFormData.proposed_price}
              onChange={handleRequestFormChange}
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              fullWidth
              label="Health Issue Description"
              name="health_issue_description"
              value={requestFormData.health_issue_description}
              onChange={handleRequestFormChange}
              margin="normal"
              multiline
              rows={2}
              placeholder="Describe the specific health issues observed..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRequestDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Send Request
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}

export default MapView

