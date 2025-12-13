# 🐾 PetCare API Testing Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Postman Collection Import](#postman-collection-import)
5. [Testing Workflow](#testing-workflow)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Common Issues & Solutions](#common-issues--solutions)

---

## 🎯 Project Overview

**PetCare** is a full-stack pet management application with:
- **Backend**: Java Spring Boot (Port: `8080`)
- **Frontend**: React.js (Port: `3000`)
- **Database**: MySQL
- **Authentication**: JWT + OTP-based email verification
- **Email**: Gmail SMTP for OTP delivery

### Architecture
```
┌─────────────┐      HTTP/REST      ┌──────────────┐      JPA/Hibernate      ┌──────────┐
│   React     │ ←─────────────────→ │  Spring Boot │ ←────────────────────→ │  MySQL   │
│  Frontend   │   (axios @ :3000)   │   Backend    │   (Port: 3306)         │ Database │
└─────────────┘                     └──────────────┘                         └──────────┘
                                           │
                                           ↓
                                    ┌─────────────┐
                                    │ Gmail SMTP  │
                                    │  OTP Emails │
                                    └─────────────┘
```

---

## 🔧 Backend Setup

### Prerequisites
- **Java**: JDK 17+
- **Maven**: 3.6+
- **MySQL**: 8.0+
- Database: `petcare_db`

### 1. Check Your Configuration
File: `petcare/src/main/resources/application.properties`

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/petcare_db
spring.datasource.username=root
spring.datasource.password=Bhargavi@0334

# JWT
jwt.secret=petcare-super-secret-jwt-key-2025-change-this-in-production
jwt.expiration=86400000

# Email (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=petcare.customerservices@gmail.com
spring.mail.password=gkufzulypvmhzulh
```

### 2. Start Backend
```bash
# Navigate to backend directory
cd c:\Users\bharg\Desktop\Project-PetCare\petcare

# Run using Maven wrapper
.\mvnw.cmd spring-boot:run

# OR if Maven is installed globally
mvn spring-boot:run
```

### 3. Verify Backend is Running
Open browser: `http://localhost:8080/api/auth/health`

**Expected Response**: `Pet Care API is running!`

---

## 🎨 Frontend Setup

### Prerequisites
- **Node.js**: v16+ (with npm)

### 1. Check Frontend Configuration
File: `petcare-frontend/petcare-frontend/src/services/api.js`

```javascript
const API_URL = 'http://localhost:8080/api';
```

### 2. Install Dependencies
```bash
# Navigate to frontend directory
cd c:\Users\bharg\Desktop\Project-PetCare\petcare-frontend\petcare-frontend

# Install dependencies
npm install
```

### 3. Start Frontend
```bash
npm start
```

Frontend will open at: `http://localhost:3000`

---

## 📮 Postman Collection Import

### Import the Enhanced Collection

1. **Open Postman**

2. **Import Collection**
   - Click **Import** button (top left)
   - Select **File**
   - Navigate to: `c:\Users\bharg\Desktop\Project-PetCare\petcare\PetCare-API-Enhanced.postman_collection.json`
   - Click **Import**

3. **Verify Import**
   - Collection name: **PetCare API - Enhanced Collection**
   - Should contain 8 folders with 30+ requests

### Collection Features ✨

✅ **Automated Tests**: Every request has test scripts  
✅ **Auto-Save Tokens**: JWT tokens are automatically saved to variables  
✅ **Pre-configured**: Base URL and test email variables  
✅ **Organized**: Grouped by feature (Auth, Pets, Medical Records, etc.)  
✅ **Documentation**: Each request has detailed descriptions  

---

## 🧪 Testing Workflow

### Step-by-Step Testing Guide

#### 1️⃣ **Health Check** (Verify API is Running)
```
Folder: 0. Setup & Health Check
Request: Health Check
```
- **Method**: GET
- **URL**: `http://localhost:8080/api/auth/health`
- **Expected Response**: `"Pet Care API is running!"`
- **Status**: 200 OK

---

#### 2️⃣ **User Registration** (New User Signup)

**Step A: Initiate Registration (Send OTP)**
```
Folder: 1. Authentication - Registration Flow
Request: Step 1 - Initiate Registration (Send OTP)
```

**Before Running**:
- Update `{{test_email}}` variable with YOUR email address
- Click on collection → Variables tab → Set `test_email` to your email

**Request Body**:
```json
{
  "email": "youremail@example.com",
  "name": "Your Name",
  "phone": "9876543210",
  "role": "OWNER"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration."
}
```

**Action**: Check your email inbox for OTP code (6 digits)

---

**Step B: Complete Registration (Verify OTP)**
```
Request: Step 2 - Complete Registration (Verify OTP)
```

**Request Body**:
```json
{
  "email": "youremail@example.com",
  "otp": "123456",  // ← Replace with OTP from email
  "name": "Your Name",
  "phone": "9876543210",
  "role": "OWNER"
}
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "youremail@example.com",
  "name": "Your Name",
  "role": "OWNER",
  "message": "Registration successful"
}
```

✅ **Token is automatically saved** to collection variable `{{jwt_token}}`

---

#### 3️⃣ **User Login** (Existing User Login)

**Step A: Initiate Login (Send OTP)**
```
Folder: 2. Authentication - Login Flow
Request: Step 1 - Initiate Login (Send OTP)
```

**Request Body**:
```json
{
  "email": "youremail@example.com"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

**Action**: Check your email for OTP

---

**Step B: Complete Login (Verify OTP)**
```
Request: Step 2 - Complete Login (Verify OTP)
```

**Request Body**:
```json
{
  "email": "youremail@example.com",
  "otp": "123456"  // ← Replace with OTP from email
}
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "email": "youremail@example.com",
  "name": "Your Name",
  "role": "OWNER",
  "message": "Login successful"
}
```

✅ **Token is automatically saved**

---

#### 4️⃣ **Get User Profile** (Requires Authentication)

```
Folder: 3. User Profile
Request: Get User Profile
```

**Headers**: 
- Authorization: `Bearer {{jwt_token}}` (automatically added)

**Expected Response**:
```json
{
  "userId": 1,
  "email": "youremail@example.com",
  "name": "Your Name",
  "phone": "9876543210",
  "role": "OWNER",
  "address": null,
  "profilePhoto": null
}
```

---

#### 5️⃣ **Create a Pet**

```
Folder: 4. Pet Management
Request: Create Pet
```

**Request Body**:
```json
{
  "name": "Buddy",
  "species": "Dog",
  "breed": "Labrador",
  "dateOfBirth": "2023-01-10",
  "gender": "MALE",
  "microchipId": "MC123456",
  "notes": "Friendly and energetic dog"
}
```

**Expected Response**:
```json
{
  "id": 1,
  "name": "Buddy",
  "species": "Dog",
  "breed": "Labrador",
  "dateOfBirth": "2023-01-10",
  "gender": "MALE",
  "microchipId": "MC123456",
  "notes": "Friendly and energetic dog",
  "ownerId": 1
}
```

✅ **Pet ID is automatically saved** to `{{petId}}`

---

#### 6️⃣ **List All Pets**

```
Folder: 4. Pet Management
Request: List My Pets
```

**Expected Response**: Array of pets belonging to the authenticated user
```json
[
  {
    "id": 1,
    "name": "Buddy",
    "species": "Dog",
    "breed": "Labrador",
    ...
  }
]
```

---

#### 7️⃣ **Add Medical Record**

```
Folder: 5. Medical Records
Request: Add Medical Record
```

**Request Body**:
```json
{
  "visitDate": "2025-12-11",
  "recordType": "CHECKUP",
  "vetName": "Dr. Smith",
  "diagnosis": "Healthy",
  "treatment": "Routine checkup",
  "prescriptions": "",
  "notes": "All vital signs normal"
}
```

**URL**: Uses `{{petId}}` from previous step

---

#### 8️⃣ **Add Vaccination**

```
Folder: 6. Vaccinations
Request: Add Vaccination
```

**Request Body**:
```json
{
  "vaccineName": "Rabies",
  "dateGiven": "2025-12-11",
  "nextDueDate": "2026-12-11",
  "batchNumber": "RB2025001",
  "veterinarianName": "Dr. Johnson",
  "notes": "Annual rabies vaccination"
}
```

---

#### 9️⃣ **Add Health Measurement**

```
Folder: 7. Health Measurements
Request: Add Measurement
```

**Request Body**:
```json
{
  "measurementDate": "2025-12-11",
  "weight": 25.5,
  "temperature": 38.5,
  "notes": "Normal weight, good health"
}
```

---

#### 🔟 **Add Reminder**

```
Folder: 8. Reminders
Request: Add Reminder
```

**Request Body**:
```json
{
  "title": "Vet Checkup",
  "type": "CHECKUP",
  "dueDate": "2025-12-25",
  "isRecurring": false,
  "repeatRule": "",
  "notes": "Annual health checkup"
}
```

---

## 📚 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/health` | Health check | No |
| POST | `/api/auth/register/initiate` | Send registration OTP | No |
| POST | `/api/auth/register/complete` | Complete registration | No |
| POST | `/api/auth/login/initiate` | Send login OTP | No |
| POST | `/api/auth/login/complete` | Complete login | No |
| POST | `/api/auth/logout` | Logout | Yes |

### Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile` | Get user profile | Yes |
| PUT | `/api/profile` | Update profile | Yes |

### Pet Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/pets` | List all pets | Yes |
| POST | `/api/pets` | Create pet | Yes |
| GET | `/api/pets/{id}` | Get pet by ID | Yes |
| PUT | `/api/pets/{id}` | Update pet | Yes |
| DELETE | `/api/pets/{id}` | Delete pet | Yes |

### Medical Records Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/pets/{petId}/medical-records` | List records | Yes |
| POST | `/api/pets/{petId}/medical-records` | Add record | Yes |
| PUT | `/api/pets/{petId}/medical-records/{id}` | Update record | Yes |
| DELETE | `/api/pets/{petId}/medical-records/{id}` | Delete record | Yes |

### Vaccination Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/pets/{petId}/vaccinations` | List vaccinations | Yes |
| POST | `/api/pets/{petId}/vaccinations` | Add vaccination | Yes |
| PUT | `/api/pets/{petId}/vaccinations/{id}` | Update vaccination | Yes |
| DELETE | `/api/pets/{petId}/vaccinations/{id}` | Delete vaccination | Yes |

### Health Measurements Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/pets/{petId}/measurements` | List measurements | Yes |
| POST | `/api/pets/{petId}/measurements` | Add measurement | Yes |
| PUT | `/api/pets/{petId}/measurements/{id}` | Update measurement | Yes |
| DELETE | `/api/pets/{petId}/measurements/{id}` | Delete measurement | Yes |

### Reminders Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/pets/{petId}/reminders` | List reminders | Yes |
| POST | `/api/pets/{petId}/reminders` | Add reminder | Yes |
| PATCH | `/api/pets/{petId}/reminders/{id}/complete` | Mark complete | Yes |
| DELETE | `/api/pets/{petId}/reminders/{id}` | Delete reminder | Yes |

---

## 🔍 Frontend-Backend Integration Check

### Frontend API Configuration
**File**: `petcare-frontend/src/services/api.js`
```javascript
const API_URL = 'http://localhost:8080/api';
```

### Frontend Auth Flow

#### Registration (`Register.jsx`)
1. User fills registration form
2. Frontend → `POST /api/auth/register/initiate` (sends email, name, phone, role)
3. Backend sends OTP to email
4. User enters OTP
5. Frontend → `POST /api/auth/register/complete` (sends email, otp, name, phone, role)
6. Backend returns JWT token
7. Frontend stores token in `localStorage`

#### Login (`Login.jsx`)
1. User enters email
2. Frontend → `POST /api/auth/login/initiate` (sends email)
3. Backend sends OTP to email
4. User enters OTP
5. Frontend → `POST /api/auth/login/complete` (sends email, otp)
6. Backend returns JWT token
7. Frontend stores token in `localStorage`

#### Authenticated Requests
All API requests automatically include:
```
Authorization: Bearer <jwt_token>
```

This is handled by axios interceptor in `api.js`.

---

## ❗ Common Issues & Solutions

### Issue 1: Backend Not Starting
**Symptom**: Port 8080 already in use

**Solution**:
```bash
# Check what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 2: OTP Not Received
**Possible Causes**:
- **Email not configured**: Check `application.properties`
- **Gmail App Password**: Verify `spring.mail.password` is correct
- **Spam folder**: Check spam/junk folder
- **Email service down**: Check backend logs

**Check Backend Logs**:
```bash
# Look for email sending logs
tail -f application.log
```

### Issue 3: 401 Unauthorized Error
**Cause**: Invalid or expired JWT token

**Solution**:
1. Re-run login flow to get new token
2. Token expires after 24 hours (`jwt.expiration=86400000`)
3. Check `{{jwt_token}}` variable in Postman

### Issue 4: CORS Error (Frontend)
**Symptom**: Browser console shows CORS error

**Check Backend** has CORS configuration for `http://localhost:3000`

### Issue 5: Database Connection Error
**Symptom**: `Communications link failure` in backend logs

**Solution**:
1. Verify MySQL is running:
   ```bash
   mysql -u root -p
   ```
2. Check database exists:
   ```sql
   SHOW DATABASES;
   ```
3. Create database if missing:
   ```sql
   CREATE DATABASE petcare_db;
   ```

### Issue 6: Frontend Not Connecting to Backend
**Check**:
1. Backend is running on `http://localhost:8080`
2. Frontend `api.js` points to correct URL
3. No firewall blocking
4. Test backend directly in browser: `http://localhost:8080/api/auth/health`

---

## 📊 Testing Checklist

### ✅ Backend Tests
- [ ] Health check returns 200
- [ ] Registration OTP sent successfully
- [ ] Registration completes with valid OTP
- [ ] Login OTP sent successfully
- [ ] Login completes with valid OTP
- [ ] JWT token is returned
- [ ] Protected endpoints require authentication
- [ ] Profile fetch works with token
- [ ] Pet CRUD operations work
- [ ] Medical records, vaccinations, measurements, reminders work

### ✅ Frontend Tests
- [ ] Registration page works
- [ ] OTP verification works
- [ ] Login page works
- [ ] Dashboard loads after login
- [ ] Can create pets
- [ ] Can view pet details
- [ ] Can add medical records
- [ ] Can add vaccinations
- [ ] Can log out

### ✅ Integration Tests
- [ ] Frontend → Backend registration flow works end-to-end
- [ ] Frontend → Backend login flow works end-to-end
- [ ] All authenticated requests include JWT
- [ ] Frontend handles 401 errors (auto-logout)
- [ ] Data created via frontend appears in backend
- [ ] Data created via Postman appears in frontend

---

## 🎓 Best Practices

### Postman Variables
Use collection variables efficiently:
- `{{base_url}}`: API base URL
- `{{test_email}}`: Your testing email
- `{{jwt_token}}`: Auto-saved JWT token
- `{{petId}}`: Auto-saved pet ID

### Environment Setup
For different environments (dev, staging, prod):
1. Create Postman environments
2. Set `base_url` per environment
3. Switch environments as needed

### Security Notes
⚠️ **Never commit** sensitive data:
- Database passwords
- Email passwords
- JWT secrets
- Real user emails

Replace with environment variables in production.

---

## 📞 Support

If you encounter issues:
1. Check backend logs: `application.log`
2. Check frontend console (F12 in browser)
3. Verify Postman tests pass
4. Review this guide

---

## 🎉 Summary

Your PetCare application has:
✅ **Complete REST API** with JWT authentication  
✅ **OTP-based registration and login**  
✅ **Full pet management system**  
✅ **Medical records, vaccinations, health tracking**  
✅ **React frontend** with axios integration  
✅ **Comprehensive Postman collection** for testing  

**Happy Testing! 🐕 🐈**
