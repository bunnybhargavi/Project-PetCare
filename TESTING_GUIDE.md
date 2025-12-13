# Quick Testing Guide - Appointment System

## 🚀 Getting Started

### 1. Import Postman Collection
1. Open Postman
2. Click **Import**
3. Select `PetCare-API-Appointments-v3.postman_collection.json`
4. Collection will appear in your sidebar

### 2. Start the Application
```bash
# Backend (Terminal 1)
cd c:\Users\bharg\Desktop\Project-PetCare\petcare
./mvnw spring-boot:run

# Frontend (Terminal 2)
cd c:\Users\bharg\Desktop\Project-PetCare\petcare-frontend\petcare-frontend
npm start
```

---

## 📋 Testing Workflow

### Step 1: Register & Login
1. Open Postman → **1. Authentication - Registration Flow**
2. Run **Step 1 - Initiate Registration**
3. Check your email for OTP (or check console logs)
4. Run **Step 2 - Complete Registration** with the OTP
5. JWT token is auto-saved ✅

### Step 2: Create a Pet
1. Go to **4. Pet Management**
2. Run **Create Pet**
3. Pet ID is auto-saved ✅

### Step 3: Search for Vets
**Option A: Frontend (Recommended)**
1. Open browser: `http://localhost:3000`
2. Click **Find a Vet** in navbar
3. Try different search filters:
   - Specialization: "Dermatology"
   - Location: "Street"
   - Teleconsult: "Available"
4. Click **Search**

**Option B: Postman**
1. Go to **Veterinarian Search**
2. Run **Search Veterinarians (Advanced)**
3. Modify search params as needed

### Step 4: Create Availability Slot (Vet)
1. Go to **Appointment Slots**
2. Run **Create Slot (Vet)**
3. Modify the request body:
```json
{
  "startTime": "2025-12-20T10:00:00",
  "endTime": "2025-12-20T10:30:00",
  "supportedType": "BOTH",
  "capacity": 1
}
```
4. Slot ID is auto-saved ✅

### Step 5: Book an Appointment
**Option A: Frontend**
1. On Find a Vet page, click **Book Appointment** on any vet
2. Select your pet
3. Choose a time slot (if available)
4. Enter reason for visit
5. Click **Confirm Appointment**
6. Check your email for confirmation! 📧

**Option B: Postman**
1. Go to **Appointment Booking**
2. Run **Book Appointment**
3. Appointment ID is auto-saved ✅
4. Check response for `meetingLink` if VIDEO type

### Step 6: Update Appointment Status
1. Go to **Appointment Status Management**
2. Run **Update Appointment Status**
3. Try different statuses:
   - `COMPLETED` - with notes and prescription
   - `CANCELLED` - sends cancellation email

---

## 🎯 Testing Scenarios

### Scenario 1: Video Consultation Booking
```json
POST /api/appointments/book
{
  "petId": 1,
  "veterinarianId": 1,
  "slotId": 5,
  "type": "VIDEO",
  "reason": "Skin rash consultation"
}
```
**Expected:**
- ✅ Appointment created with `meetingLink`
- ✅ Confirmation email sent to owner
- ✅ Vet notification email sent
- ✅ Meeting link in email: `https://meet.jit.si/PetCare-...`

### Scenario 2: In-Clinic Appointment
```json
POST /api/appointments/book
{
  "petId": 1,
  "veterinarianId": 1,
  "slotId": 6,
  "type": "IN_CLINIC",
  "reason": "Annual checkup"
}
```
**Expected:**
- ✅ Appointment created (no meeting link)
- ✅ Confirmation email sent
- ✅ Vet notification sent

### Scenario 3: Complete Appointment with Notes
```json
PUT /api/appointments/10/status
{
  "status": "COMPLETED",
  "notes": "Pet examined. Healthy overall. Slight ear infection detected.",
  "prescription": "Ear drops - 2 drops twice daily for 7 days"
}
```
**Expected:**
- ✅ Appointment status updated to COMPLETED
- ✅ Notes and prescription saved
- ✅ Available in appointment record

### Scenario 4: Cancel Appointment
```json
PUT /api/appointments/10/status
{
  "status": "CANCELLED",
  "notes": "Owner requested cancellation due to travel"
}
```
**Expected:**
- ✅ Appointment status updated to CANCELLED
- ✅ Cancellation email sent to owner
- ✅ Slot becomes available again (if was booked)

### Scenario 5: Search Teleconsult Vets
```json
POST /api/veterinarians/search
{
  "teleconsultAvailable": true
}
```
**Expected:**
- ✅ Returns only vets with `availableForTeleconsult: true`

---

## 📧 Email Testing

### Check Email Notifications
After booking an appointment, you should receive:

**1. Confirmation Email (Immediate)**
```
Subject: ✅ Appointment Confirmed with PetCare Clinic
Body: 
- Vet name
- Appointment time
- Type (VIDEO/IN_CLINIC)
- Meeting link (if VIDEO)
```

**2. 24-Hour Reminder (Automated)**
- Runs every hour
- Checks for appointments 24-25 hours away
- Sends reminder email

**3. 1-Hour Reminder (Automated)**
- Runs every 15 minutes
- Checks for appointments 1-1.25 hours away
- Sends reminder email

**4. Vet Notification (Immediate)**
```
Subject: 🆕 New Appointment Booking
Body:
- Pet name
- Owner name
- Appointment time
- Type
- Reason for visit
```

### Email Not Received?
1. **Check Console Logs**: OTP and emails are logged in development
2. **Check Spam Folder**: Gmail might filter automated emails
3. **Verify SMTP Config**: Check `application.properties`

---

## 🔍 Verification Checklist

### Backend Verification
- [ ] Backend running on `http://localhost:8080`
- [ ] Can access `/api/veterinarians` endpoint
- [ ] Sample vets created (check console logs)
- [ ] JWT authentication working
- [ ] Emails being sent (check logs)

### Frontend Verification
- [ ] Frontend running on `http://localhost:3000`
- [ ] Can navigate to Find a Vet page
- [ ] Search filters working
- [ ] Vets displaying correctly
- [ ] Booking modal opens
- [ ] Can select pet and slot

### Database Verification
```sql
-- Check appointments
SELECT * FROM appointments;

-- Check slots
SELECT * FROM appointment_slots;

-- Check vets
SELECT * FROM veterinarians;
```

---

## 🐛 Common Issues & Solutions

### Issue: "Vet not found" error
**Solution**: Make sure vet ID exists. Check console logs for initialized vets (ID 1 and 2 by default)

### Issue: "Slot is already booked"
**Solution**: Create a new slot or use a different slot ID

### Issue: "Pet not found"
**Solution**: Create a pet first using the Pet Management endpoints

### Issue: Frontend shows empty vet list
**Solution**: 
1. Check browser console for errors
2. Verify backend is running
3. Check API endpoint: `http://localhost:8080/api/veterinarians`

### Issue: Booking modal not opening
**Solution**: Check browser console for errors. Ensure BookingModal component exists.

### Issue: Reminders not sending
**Solution**: 
1. Create appointments with future dates
2. Wait for scheduled tasks to run
3. Check server logs for "Sending reminder" messages

---

## 📊 Expected Results

### After Full Testing:
- ✅ 2 veterinarians in database
- ✅ At least 1 pet created
- ✅ At least 1 slot created
- ✅ At least 1 appointment booked
- ✅ Confirmation email received
- ✅ Vet notification received
- ✅ Meeting link generated (for VIDEO appointments)
- ✅ Status updates working
- ✅ Search functionality working

---

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ You can search and find vets on the frontend
2. ✅ You can book an appointment through the UI
3. ✅ You receive a confirmation email
4. ✅ The vet receives a notification email
5. ✅ Video appointments have meeting links
6. ✅ You can update appointment status
7. ✅ Cancellation sends an email

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review console logs (backend and frontend)
3. Check browser developer tools (F12)
4. Verify all services are running
5. Check database for data

---

*Happy Testing! 🚀*
