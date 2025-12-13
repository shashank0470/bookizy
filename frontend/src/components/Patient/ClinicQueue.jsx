import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clinicAPI, tokenAPI } from '../../services/api'
import { connectWebSocket, disconnectWebSocket } from '../../services/websocket'
import { getUserId, logout } from '../../utils/auth'

function ClinicQueue() {
  const { clinicId } = useParams()
  const navigate = useNavigate()
  const [clinic, setClinic] = useState(null)
  const [queue, setQueue] = useState([])
  const [myToken, setMyToken] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ patientName: '', patientAge: '' })

  useEffect(() => {
    loadClinic()
    loadQueue()
    loadMyToken()

    connectWebSocket(clinicId, () => {
      loadQueue()
      loadMyToken()
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
      const response = await tokenAPI.getQueue(clinicId)
      setQueue(response.data)
    } catch (err) {
      console.error('Failed to load queue', err)
    }
  }

  const loadMyToken = async () => {
    try {
      const response = await tokenAPI.getMyToken(clinicId)
      setMyToken(response.data)
    } catch (err) {
      console.error('Failed to load my token', err)
    }
  }

  const handleBookToken = async (e) => {
    e.preventDefault()
    try {
      await tokenAPI.book(clinicId, formData)
      setShowModal(false)
      setFormData({ patientName: '', patientAge: '' })
      loadQueue()
      loadMyToken()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book token')
    }
  }

  const handleCancelToken = async () => {
    if (window.confirm('Are you sure you want to cancel your token?')) {
      try {
        await tokenAPI.cancel(myToken.id)
        loadQueue()
        loadMyToken()
      } catch (err) {
        alert('Failed to cancel token')
      }
    }
  }

  return (
    <div>
      <div className="navbar">
        <h1>Clinic Queue</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back</button>
      </div>

      <div className="container">
        <div className="queue-container">
          {/* Clinic Info */}
          <div className="queue-section">
            <h3>Clinic Information</h3>
            {clinic && (
              <>
                <p><strong>Name:</strong> {clinic.name}</p>
                <p><strong>Doctor:</strong> {clinic.doctorName}</p>
                <p><strong>Specialization:</strong> {clinic.specialization}</p>
                <p><strong>Timing:</strong> {clinic.timing}</p>
                <p><strong>Address:</strong> {clinic.address}</p>
                <p><strong>Avg Time:</strong> {clinic.avgTimePerPatient} min/patient</p>
              </>
            )}
          </div>

          {/* Live Queue */}
          <div className="queue-section">
            <h3>Live Queue</h3>
            {queue.length === 0 ? (
              <p>No patients in queue</p>
            ) : (
              queue.map((token) => (
                <div
                  key={token.id}
                  className={`token-item ${token.status} ${token.isOwn ? 'own' : ''}`}
                >
                  <div>
                    <strong>Token {token.tokenNumber}</strong>: {token.status}
                  </div>
                  {token.isOwn && (
                    <div>
                      <p>Name: {token.patientName}</p>
                      <p>Age: {token.patientAge}</p>
                    </div>
                  )}
                  {token.isOwn && token.estimatedTimeMinutes > 0 && (
                    <div>Estimated wait: {token.estimatedTimeMinutes} min</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Booking Section */}
          <div className="queue-section">
            <h3>Your Token</h3>
            {myToken ? (
              <div>
                <div className="token-item own">
                  <strong>Token {myToken.tokenNumber}</strong>
                  <p>Name: {myToken.patientName}</p>
                  <p>Age: {myToken.patientAge}</p>
                  <p>Status: {myToken.status}</p>
                  {myToken.estimatedTimeMinutes > 0 && (
                    <p>Wait: {myToken.estimatedTimeMinutes} min</p>
                  )}
                </div>
                <button className="btn btn-danger" onClick={handleCancelToken}>
                  Cancel Token
                </button>
              </div>
            ) : (
              <button className="btn btn-success" onClick={() => setShowModal(true)}>
                Book Token
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Book Token</h3>
            <form onSubmit={handleBookToken}>
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Patient Age</label>
                <input
                  type="number"
                  value={formData.patientAge}
                  onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Submit</button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClinicQueue