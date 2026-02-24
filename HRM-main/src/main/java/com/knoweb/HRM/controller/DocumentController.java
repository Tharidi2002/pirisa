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
            @RequestParam("cv") MultipartFile cv,
            @RequestParam("birthCertificate") MultipartFile birthCertificate,
            @RequestParam("idCopy") MultipartFile idCopy,
            @RequestParam("policeReport") MultipartFile policeReport,
            @RequestParam("bankPassbook") MultipartFile bankPassbook,
            @RequestParam("photo") MultipartFile photo,
            @RequestParam("appointmentLetter") MultipartFile appointmentLetter
    ) {
        try {
            documentService.uploadAllDocuments(empId, cv, birthCertificate, idCopy, policeReport, bankPassbook, photo, appointmentLetter);
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
        byte[] data = documentService.viewDocumentByEmployeeId(employeeId, documentType);
        String filename = documentType;

        if (data != null) {
            ByteArrayResource resource = new ByteArrayResource(data);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(data.length)
                    .body(resource);
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

    @GetMapping("/{employeeId})")
    public ResponseEntity<Documents> getDocumentsByEmployeeId(@PathVariable Long employeeId) {
        Optional<Documents> documentOpt = documentService.getDocumentsByEmployeeId(employeeId);
        return documentOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
