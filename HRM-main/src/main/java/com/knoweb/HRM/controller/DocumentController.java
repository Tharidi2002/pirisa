package com.knoweb.HRM.controller;

import com.knoweb.HRM.model.Documents;
import com.knoweb.HRM.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload/{empId})")
    public ResponseEntity<String> uploadDocument(
            @PathVariable Long empId,
            @RequestParam("photo") MultipartFile photo,
            @RequestParam("cv") MultipartFile cv,
            @RequestParam("nic") MultipartFile nic,
            @RequestParam("serviceLetter") MultipartFile serviceLetter
    ) {
        try {
            documentService.uploadAllDocuments(empId, photo, cv, nic, serviceLetter);
            return ResponseEntity.ok("Documents uploaded successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload documents.");
        }
    }

    @GetMapping("/{employeeId}/document")
    public ResponseEntity<ByteArrayResource> viewDocumentByEmployeeId(
            @PathVariable Long employeeId,
            @RequestParam String documentType
    ) {
        Optional<Documents> documentOpt = documentService.getDocumentsByEmployeeId(employeeId);

        if (documentOpt.isPresent()) {
            Documents document = documentOpt.get();
            byte[] data = null;
            String filename = "";

            switch (documentType.toLowerCase()) {
                case "photo":
                    data = document.getPhoto();
                    filename = "photo.jpg";
                    break;
                case "cv":
                    data = document.getCv();
                    filename = "cv.pdf";
                    break;
                case "nic":
                    data = document.getNic();
                    filename = "nic.pdf";
                    break;
                case "serviceletter":
                    data = document.getServiceLetter();
                    filename = "service_letter.pdf";
                    break;
            }

            if (data != null) {
                ByteArrayResource resource = new ByteArrayResource(data);
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .contentLength(data.length)
                        .body(resource);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{employeeId})")
    public ResponseEntity<String> deleteDocumentsByEmployeeId(@PathVariable Long employeeId) {
        try {
            documentService.deleteDocumentsByEmployeeId(employeeId);
            return ResponseEntity.ok("Documents deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete documents.");
        }
    }

    @PutMapping("/update/{employeeId})")
    public ResponseEntity<String> updateDocument(
            @PathVariable Long employeeId,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "cv", required = false) MultipartFile cv,
            @RequestParam(value = "nic", required = false) MultipartFile nic,
            @RequestParam(value = "serviceLetter", required = false) MultipartFile serviceLetter
    ) {
        try {
            documentService.updateDocument(employeeId, photo, cv, nic, serviceLetter);
            return ResponseEntity.ok("Document updated successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update document.");
        }
    }

    @GetMapping("/{employeeId})")
    public ResponseEntity<Documents> getDocumentsByEmployeeId(@PathVariable Long employeeId) {
        Optional<Documents> documentOpt = documentService.getDocumentsByEmployeeId(employeeId);
        return documentOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
