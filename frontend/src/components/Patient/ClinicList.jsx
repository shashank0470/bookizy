import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clinicAPI } from '../../services/api'
import { logout } from '../../utils/auth'

function ClinicList() {
  const [clinics, setClinics] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadClinics()
  }, [])

  const loadClinics = async () => {
    try {
      const response = await clinicAPI.getAll()
      setClinics(response.data)
    } catch (err) {
      console.error('Failed to load clinics', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <div className="navbar">
        <h1>Doctor Appointment System</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
      </div>
      <div className="container">
        <h2>Available Clinics</h2>
        <div className="clinic-grid">
          {clinics.map((clinic) => (
            <div key={clinic.id} className="clinic-card">
              <h3>{clinic.name}</h3>
              <p><strong>Doctor:</strong> {clinic.doctorName}</p>
              <p><strong>Specialization:</strong> {clinic.specialization}</p>
              <p><strong>Timing:</strong> {clinic.timing}</p>
              <p><strong>Address:</strong> {clinic.address}</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/clinic/${clinic.id}`)}
              >
                Book Token
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ClinicList