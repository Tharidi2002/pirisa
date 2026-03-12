# URL Configuration for Deployment

## IP Address: 129.212.239.12

### Frontend Configuration (PirisaHR-main)

#### Environment Variables
- **Development**: `.env.development` → `VITE_API_BASE_URL=http://localhost:8080`
- **Production**: `.env.production` → `VITE_API_BASE_URL=http://129.212.239.12:8080`

#### API Configuration
- **Frontend Base URL**: `http://129.212.239.12` (port 5174)
- **Backend API URL**: `http://129.212.239.12:8080`
- **API Helper**: `src/config/api.ts` with `buildApiUrl()` function

### Backend Configuration (HRM-main)

#### Application Properties
```properties
app.domain=http://129.212.239.12:8080
server.port=8080
```

#### CORS Configuration
Updated to allow:
- `http://129.212.239.12:5174`
- `http://129.212.239.12`
- Development URLs (localhost, 127.0.0.1)

#### Controllers Updated
- `SecurityConfig.java`
- `HrmApplication.java`
- `WebSocketConfig.java`
- `CalendarEventController.java`
- `CompanyRegistrationController.java`
- `ProfileImageController.java`

#### Services Updated
- `EmployeeService.java` - Uses configurable domain for profile image URLs

### Files Updated Summary

#### Frontend (42 files updated)
All hardcoded `http://localhost:8080` URLs replaced with `buildApiUrl()` calls:
- All component files in `src/components/`
- All page files in `src/pages/`
- Employee-related components
- Dashboard components
- Profile and attendance components

#### Backend (6 files updated)
- CORS configurations across multiple controllers
- Domain configuration in application.properties
- Service layer updated to use configurable domain

### Deployment Commands

#### Frontend
```bash
cd PirisaHR-main
npm run build
# Serve build files on http://129.212.239.12:5174
```

#### Backend
```bash
cd HRM-main
./mvnw clean package
java -jar target/HRM-0.0.1-SNAPSHOT.jar
# Backend runs on http://129.212.239.12:8080
```

### Verification Checklist

- [ ] Frontend production build uses correct API URL
- [ ] Backend CORS allows frontend domain
- [ ] All hardcoded URLs replaced with configurable ones
- [ ] Profile image URLs use correct domain
- [ ] WebSocket connections allowed from frontend
- [ ] Email links use correct domain
- [ ] Stripe webhook URLs configured correctly

### Notes

1. The frontend automatically uses the correct API URL based on environment
2. Development still works with localhost
3. Production uses the IP address 129.212.239.12
4. All URLs are now centrally configurable
