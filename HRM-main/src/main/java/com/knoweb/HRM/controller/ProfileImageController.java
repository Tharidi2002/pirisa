package com.knoweb.HRM.controller;

import com.knoweb.HRM.dto.ProfileImageResponse;
import com.knoweb.HRM.model.Documents;
import com.knoweb.HRM.model.Employee;
import com.knoweb.HRM.repository.EmployeeRepository;
import com.knoweb.HRM.service.DocumentService;
import com.knoweb.HRM.util.ImageValidationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile-image")
@CrossOrigin(origins = "*")
public class ProfileImageController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @PostMapping(
            path = "/upload/{empId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> uploadProfileImage(
            @PathVariable Long empId,
            @RequestParam("profileImage") MultipartFile profileImage) {

        try {
            String validationError = ImageValidationUtil.validateImageFile(profileImage);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(ProfileImageResponse.error(validationError));
            }

            // Use the updated service method
            documentService.uploadAllDocuments(empId, null, null, null, null, null, profileImage, null);

            ProfileImageResponse response = ProfileImageResponse.success(
                "Profile image uploaded successfully!",
                empId,
                profileImage.getSize(),
                profileImage.getContentType()
            );

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ProfileImageResponse.error("Failed to process image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ProfileImageResponse.error("Error uploading profile image: " + e.getMessage()));
        }
    }

    @GetMapping(
            path = "/view/{empId}",
            produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE}
    )
    public ResponseEntity<ByteArrayResource> getProfileImage(@PathVariable Long empId) {
        try {
            byte[] imageData = documentService.viewDocumentByEmployeeId(empId, "photo");

            if (imageData == null || imageData.length == 0) {
                return ResponseEntity.notFound().build();
            }

            ByteArrayResource resource = new ByteArrayResource(imageData);
            HttpHeaders headers = new HttpHeaders();

            String contentType = ImageValidationUtil.getContentTypeFromBytes(imageData);
            headers.setContentType(MediaType.parseMediaType(contentType));

            headers.setContentDisposition(ContentDisposition
                    .inline()
                    .filename("profile_" + empId + ImageValidationUtil.getFileExtension(contentType))
                    .build());

            headers.setContentLength(imageData.length);

            return new ResponseEntity<>(resource, headers, HttpStatus.OK);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping(
            path = "/delete/{empId}"
    )
    public ResponseEntity<?> deleteProfileImage(@PathVariable Long empId) {
        try {
            Optional<Documents> existingDocsOpt = documentService.getDocumentsByEmployeeId(empId);

            if (!existingDocsOpt.isPresent() || existingDocsOpt.get().getPhoto() == null) {
                return ResponseEntity.badRequest().body(ProfileImageResponse.error("No profile image found for employee"));
            }

            Documents documents = existingDocsOpt.get();
            documents.setPhoto(null); // Remove photo
            documentService.saveOrUpdateDocument(documents); // Save changes

            return ResponseEntity.ok(ProfileImageResponse.success("Profile image deleted successfully!", empId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ProfileImageResponse.error("Error deleting profile image: " + e.getMessage()));
        }
    }

    @GetMapping(
            path = "/exists/{empId}"
    )
    public ResponseEntity<?> checkProfileImageExists(@PathVariable Long empId) {
        try {
            Optional<Documents> documentsOpt = documentService.getDocumentsByEmployeeId(empId);

            boolean hasImage = documentsOpt.isPresent() &&
                             documentsOpt.get().getPhoto() != null &&
                             documentsOpt.get().getPhoto().length > 0;

            ProfileImageResponse response = ProfileImageResponse.success("Profile image check completed", empId);
            response.setHasProfileImage(hasImage);

            if (hasImage) {
                response.setImageSize((long) documentsOpt.get().getPhoto().length);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ProfileImageResponse.error("Error checking profile image: " + e.getMessage()));
        }
    }
}
