### Bookizy - Doctor Appointment Booking System
A real-time token-based appointment booking system for clinics with patient and receptionist interfaces.
Tech Stack
Backend: Java 17, Spring Boot 3.2.0, Spring Security, JWT, WebSocket, JPA/Hibernate
Frontend: React 18, Vite, Axios, SockJS, StompJS
Database: MySQL

-->Features

Patient:
~Browse available clinics
~Book a token with patient's name and age
~View live queue with real-time updates
~See estimated waiting time
~Cancel own token
~Token privacy (only see own details)

Receptionist:
~Manage clinic queue
~View all patient details (name, age, token)
~Update patient status (waiting, arrived, serving, completed, skipped, cancelled)
~"Serve Next" functionality
~Remove/cancel tokens
~Real-time queue synchronization

Prerequisites:
~Java 17+
~Node.js 16+
~MySQL 8+
~Gradle

Installation
1. Clone Repository
   git clone https://github.com/shashank0470/bookizy.git
   cd bookizy

2. Database Setup
   CREATE DATABASE appointment_db;
   USE appointment_db;
3. Backend Setup
   Update backend/src/main/resources/application.properties:
   spring.datasource.url=jdbc:mysql://localhost:3306/appointment_db
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   jwt.secret=yourSecretKeyHereMakeItLongAndSecureForProductionUse123456789

Run backend:
cd backend
./gradlew bootRun

Backend runs on http://localhost:8080

4. Frontend Setup
   cd frontend
   npm install
   npm run dev
Frontend runs on http://localhost:5173

--->Initial Data Setup

Add Clinic:
USE appointment_db:

INSERT INTO clinics (name, doctor_name, specialization, timing, address, avg_time_per_patient)
VALUES ('City Clinic', 'Dr. Smith', 'General Physician', '9 AM - 5 PM', '123 Main St, Delhi', 15);

Create Receptionist :
1. Sign up at http://localhost:5173/signup:
    Name: Receptionist
    Email: receptionist@clinic.com
    Password: test123

2. Update role in database:

UPDATE users 
SET role = 'RECEPTIONIST', clinic_id = 1 
WHERE email = 'receptionist@clinic.com';
```

### Create Patient (Optional)

**Signup at** `http://localhost:5173/signup`:
- Name: Patient User
- Email: patient@test.com
- Password: test123

## Usage

### Patient Flow

1. Login at `http://localhost:5173/login`
2. Browse clinic list
3. Click "Book Token" on desired clinic
4. Enter patient name and age
5. View live queue and estimated wait time
6. Cancel token if needed

### Receptionist Flow

1. Login at `http://localhost:5173/login` (auto-redirects to dashboard)
2. View all patients in the queue with names
3. Update patient status via dropdown
4. Use the "Serve Next" button for the next patient
5. Remove tokens as needed

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Clinics
- `GET /api/clinics` - Get all clinics
- `GET /api/clinics/{id}` - Get clinic by ID

### Tokens (Patient)
- `POST /api/tokens/clinic/{clinicId}` - Book token
- `GET /api/tokens/clinic/{clinicId}/queue` - Get queue
- `GET /api/tokens/clinic/{clinicId}/my-token` - Get my token
- `DELETE /api/tokens/{tokenId}` - Cancel token

### Receptionist
- `GET /api/receptionist/clinic/{clinicId}/queue` - Get full queue
- `PUT /api/receptionist/token/{tokenId}/status` - Update status
- `POST /api/receptionist/clinic/{clinicId}/serve-next` - Serve next
- `DELETE /api/receptionist/token/{tokenId}` - Remove token

## WebSocket

Real-time updates via WebSocket on `/ws` endpoint.  
Subscribes to `/topic/clinic/{clinicId}` for queue updates.

```
## Project Structure
bookizy/
├── backend/
│   ├── src/main/java/com/appointment/
│   │   ├── config/          # Security, WebSocket config
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Database repositories
│   │   ├── security/        # JWT authentication
│   │   └── service/         # Business logic
│   ├── build.gradle
│   └── settings.gradle
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── services/        # API & WebSocket
    │   └── utils/           # Helper functions
    ├── package.json
    └── vite.config.js
    
--->Key Features Implementation

Real-Time Queue Updates
Uses WebSocket (SockJS + STOMP) for instant queue synchronization across all users.

Estimated Wait Time
Calculated as: (patients ahead) × 15 minutes
Updates automatically on queue changes.

Token Privacy
~Patients see only a token number of others
~Own token shows full details
~The receptionist sees all patient information

Status Management
~waiting - Booked but not arrived
~arrived - Patient physically present
~serving - Currently with doctor
~completed - Consultation finished
~skipped - Patient didn't respond
~cancelled - Token cancelled

-->Troubleshooting

Backend won't start
~Check MySQL is running
~Verify database credentials in application.properties
~Ensure port 8080 is free

Frontend shows white screen
~Check backend is running
~Verify WebSocket connection
~Check browser console for errors

Login fails with "Bad Credentials."
~Create user via signup page (not manual SQL)
~Password must match BCrypt encoding

WebSocket not connecting
~Ensure SockJS endpoint /ws is accessible
~Check CORS configuration
~Verify port 8080 is not blocked

Security Notes
~JWT secret should be changed in production
~CORS is configured for localhost - update for production
~Passwords are encrypted with BCrypt
~All API endpoints except auth are protected

Future Enhancements
~Admin panel for clinic management
~Email/SMS notifications
~Appointment history
~Rating system
~Multi-language support
~Payment integration

License
MIT
Author
Shashank
Repository
https://github.com/shashank0470/bookizy.git
