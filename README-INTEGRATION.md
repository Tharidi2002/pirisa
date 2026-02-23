# Pirisa HRM - Complete Integrated Application

## Overview
This document explains how to run the complete Pirisa HRM application with both backend and frontend integrated.

## Project Structure
```
F:\KnoWeb-office\Pirisa\
├── HRM-main\                    # Spring Boot Backend
│   ├── src\main\java\com\knoweb\HRM\
│   ├── pom.xml
│   └── mvnw.cmd
├── PirisaHR-frontend\            # React/Vite Frontend
│   ├── src\
│   ├── package.json
│   └── vite.config.ts
├── start-complete-app.bat        # Start both backend & frontend
├── start-backend-only.bat        # Start only backend
├── start-frontend-only.bat       # Start only frontend
└── README-INTEGRATION.md         # This file
```

## Prerequisites
1. **Java 11** installed at `D:\Program Files\Java\jdk-11.0.17`
2. **Node.js** (v16 or higher) installed
3. **MySQL/MariaDB** database running
4. **Git** (for version control)

## Quick Start

### Option 1: Start Complete Application (Recommended)
```batch
# Double-click or run from command line
start-complete-app.bat
```
This will:
- Set up Java environment
- Kill any existing processes on ports 8080 and 5174
- Start the backend on http://localhost:8080
- Start the frontend on http://localhost:5174

### Option 2: Start Backend Only
```batch
start-backend-only.bat
```

### Option 3: Start Frontend Only
```batch
start-frontend-only.bat
```

## Manual Start Instructions

### Backend (Spring Boot)
```batch
cd HRM-main
set JAVA_HOME=D:\Program Files\Java\jdk-11.0.17
mvnw.cmd spring-boot:run
```
Backend will start on: http://localhost:8080

### Frontend (React/Vite)
```batch
cd PirisaHR-frontend
npm install
npm run dev
```
Frontend will start on: http://localhost:5174

## Application URLs
- **Frontend Application**: http://localhost:5174
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html (if enabled)

## API Endpoints
Key endpoints available in the backend:

### Authentication
- `POST /login` - User login
- `POST /password/forgotPassword` - Forgot password
- `POST /api/company/register` - Company registration

### Company Management
- `GET /api/company/all` - Get all companies
- `GET /api/company/{id}` - Get company by ID
- `PUT /api/company/update` - Update company
- `DELETE /api/company/delete/{id}` - Delete company

### Employee Management
- `GET /api/employee/all` - Get all employees
- `GET /api/employee/company/{companyId}` - Get employees by company
- `POST /api/employee/create` - Create employee
- `PUT /api/employee/update` - Update employee
- `DELETE /api/employee/delete/{id}` - Delete employee

## Integration Details

### CORS Configuration
The backend is configured to accept requests from:
- http://localhost:5173 (Vite default)
- http://localhost:5174 (Current Vite port)
- http://localhost:3000 (React default)

### Frontend API Configuration
Frontend API calls are configured in:
- `src/api/config/axios.ts` - Base URL: http://localhost:8080
- `src/api/endpoints.ts` - All API endpoints
- `src/api/services/authService.ts` - Authentication service

### Database Configuration
Make sure your database is configured in `HRM-main/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hrm_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Troubleshooting

### Port Conflicts
If you get port conflicts:
1. Run the startup scripts - they automatically kill conflicting processes
2. Or manually kill processes:
   ```batch
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   ```

### Backend Issues
1. Check Java version: `java -version` (should be Java 11)
2. Check Maven wrapper: `mvnw.cmd -version`
3. Check database connection

### Frontend Issues
1. Check Node.js version: `node --version`
2. Clear node_modules and reinstall: `rmdir /s node_modules && npm install`
3. Check if backend is running on port 8080

### Compilation Errors
If you get compilation errors:
1. Run `mvnw.cmd clean compile` in HRM-main directory
2. Check for any syntax errors in Java files
3. Ensure all dependencies are properly configured

## Development Notes

### Backend Development
- Uses Spring Boot 2.7.17
- Java 11
- Spring Security with JWT
- JPA/Hibernate for database
- Maven for dependency management

### Frontend Development
- Uses React 18 with TypeScript
- Vite as build tool
- TailwindCSS for styling
- Axios for API calls
- React Router for navigation

### Testing the Integration
1. Start both applications
2. Open http://localhost:5174 in browser
3. Try login functionality
4. Check browser network tab for API calls
5. Verify CORS is working properly

## Support
For any issues:
1. Check the console output of both backend and frontend
2. Verify database connectivity
3. Ensure all prerequisites are met
4. Check this document for troubleshooting steps

## Next Steps
1. Set up your database with the required schema
2. Configure database credentials in application.properties
3. Run the application using the provided scripts
4. Test all functionality
5. Deploy to production when ready
