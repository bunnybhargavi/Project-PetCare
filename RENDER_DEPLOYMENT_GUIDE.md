# 🚀 Render Deployment Guide for PawHaven

## ✅ Issues Fixed

### 1. **Database Configuration**
- ✅ Updated `render.yaml` to include PostgreSQL database service
- ✅ Changed `application-prod.properties` from MySQL to PostgreSQL
- ✅ Added proper database URL environment variable mapping

### 2. **Dockerfile Improvements**
- ✅ Added PORT environment variable handling
- ✅ Created uploads directory in container
- ✅ Changed to ENTRYPOINT for better signal handling

### 3. **Flyway Migrations**
- ✅ Disabled Flyway temporarily (migrations are MySQL-specific)
- ✅ Using Hibernate auto-DDL for initial schema creation

---

## 📋 Pre-Deployment Checklist

### **Critical Issues to Address:**

#### ⚠️ **Duplicate Flyway Migrations**
You have duplicate migration files that will cause issues:
- `V11__Emergency_Status_Fix.sql` and `V11__Fix_OrderItems_Price_Column.sql`
- `V20__Fix_All_Schema_Issues.sql` and `V20__Fix_Orders_Table_Ultimate.sql`

**Action Required:** Delete or rename the duplicate files before re-enabling Flyway.

---

## 🔧 Deployment Steps

### **Step 1: Push Changes to GitHub**

```bash
git add .
git commit -m "Configure for Render deployment with PostgreSQL"
git push origin main
```

### **Step 2: Create Render Account & Service**

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`

### **Step 3: Review Configuration**

Render will create:
- **PostgreSQL Database**: `pawhaven-db`
- **Web Service**: `pawhaven-backend`

### **Step 4: Update Environment Variables (Optional)**

In the Render dashboard, you can update:
- `MAIL_USERNAME` - Your email service username
- `MAIL_PASSWORD` - Your email service password
- `PAYPAL_CLIENT_ID` - Your PayPal client ID
- `PAYPAL_CLIENT_SECRET` - Your PayPal client secret

**Note:** JWT_SECRET will be auto-generated securely by Render.

### **Step 5: Deploy**

1. Click **"Apply"** to start deployment
2. Wait for database to provision (2-3 minutes)
3. Wait for web service to build and deploy (5-10 minutes)

---

## 🔍 Monitoring Deployment

### **Check Build Logs**
- Go to your service → **"Logs"** tab
- Watch for:
  - ✅ Maven build success
  - ✅ Application starting
  - ✅ Database connection established
  - ✅ Health check passing

### **Common Build Errors & Fixes**

#### **Error: "Port already in use"**
- **Fix:** Already handled in updated Dockerfile

#### **Error: "Failed to connect to database"**
- **Fix:** Wait for database to fully provision
- **Check:** Environment variables are correctly set

#### **Error: "Flyway migration failed"**
- **Fix:** Already disabled Flyway for initial deployment

#### **Error: "Health check failed"**
- **Check:** `/api/health` endpoint is accessible
- **Verify:** Application started successfully in logs

---

## 🧪 Testing Deployment

### **1. Health Check**
```bash
curl https://pawhaven-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "UP",
  "timestamp": "2026-01-15T..."
}
```

### **2. Test Registration**
Use Postman or curl to test the registration endpoint:
```bash
curl -X POST https://pawhaven-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "role": "OWNER"
  }'
```

---

## 🔄 Post-Deployment Tasks

### **1. Re-enable Flyway (Optional)**

Once the initial schema is created by Hibernate:

1. Update `application-prod.properties`:
```properties
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

2. Fix duplicate migrations first!

3. Redeploy

### **2. Fix Duplicate Migrations**

**Option A: Delete duplicates**
```bash
# Delete one of each duplicate
rm petcare/src/main/resources/db/migration/V11__Fix_OrderItems_Price_Column.sql
rm petcare/src/main/resources/db/migration/V20__Fix_Orders_Table_Ultimate.sql
```

**Option B: Rename to higher versions**
```bash
# Rename to V16 and V22
mv V11__Fix_OrderItems_Price_Column.sql V16__Fix_OrderItems_Price_Column.sql
mv V20__Fix_Orders_Table_Ultimate.sql V22__Fix_Orders_Table_Ultimate.sql
```

### **3. Convert MySQL Migrations to PostgreSQL**

Your current migrations use MySQL syntax. For PostgreSQL, you'll need to:
- Change `AUTO_INCREMENT` → `SERIAL` or use sequences
- Change `LONGTEXT` → `TEXT`
- Change `DATETIME` → `TIMESTAMP`
- Update any MySQL-specific functions

---

## 📊 Database Access

### **Connect to PostgreSQL Database**

Render provides connection details in the database dashboard:

```bash
# External connection string (from Render dashboard)
psql postgresql://user:password@host:port/database
```

Or use a GUI tool like:
- **pgAdmin**
- **DBeaver**
- **TablePlus**

---

## 🐛 Troubleshooting

### **Application Won't Start**

1. **Check logs** for specific error messages
2. **Verify** database connection string is correct
3. **Ensure** all required environment variables are set

### **Database Connection Timeout**

- Render's free tier databases can take 2-3 minutes to wake up
- First request may be slow

### **Build Fails**

- **Check** Maven dependencies can be downloaded
- **Verify** Java 17 is specified correctly
- **Review** Dockerfile syntax

### **Health Check Fails**

- **Verify** `/api/health` endpoint exists and is accessible
- **Check** security configuration allows unauthenticated access
- **Ensure** application is listening on correct PORT

---

## 📝 Important Notes

### **Free Tier Limitations**
- Database spins down after 90 days of inactivity
- Web service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds

### **Environment Variables**
- Never commit sensitive data to git
- Use Render's environment variable management
- JWT_SECRET is auto-generated for security

### **Database Backups**
- Free tier doesn't include automatic backups
- Upgrade to paid tier for backup features

---

## 🎯 Next Steps

1. ✅ Push code changes to GitHub
2. ✅ Create Render Blueprint deployment
3. ✅ Monitor build logs
4. ✅ Test health endpoint
5. ✅ Test API endpoints
6. ⏭️ Fix duplicate migrations
7. ⏭️ Convert migrations to PostgreSQL
8. ⏭️ Re-enable Flyway

---

## 📞 Support

If you encounter issues:
1. Check Render's [documentation](https://render.com/docs)
2. Review application logs in Render dashboard
3. Check database connection status
4. Verify environment variables are set correctly

---

**Good luck with your deployment! 🚀**
