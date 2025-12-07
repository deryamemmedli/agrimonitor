import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [currentRole, setCurrentRole] = useState(localStorage.getItem('currentRole') || null)
  const [availableRoles, setAvailableRoles] = useState([])

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data)
      
      // Fetch available roles
      try {
        const rolesResponse = await axios.get('/api/auth/available-roles')
        const roles = rolesResponse.data.available_roles || []
        setAvailableRoles(roles)
        
        // Set current role if not set or if user's default role
        const savedRole = localStorage.getItem('currentRole')
        // Convert role to lowercase string if it's an enum
        let userRole = 'farmer' // default
        try {
          if (typeof response.data.role === 'string') {
            userRole = response.data.role.toLowerCase()
          } else if (response.data.role) {
            // Handle enum - try .value first, then toString, then direct value
            userRole = (response.data.role.value || response.data.role.toString() || String(response.data.role)).toLowerCase()
          }
        } catch (e) {
          console.warn('Error converting role:', e)
          userRole = 'farmer'
        }
        
        if (!savedRole || !roles.includes(savedRole)) {
          const defaultRole = userRole || roles[0] || 'farmer'
          setCurrentRole(defaultRole)
          localStorage.setItem('currentRole', defaultRole)
        } else {
          setCurrentRole(savedRole)
        }
      } catch (rolesError) {
        console.error('Failed to fetch roles:', rolesError)
        // Fallback to user's default role
        // Convert role to lowercase string if it's an enum
        let userRole = 'farmer' // default
        try {
          if (typeof response.data.role === 'string') {
            userRole = response.data.role.toLowerCase()
          } else if (response.data.role) {
            // Handle enum - try .value first, then toString, then direct value
            userRole = (response.data.role.value || response.data.role.toString() || String(response.data.role)).toLowerCase()
          }
        } catch (e) {
          console.warn('Error converting role:', e)
          userRole = 'farmer'
        }
        const defaultRole = userRole || 'farmer'
        setAvailableRoles([defaultRole])
        setCurrentRole(defaultRole)
        localStorage.setItem('currentRole', defaultRole)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Don't logout on error - might be temporary network issue
      // Only logout if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout()
        return
      }
      // For other errors, still set user to null but don't logout
      setUser(null)
    } finally {
      // Always set loading to false, regardless of success or error
      setLoading(false)
    }
  }
  
  const switchRole = async (newRole) => {
    if (!newRole) return
    
    console.log('Switching role to:', newRole, 'Available roles:', availableRoles)
    
    // Check if user has this role
    if (!availableRoles.includes(newRole)) {
      // Try to add role
      try {
        console.log('Adding new role:', newRole)
        await axios.post('/api/auth/add-role', null, { 
          params: { role: newRole } 
        })
        // Refresh available roles
        try {
          const rolesResponse = await axios.get('/api/auth/available-roles')
          const roles = rolesResponse.data.available_roles || []
          setAvailableRoles(roles)
        } catch (e) {
          console.error('Failed to refresh roles:', e)
          const updatedRoles = [...availableRoles, newRole]
          setAvailableRoles(updatedRoles)
        }
        alert(`✅ ${newRole.charAt(0).toUpperCase() + newRole.slice(1)} role added successfully!`)
      } catch (error) {
        console.error('Failed to add role:', error)
        alert(`Failed to add role: ${error.response?.data?.detail || error.message}`)
        return
      }
    }
    
    setCurrentRole(newRole)
    localStorage.setItem('currentRole', newRole)
    
    // Don't reload - just update state, React will handle re-rendering
    // Components that depend on currentRole will automatically update
  }

  const login = async (email, password) => {
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await axios.post('/api/auth/login', formData)
      const { access_token } = response.data
      
      if (!access_token) {
        throw new Error('No access token received')
      }
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Fetch user data - set loading to true first
      setLoading(true)
      try {
        await fetchUser()
      } catch (fetchError) {
        console.error('Failed to fetch user after login:', fetchError)
        // Even if fetchUser fails, we still have the token
        // Set user to a minimal object so login can proceed
        setUser({ email, full_name: email.split('@')[0] })
        setLoading(false)
      }
      
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      // Clear token on error
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      setLoading(false)
      // Re-throw with better error message
      throw error
    }
  }

  const register = async (userData) => {
    const response = await axios.post('/api/auth/register', userData)
    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentRole')
    setToken(null)
    setUser(null)
    setCurrentRole(null)
    setAvailableRoles([])
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      currentRole: currentRole || user?.role,
      availableRoles,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

