import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import ClinicList from './components/Patient/ClinicList'
import ClinicQueue from './components/Patient/ClinicQueue'
import ReceptionistDashboard from './components/Receptionist/ReceptionistDashboard'
import { isAuthenticated, getRole } from './utils/auth'

function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />
  }

  const role = getRole()
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />
  }

  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ClinicList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clinic/:clinicId"
          element={
            <ProtectedRoute>
              <ClinicQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist/:clinicId"
          element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App