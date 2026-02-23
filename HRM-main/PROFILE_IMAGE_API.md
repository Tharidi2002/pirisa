# Profile Image API Documentation

## Overview
This document describes the Profile Image API endpoints for managing employee profile images in the HRM system.

## Base URL
```
http://localhost:8080/api/profile-image
```

## Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## File Size Limit
- Maximum file size: 10MB

## API Endpoints

### 1. Upload/Update Profile Image
**Endpoint:** `POST /upload/{empId}`

**Description:** Upload a new profile image or update an existing one for an employee.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Path Parameters:
  - `empId` (Long): Employee ID
- Form Data:
  - `profileImage` (MultipartFile): Image file

**Response:**
```json
{
  "resultCode": 100,
  "resultDesc": "Profile image uploaded successfully!",
  "empId": 123,
  "imageSize": 1024000,
  "contentType": "image/jpeg"
}
```

**Error Response:**
```json
{
  "resultCode": 101,
  "resultDesc": "ERROR: File size must be less than 10MB"
}
```

**Example (cURL):**
```bash
curl -X POST \
  http://localhost:8080/api/profile-image/upload/123 \
  -H 'Content-Type: multipart/form-data' \
  -F 'profileImage=@/path/to/image.jpg'
```

### 2. View Profile Image
**Endpoint:** `GET /view/{empId}`

**Description:** Retrieve the profile image for an employee.

**Request:**
- Method: GET
- Path Parameters:
  - `empId` (Long): Employee ID

**Response:**
- Content-Type: image/jpeg, image/png, or image/gif
- Body: Binary image data
- Headers:
  - Content-Disposition: inline; filename="profile_123.jpg"
  - Content-Length: [image size in bytes]

**Example (cURL):**
```bash
curl -X GET \
  http://localhost:8080/api/profile-image/view/123 \
  --output profile_image.jpg
```

### 3. Delete Profile Image
**Endpoint:** `DELETE /delete/{empId}`

**Description:** Remove the profile image for an employee.

**Request:**
- Method: DELETE
- Path Parameters:
  - `empId` (Long): Employee ID

**Response:**
```json
{
  "resultCode": 100,
  "resultDesc": "Profile image deleted successfully!",
  "empId": 123
}
```

**Example (cURL):**
```bash
curl -X DELETE \
  http://localhost:8080/api/profile-image/delete/123
```

### 4. Check if Profile Image Exists
**Endpoint:** `GET /exists/{empId}`

**Description:** Check if an employee has a profile image.

**Request:**
- Method: GET
- Path Parameters:
  - `empId` (Long): Employee ID

**Response:**
```json
{
  "resultCode": 100,
  "resultDesc": "Profile image check completed",
  "empId": 123,
  "hasProfileImage": true,
  "imageSize": 1024000
}
```

**Example (cURL):**
```bash
curl -X GET \
  http://localhost:8080/api/profile-image/exists/123
```

## Error Codes

| Result Code | Description |
|-------------|-------------|
| 100 | Success |
| 101 | Error |

## Common Error Messages

1. **File Validation Errors:**
   - "Please select an image file"
   - "File size must be less than 10MB"
   - "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed"

2. **Employee/Document Errors:**
   - "Document not found"
   - "No profile image found for employee"

3. **System Errors:**
   - "Failed to process image: [error details]"
   - "Error uploading profile image: [error details]"

## Frontend Integration Examples

### JavaScript (Fetch API)
```javascript
// Upload profile image
async function uploadProfileImage(empId, file) {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  try {
    const response = await fetch(`/api/profile-image/upload/${empId}`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (result.resultCode === 100) {
      console.log('Upload successful:', result);
    } else {
      console.error('Upload failed:', result.resultDesc);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

// Get profile image URL
function getProfileImageUrl(empId) {
  return `/api/profile-image/view/${empId}`;
}

// Check if profile image exists
async function checkProfileImageExists(empId) {
  try {
    const response = await fetch(`/api/profile-image/exists/${empId}`);
    const result = await response.json();
    return result.hasProfileImage;
  } catch (error) {
    console.error('Error checking profile image:', error);
    return false;
  }
}

// Delete profile image
async function deleteProfileImage(empId) {
  try {
    const response = await fetch(`/api/profile-image/delete/${empId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    return result.resultCode === 100;
  } catch (error) {
    console.error('Error deleting profile image:', error);
    return false;
  }
}
```

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const ProfileImageUpload = ({ empId }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check if profile image exists and set URL
    checkProfileImageExists(empId).then(exists => {
      if (exists) {
        setImageUrl(`/api/profile-image/view/${empId}`);
      }
    });
  }, [empId]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      await uploadProfileImage(empId, file);
      setImageUrl(`/api/profile-image/view/${empId}?t=${Date.now()}`); // Add timestamp to prevent caching
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    await deleteProfileImage(empId);
    setImageUrl(null);
  };

  return (
    <div>
      <div>
        {imageUrl ? (
          <img src={imageUrl} alt="Profile" style={{ width: 150, height: 150, borderRadius: '50%' }} />
        ) : (
          <div style={{ width: 150, height: 150, borderRadius: '50%', backgroundColor: '#ccc' }} />
        )}
      </div>
      <div>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        {uploading && <span>Uploading...</span>}
      </div>
      {imageUrl && (
        <button onClick={handleDelete}>Remove Photo</button>
      )}
    </div>
  );
};
```

## Security Considerations

1. **File Type Validation:** Only allowed image formats are accepted
2. **File Size Limit:** Maximum 10MB to prevent storage abuse
3. **Content-Type Verification:** Server validates both file extension and actual content
4. **Employee Authentication:** Ensure proper authentication/authorization is implemented

## Database Schema

Profile images are stored in the `documents` table:
- Table: `documents`
- Column: `emp_photo` (LONGBLOB)
- Linked via: `emp_id` column

## Testing

Use the following test cases to verify the API:

1. **Upload Valid Image:** Test with JPEG, PNG, GIF, WebP files under 10MB
2. **Upload Invalid File:** Test with non-image files, large files, empty files
3. **View Image:** Test viewing existing and non-existing images
4. **Delete Image:** Test deleting existing and non-existing images
5. **Check Exists:** Test checking for existing and non-existing images
