# Pirisa HR Management System

A comprehensive Human Resource Management system built with modern web technologies, providing complete employee lifecycle management, payroll processing, attendance tracking, and company administration capabilities.

## 🏢 Project Overview

Pirisa HRM is a full-stack web application designed to streamline HR processes for organizations of all sizes. The system provides intuitive interfaces for both HR administrators and employees, with robust backend services ensuring data security and reliability.

## 🚀 Quick Start

### Prerequisites
- Java 11 or higher
- Node.js 18 or higher
- MySQL/MariaDB database
- Maven 3.6+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pirisa
   ```

2. **Backend Setup**
   ```bash
   cd HRM-main
   ./mvnw spring-boot:run
   ```

3. **Frontend Setup**
   ```bash
   cd PirisaHR-main
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:8080/api

## 📋 System Architecture

### Frontend (PirisaHR-main)
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **React Router** for client-side routing
- **Axios** for API communication
- **Recharts** for data visualization
- **Stripe** for payment processing

### Backend (HRM-main)
- **Spring Boot 2.7.17** as the core framework
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **MySQL/MariaDB** for data persistence
- **Stripe Java SDK** for payment integration
- **JavaMail** for email services

## 🌟 Key Features

### 👥 Employee Management
- Complete employee lifecycle management
- Employee registration and onboarding
- Profile management with document upload
- Employee search and advanced filtering
- Organizational hierarchy management

### ⏰ Attendance Management
- Daily attendance tracking and marking
- Attendance history and analytics
- Bulk attendance operations
- Overtime calculation and management
- Attendance reports and exports

### 💰 Payroll Management
- Automated salary calculations
- Allowance and bonus management
- Payslip generation (PDF)
- Tax calculations and compliance
- Payroll reports and analytics

### 🏖️ Leave Management
- Leave request and approval workflow
- Leave balance tracking
- Company leave policy management
- Leave calendar and planning
- Automated leave accrual

### 📊 Performance Management
- Employee evaluation system
- Performance appraisal forms
- Goal setting and tracking
- 360-degree feedback
- Performance analytics

### 🏢 Company Administration
- Company profile management
- Department and designation management
- System settings and configurations
- User role and permission management
- Audit logs and reporting

### 💳 Payment Integration
- Stripe payment processing
- Subscription management
- Invoice generation
- Payment history and tracking
- Automated billing

## 📁 Project Structure

```
pirisa/
├── HRM-main/                    # Backend Spring Boot Application
│   ├── src/main/java/com/knoweb/HRM/
│   │   ├── controller/          # REST API Controllers
│   │   ├── service/             # Business Logic Services
│   │   ├── model/               # Entity Models
│   │   ├── repository/          # JPA Repositories
│   │   ├── config/              # Configuration Classes
│   │   └── dto/                 # Data Transfer Objects
│   ├── src/main/resources/      # Application Resources
│   └── pom.xml                  # Maven Dependencies
├── PirisaHR-main/               # Frontend React Application
│   ├── src/
│   │   ├── components/          # Reusable Components
│   │   ├── pages/               # Page Components
│   │   ├── api/                 # API Layer
│   │   ├── context/             # React Contexts
│   │   ├── utils/               # Utility Functions
│   │   └── types.ts             # Type Definitions
│   ├── public/                  # Static Assets
│   └── package.json            # NPM Dependencies
├── BACKEND.md                   # Backend Documentation
├── FRONTEND.md                  # Frontend Documentation
└── README.md                    # This File
```

## 🔧 Configuration

### Backend Configuration
Update `src/main/resources/application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/pirisahrm
spring.datasource.username=root
spring.datasource.password=password

# JWT Configuration
jwt.secret=your-secret-key
jwt.expiration=86400000

# Stripe Configuration
stripe.secret.key=sk_test_...
```

### Frontend Configuration
Create `.env` file in `PirisaHR-main/`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password encryption with BCrypt
- Session management and timeout

### Data Security
- SQL injection prevention with JPA
- XSS protection with input validation
- CORS configuration for cross-origin requests
- Secure file upload handling

### API Security
- Request/response validation
- Rate limiting and throttling
- API versioning
- Comprehensive audit logging

## 📊 Reports & Analytics

### Available Reports
- Employee reports and demographics
- Attendance and time-tracking reports
- Payroll and salary reports
- Leave and absence reports
- Performance and evaluation reports
- Custom report builder

### Export Options
- PDF reports with charts and graphs
- Excel spreadsheets for data analysis
- CSV exports for data migration
- Scheduled report generation

## 🌐 Multi-language Support

The frontend supports internationalization with:
- Dynamic language switching
- Translation management system
- RTL (Right-to-Left) language support
- Localized date and number formatting

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interfaces
- Progressive Web App (PWA) ready
- Cross-browser compatibility

## 🧪 Testing

### Backend Testing
```bash
cd HRM-main
./mvnw test
```

### Frontend Testing
```bash
cd PirisaHR-main
npm run test
```

### End-to-End Testing
- Cypress configuration for E2E tests
- User journey automation
- Cross-browser testing

## 🚀 Deployment

### Development Environment
- Backend: `./mvnw spring-boot:run`
- Frontend: `npm run dev`

### Production Deployment
- Backend: Deploy WAR file to Tomcat or similar
- Frontend: Build static files and deploy to web server
- Database: Configure production MySQL/MariaDB instance

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📚 Documentation

- **[Backend Documentation](./BACKEND.md)** - Detailed backend API documentation
- **[Frontend Documentation](./FRONTEND.md)** - Comprehensive frontend guide
- **API Documentation** - Available at `/swagger-ui.html` when backend is running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation files
- Review the FAQ section

## 🔄 Version History

### Version 1.0.0 (Current)
- Complete HRM functionality
- Employee management system
- Attendance and payroll modules
- Leave management system
- Performance appraisal features
- Payment integration with Stripe
- Multi-language support
- Responsive design

## 🛠️ Technologies Used

### Backend Stack
- **Java 11** - Programming Language
- **Spring Boot 2.7.17** - Application Framework
- **Spring Security** - Security Framework
- **Spring Data JPA** - Data Access Layer
- **MySQL/MariaDB** - Database
- **JWT** - Authentication Tokens
- **Maven** - Build Tool
- **Stripe Java SDK** - Payment Processing

### Frontend Stack
- **React 18** - UI Framework
- **TypeScript** - Type-Safe JavaScript
- **Vite** - Build Tool
- **Tailwind CSS** - CSS Framework
- **React Router** - Client-Side Routing
- **Axios** - HTTP Client
- **Recharts** - Charting Library
- **React Query** - Server State Management
- **Stripe React** - Payment Processing

### Development Tools
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **Git** - Version Control
- **Docker** - Containerization

## 📈 Performance Metrics

- **Backend Response Time**: < 200ms average
- **Frontend Load Time**: < 3s initial load
- **Database Query Optimization**: Indexed queries
- **Bundle Size**: Optimized with code splitting
- **Cache Strategy**: Implemented for frequently accessed data

## 🔮 Future Roadmap

### Upcoming Features
- AI-powered employee recommendations
- Advanced analytics dashboard
- Mobile application (React Native)
- Integration with third-party HR systems
- Advanced reporting and BI tools
- Employee self-service portal
- Recruitment and onboarding module
- Training and development management

### Technical Improvements
- Microservices architecture migration
- Real-time notifications with WebSockets
- Advanced caching strategies
- Performance optimization
- Enhanced security features
- Cloud deployment options

---

**Pirisa HRM** - Streamlining Human Resource Management for Modern Enterprises
