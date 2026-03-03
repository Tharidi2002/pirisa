# Login Testing Guide

## Backend Changes Made

### LoginController.java
- Updated to support login with both username and email for all user types:
  - **Company**: Can login with `username` or `cmp_email`
  - **User**: Can login with `username` or `email`
  - **Employee**: Can login with `username` or `email`

### Frontend Changes Made
- **Login.tsx**: Updated form to indicate users can enter either username or email
- Added helpful placeholder text and instruction message

## How to Test

### 1. Start the Backend
```bash
cd F:\KnoWeb-office\testing-projects\Pirisa\HRM-main
mvn spring-boot:run
```

### 2. Start the Frontend
```bash
cd F:\KnoWeb-office\testing-projects\Pirisa\PirisaHR-main
npm start
```

### 3. Test Login Scenarios

#### Test Employee Login:
1. **Using Username**:
   - Enter: `employee_username`
   - Password: `employee_password`
   - Should login successfully

2. **Using Email**:
   - Enter: `employee@example.com`
   - Password: `employee_password`
   - Should login successfully

#### Test Company Login:
1. **Using Username**:
   - Enter: `company_username`
   - Password: `company_password`
   - Should login successfully

2. **Using Email**:
   - Enter: `company@example.com`
   - Password: `company_password`
   - Should login successfully

#### Test User Login:
1. **Using Username**:
   - Enter: `user_username`
   - Password: `user_password`
   - Should login successfully

2. **Using Email**:
   - Enter: `user@example.com`
   - Password: `user_password`
   - Should login successfully

### 4. API Testing with curl

#### Test Employee Login with Username:
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "employee_username",
    "password": "employee_password"
  }'
```

#### Test Employee Login with Email:
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "employee@example.com",
    "password": "employee_password"
  }'
```

## Expected Response Format

### Successful Login:
```json
{
  "response": {
    "resultCode": 100,
    "resultDesc": "Login Successfull"
  },
  "details": {
    "username": "username_or_email",
    "Role": "EMPLOYEE",
    "CMPNY_Id": 1,
    "EMP_id": 123,
    "token": "jwt_token_here"
  }
}
```

### Failed Login:
```json
{
  "response": {
    "resultCode": 101,
    "resultDesc": "Invalid Login"
  },
  "details": "Invalid username/email or password"
}
```

## Console Logs

The backend will log successful login attempts:
```
Company login successful - Username/Email: company@example.com
User login successful - Username/Email: user@example.com
Employee login successful - Username/Email: employee@example.com
```

## Database Requirements

Ensure your database has users with the following fields:
- **Employee**: `username`, `email`, `password`
- **Company**: `username`, `cmp_email`, `cmp_password`
- **User**: `username`, `email`, `password`

## Security Notes

- Passwords are encrypted using BCrypt
- JWT tokens are generated for successful logins
- Login attempts are logged for debugging
- Error messages are generic to prevent user enumeration

## Troubleshooting

1. **Login not working with email**:
   - Check if email exists in database
   - Verify email field names match repository methods
   - Check console logs for debugging

2. **Password mismatch**:
   - Ensure password is properly hashed in database
   - Verify BCrypt encoding is working

3. **Token generation issues**:
   - Check JWT secret configuration
   - Verify token expiration settings

4. **Frontend not updating**:
   - Clear browser cache
   - Check network tab for API calls
   - Verify response handling in frontend
