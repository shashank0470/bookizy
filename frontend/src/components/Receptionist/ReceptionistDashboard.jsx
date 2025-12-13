import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clinicAPI, receptionistAPI } from '../../services/api'
import { connectWebSocket, disconnectWebSocket } from '../../services/websocket'
import { logout } from '../../utils/auth'

function ReceptionistDashboard() {
  const { clinicId } = useParams()
  const navigate = useNavigate()
  const [clinic, setClinic] = useState(null)
  const [queue, setQueue] = useState([])

  useEffect(() => {
    loadClinic()
    loadQueue()

    connectWebSocket(clinicId, () => {
      loadQueue()
    })

    return () => disconnectWebSocket()
  }, [clinicId])

  const loadClinic = async () => {
    try {
      const response = await clinicAPI.getById(clinicId)
      setClinic(response.data)
    } catch (err) {
      console.error('Failed to load clinic', err)
    }
  }

  const loadQueue = async () => {
    try {
      const response = await receptionistAPI.getQueue(clinicId)
      setQueue(response.data)
    } catch (err) {
      console.error('Failed to load queue', err)
    }
  }

  const handleStatusChange = async (tokenId, status) => {
    try {
      await receptionistAPI.updateStatus(tokenId, status)
      loadQueue()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleServeNext = async () => {
    try {
      await receptionistAPI.serveNext(clinicId)
      loadQueue()
    } catch (err) {
      alert('Failed to serve next')
    }
  }

  const handleRemoveToken = async (tokenId) => {
    if (window.confirm('Remove this token?')) {
      try {
        await receptionistAPI.removeToken(tokenId)
        loadQueue()
      } catch (err) {
        alert('Failed to remove token')
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <div className="navbar">
        <h1>Receptionist Dashboard</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
      </div>

      <div className="container">
        <h2>{clinic?.name} - Queue Management</h2>

        <div style={{ marginBottom: '20px' }}>
          <button className="btn btn-success" onClick={handleServeNext}>
            Serve Next Patient
          </button>
        </div>

        <div className="queue-section">
          <h3>All Patients</h3>
          {queue.length === 0 ? (
            <p>No patients in queue</p>
          ) : (
            queue.map((token) => (
              <div key={token.id} className={`token-item ${token.status}`}>
                <div>
                  <strong>Token {token.tokenNumber}</strong>
                  <p>Name: {token.patientName}</p>
                  <p>Age: {token.patientAge}</p>
                  <p>Status: {token.status}</p>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <select
                    value={token.status}
                    onChange={(e) => handleStatusChange(token.id, e.target.value)}
                  >
                    <option value="waiting">Waiting</option>
                    <option value="arrived">Arrived</option>
                    <option value="serving">Serving</option>
                    <option value="completed">Completed</option>
                    <option value="skipped">Skipped</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemoveToken(token.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ReceptionistDashboard