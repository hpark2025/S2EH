import React, { useState } from 'react'
import authService from '../services/authService.js'
import serverMonitor from '../services/serverMonitor.js'

/**
 * Test component for auto-logout functionality
 * This can be added to any page to test the auto-logout feature
 */
const AutoLogoutTest = () => {
  const [serverStatus, setServerStatus] = useState('Unknown')
  const [isChecking, setIsChecking] = useState(false)

  const checkServerStatus = async () => {
    setIsChecking(true)
    try {
      const isAvailable = await authService.checkServerStatus()
      setServerStatus(isAvailable ? 'Online' : 'Offline')
    } catch (error) {
      setServerStatus('Error')
    } finally {
      setIsChecking(false)
    }
  }

  const simulateServerDown = () => {
    // This simulates a server down scenario for testing
    console.log('🧪 Simulating server down scenario...')
    
    // Temporarily override the server monitor check to always fail
    const originalCheck = serverMonitor.checkServerHealth
    serverMonitor.checkServerHealth = () => {
      throw new Error('Simulated server down')
    }

    // Trigger a check
    serverMonitor.checkServerHealth()

    // Restore original check after 5 seconds
    setTimeout(() => {
      serverMonitor.checkServerHealth = originalCheck
    }, 5000)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '250px'
    }}>
      <h6 style={{ margin: '0 0 10px 0', color: '#007bff' }}>
        🧪 Auto-Logout Test Panel
      </h6>
      
      <div style={{ marginBottom: '10px' }}>
        <small>
          <strong>Server Status:</strong> 
          <span style={{ 
            color: serverStatus === 'Online' ? 'green' : 
                   serverStatus === 'Offline' ? 'red' : 'orange',
            marginLeft: '5px'
          }}>
            {serverStatus}
          </span>
        </small>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={checkServerStatus}
          disabled={isChecking}
          style={{
            padding: '6px 12px',
            border: '1px solid #007bff',
            background: '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: isChecking ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          {isChecking ? 'Checking...' : 'Check Server'}
        </button>

        <button
          onClick={simulateServerDown}
          style={{
            padding: '6px 12px',
            border: '1px solid #dc3545',
            background: '#dc3545',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Simulate Server Down
        </button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
        • Auto-logout triggers after 3 failed checks<br/>
        • Checks occur every 30 seconds<br/>
        • Works for all user types
      </div>
    </div>
  )
}

export default AutoLogoutTest