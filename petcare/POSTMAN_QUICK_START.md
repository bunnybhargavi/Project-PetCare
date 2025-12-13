# PetCare API - Postman Collection

## 🚀 Quick Start

### 1. Import Collection
1. Open Postman
2. Click **Import** → **File**
3. Select `PetCare-API-Enhanced.postman_collection.json`
4. Click **Import**

### 2. Configure Variables
Click on the collection → **Variables** tab:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:8080` | Backend API URL |
| `test_email` | `your.email@gmail.com` | **⚠️ Change this to YOUR email** |
| `jwt_token` | (auto-filled) | JWT token (auto-saved after login) |
| `petId` | (auto-filled) | Pet ID (auto-saved after creating pet) |

### 3. Start Backend
```bash
cd c:\Users\bharg\Desktop\Project-PetCare\petcare
.\mvnw.cmd spring-boot:run
```

Wait for: `Tomcat started on port 8080`

### 4. Run Tests

#### Test Sequence (In Order):
1. **Health Check** → Verify API is running
2. **Registration Flow**:
   - Step 1: Initiate Registration → Check email for OTP
   - Step 2: Complete Registration → Enter OTP (token auto-saved)
3. **Login Flow** (for existing users):
   - Step 1: Initiate Login → Check email for OTP
   - Step 2: Complete Login → Enter OTP (token auto-saved)
4. **Get User Profile** → Test authentication
5. **Create Pet** → Pet ID auto-saved
6. **List Pets** → View all pets
7. **Add Medical Record/Vaccination/Measurement**

---

## 📋 Collection Features

✅ **Automated Tests**: Every request includes test scripts  
✅ **Auto-Save Tokens**: JWT tokens automatically saved to variables  
✅ **Auto-Save IDs**: Pet IDs automatically saved after creation  
✅ **Pre-configured**: Ready to use, just change email  
✅ **Documentation**: Each request has detailed descriptions  
✅ **Organized**: 8 folders, 30+ requests  

---

## 🔑 Important Notes

### ⚠️ Before First Use
**Change the `test_email` variable to YOUR email address!**

Otherwise, you won't receive OTP codes.

### 📧 Email OTP
- OTP is sent to the email in registration/login requests
- OTP is valid for **5 minutes**
- Check spam folder if not received
- Email is configured in backend: `petcare.customerservices@gmail.com`

### 🔐 Authentication Flow

All authenticated endpoints automatically use `{{jwt_token}}` variable.

**First time testing:**
1. Run **Registration Step 1** (sends OTP to email)
2. Check your email inbox for OTP
3. Run **Registration Step 2** with the OTP
4. Token is automatically saved to `{{jwt_token}}`
5. All subsequent requests will use this token

**For existing users:**
1. Run **Login Step 1** (sends OTP to email)
2. Check your email inbox for OTP
3. Run **Login Step 2** with the OTP
4. Token is automatically saved

### 🐕 Creating Pets
After creating a pet, the `petId` variable is automatically populated.

All pet-related endpoints (medical records, vaccinations, etc.) use `{{petId}}`.

---

## 📁 Collection Structure

```
PetCare API - Enhanced Collection
│
├── 0. Setup & Health Check
│   └── Health Check
│
├── 1. Authentication - Registration Flow
│   ├── Step 1 - Initiate Registration
│   └── Step 2 - Complete Registration
│
├── 2. Authentication - Login Flow
│   ├── Step 1 - Initiate Login
│   ├── Step 2 - Complete Login
│   └── Logout
│
├── 3. User Profile
│   ├── Get User Profile
│   └── Update User Profile
│
├── 4. Pet Management
│   ├── List My Pets
│   ├── Create Pet
│   ├── Get Pet by ID
│   ├── Update Pet
│   └── Delete Pet
│
├── 5. Medical Records
│   ├── List Medical Records
│   └── Add Medical Record
│
├── 6. Vaccinations
│   ├── List Vaccinations
│   └── Add Vaccination
│
├── 7. Health Measurements
│   ├── List Measurements
│   └── Add Measurement
│
└── 8. Reminders
    ├── List Reminders
    └── Add Reminder
```

---

## 🧪 Test Scripts

Every request includes automated tests:

### Example: Registration Complete
```javascript
pm.test("Registration successful and token received", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.token).to.exist;
    pm.expect(jsonData.userId).to.exist;
    
    // Auto-save token
    pm.collectionVariables.set('jwt_token', jsonData.token);
});
```

View test results in the **Test Results** tab after each request.

---

## ❓ Troubleshooting

### OTP Not Received
- Check spam/junk folder
- Verify backend is running
- Check backend logs: `petcare/application.log`
- Email might take 1-2 minutes

### 401 Unauthorized
- Token expired (24 hours expiration)
- Run login flow again to get new token
- Check `{{jwt_token}}` variable is populated

### Connection Refused
- Backend not running
- Wrong port (should be 8080)
- Check `{{base_url}}` variable

### Invalid OTP
- OTP expired (valid for 5 minutes)
- Wrong OTP entered
- Request new OTP (re-run Step 1)

---

## 📖 API Documentation

For detailed API documentation, see:
- **Full Guide**: `API_TESTING_GUIDE.md`
- **Backend Controllers**: `petcare/src/main/java/com/pets/petcare/controller/`

---

## 🔄 Environment Variables

For testing different environments:

| Environment | base_url |
|-------------|----------|
| Local | `http://localhost:8080` |
| Development | `http://dev.petcare.com` |
| Production | `https://api.petcare.com` |

Create separate Postman environments for each.

---

## ✅ Testing Checklist

- [ ] Import collection successfully
- [ ] Update `test_email` to your email
- [ ] Backend running on port 8080
- [ ] Health check returns 200 OK
- [ ] Registration: OTP received in email
- [ ] Registration: Complete with valid OTP
- [ ] Token auto-saved to `{{jwt_token}}`
- [ ] Login flow works
- [ ] Profile fetch works with token
- [ ] Create pet successful
- [ ] Pet ID auto-saved to `{{petId}}`
- [ ] Can list pets
- [ ] Can add medical records
- [ ] All tests pass ✅

---

## 📞 Need Help?

Refer to the comprehensive guide: `API_TESTING_GUIDE.md`

---

**Happy Testing! 🐾**
