# 🐾 PetCare - Complete Pet Management Platform

A comprehensive pet care management system that connects pet owners, veterinarians, and vendors in one integrated platform. Built with Spring Boot backend and React frontend.

## 🌟 Features

### For Pet Owners
- **Pet Management**: Add, edit, and manage multiple pets with photos and detailed profiles
- **Appointment Booking**: Schedule appointments with veterinarians (video or in-clinic)
- **Health Tracking**: Monitor pet health records, vaccinations, and medical history
- **Reminders**: Set and manage vaccination, medication, and checkup reminders
- **Shopping**: Browse and purchase pet products from vendors
- **Order Tracking**: Track order status from placement to delivery

### For Veterinarians
- **Patient Management**: View and manage patient records and medical history
- **Appointment Management**: Approve/reject appointment requests and manage schedule
- **Medical Records**: Create and maintain comprehensive medical records
- **Availability Management**: Set available time slots for appointments
- **Prescription Management**: Write and track prescriptions

### For Vendors
- **Product Management**: Add, edit, and manage pet products with images
- **Order Management**: Track and update order status
- **Dashboard Analytics**: View sales and order statistics
- **Inventory Tracking**: Monitor product availability

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.x with Java 17
- **Database**: MySQL with Flyway migrations
- **Security**: JWT-based authentication with role-based access control
- **Payment**: PayPal sandbox integration
- **File Upload**: Image storage and serving system
- **API Documentation**: RESTful APIs with comprehensive error handling

### Frontend (React)
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS with custom components
- **State Management**: Context API for authentication
- **UI Components**: Custom pet-themed components with animations
- **Responsive Design**: Mobile-first approach

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd petcare
   ```

2. **Configure Database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE petcare_db;
   ```

3. **Update Configuration**
   Edit `petcare/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/petcare_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

4. **Run Backend**
   ```bash
   cd petcare
   ./mvnw spring-boot:run
   ```
   Backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd petcare-frontend/petcare-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   ```

4. **Start Frontend**
   ```bash
   npm start
   ```
   Frontend will start on `http://localhost:3000`

## 📁 Project Structure

```
petcare/
├── petcare/                          # Spring Boot Backend
│   ├── src/main/java/com/pets/petcare/
│   │   ├── config/                   # Configuration classes
│   │   ├── controller/               # REST Controllers
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── entity/                   # JPA Entities
│   │   ├── repository/               # Data Repositories
│   │   ├── service/                  # Business Logic
│   │   └── exception/                # Exception Handlers
│   ├── src/main/resources/
│   │   ├── db/migration/             # Flyway Database Migrations
│   │   └── application.properties    # Configuration
│   └── uploads/                      # File Storage
│
├── petcare-frontend/petcare-frontend/ # React Frontend
│   ├── src/
│   │   ├── components/               # React Components
│   │   │   ├── Dashboard/            # Dashboard Components
│   │   │   ├── Shop/                 # E-commerce Components
│   │   │   ├── Vendor/               # Vendor Components
│   │   │   ├── Layout/               # Layout Components
│   │   │   └── ...
│   │   ├── services/                 # API Services
│   │   ├── context/                  # React Context
│   │   └── Pages/                    # Page Components
│   └── public/                       # Static Assets
│
└── README.md                         # This file
```

## 🔧 Configuration

### Database Configuration
The application uses Flyway for database migrations. All schema changes are versioned in `src/main/resources/db/migration/`.

### PayPal Integration
Configure PayPal sandbox credentials in `application.properties`:
```properties
paypal.client.id=your_paypal_client_id
paypal.client.secret=your_paypal_client_secret
paypal.mode=sandbox
```

### File Upload Configuration
Images are stored in the `uploads/` directory and served via static file serving.

## 🎨 UI/UX Features

- **Pet-Themed Design**: Paw prints, pet emojis, and warm color schemes
- **Purple-Pink Gradient Theme**: Consistent branding throughout
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects and transitions
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Comprehensive error messages and fallbacks

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Different permissions for owners, vets, and vendors
- **Password Security**: Secure password hashing
- **API Security**: Protected endpoints with proper authorization
- **File Upload Security**: Validated file types and sizes

## 💳 Payment Integration

- **PayPal Sandbox**: Integrated PayPal payment processing
- **Order Management**: Complete order lifecycle tracking
- **Payment Verification**: Secure payment confirmation
- **Refund Support**: Payment reversal capabilities

## 📱 User Roles

### Pet Owner
- Register and manage pets
- Book appointments
- Track health records
- Shop for products
- Manage orders

### Veterinarian
- Manage patient records
- Approve appointments
- Create medical records
- Set availability
- Write prescriptions

### Vendor
- Manage products
- Process orders
- Track inventory
- View analytics

## 🧪 Testing

### Backend Testing
```bash
cd petcare
./mvnw test
```

### Frontend Testing
```bash
cd petcare-frontend/petcare-frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Build the application:
   ```bash
   ./mvnw clean package
   ```
2. Run the JAR file:
   ```bash
   java -jar target/petcare-0.0.1-SNAPSHOT.jar
   ```

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```
2. Serve the build folder using a web server


## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify MySQL is running
   - Check database credentials in `application.properties`
   - Ensure database exists

2. **Frontend Not Loading**
   - Check if backend is running on port 8080
   - Verify API URL in frontend `.env` file
   - Clear browser cache

3. **File Upload Issues**
   - Check `uploads/` directory permissions
   - Verify file size limits
   - Ensure supported file types

4. **Payment Issues**
   - Verify PayPal sandbox credentials
   - Check PayPal configuration
   - Review payment logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

---


**Built with ❤️ for pet lovers everywhere! 🐾**
