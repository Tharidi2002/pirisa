package com.knoweb.HRM.service;

import com.knoweb.HRM.exception.ResourceNotFoundException;
import com.knoweb.HRM.model.Documents;
import com.knoweb.HRM.model.Employee;
import com.knoweb.HRM.repository.DocumentRepository;
import com.knoweb.HRM.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private EmployeeRepository employeeRepository; // Inject EmployeeRepository

    public Documents uploadAllDocuments(
            Long empId,
            MultipartFile cv,
            MultipartFile birthCertificate,
            MultipartFile idCopy,
            MultipartFile policeReport,
            MultipartFile bankPassbook,
            MultipartFile photo,
            MultipartFile appointmentLetter) throws IOException {

        // Find the employee first
        Employee employee = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));

        // Check if documents already exist for this employee
        Optional<Documents> existingDocsOpt = documentRepository.findByEmployee(employee);
        Documents document = existingDocsOpt.orElse(new Documents());
        document.setEmployee(employee); // Set the employee relationship

        // Update fields with new file data if provided
        if (cv != null && !cv.isEmpty()) document.setCv(cv.getBytes());
        if (birthCertificate != null && !birthCertificate.isEmpty()) document.setBirthCertificate(birthCertificate.getBytes());
        if (idCopy != null && !idCopy.isEmpty()) document.setIdCopy(idCopy.getBytes());
        if (policeReport != null && !policeReport.isEmpty()) document.setPoliceReport(policeReport.getBytes());
        if (bankPassbook != null && !bankPassbook.isEmpty()) document.setBankPassbook(bankPassbook.getBytes());
        if (appointmentLetter != null && !appointmentLetter.isEmpty()) document.setAppointmentLetter(appointmentLetter.getBytes());
        if (photo != null && !photo.isEmpty()) document.setPhoto(photo.getBytes());

        return documentRepository.save(document);
    }

    // View a specific document by field name using employee ID
    public byte[] viewDocumentByEmployeeId(Long empId, String fieldName) {
        Employee employee = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));
        Documents document = documentRepository.findByEmployee(employee)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "employeeId", empId));

        switch (fieldName) {
            case "cv": return document.getCv();
            case "birthCertificate": return document.getBirthCertificate();
            case "idCopy": return document.getIdCopy();
            case "policeReport": return document.getPoliceReport();
            case "bankPassbook": return document.getBankPassbook();
            case "appointmentLetter": return document.getAppointmentLetter();
            case "photo": return document.getPhoto();
            default: throw new IllegalArgumentException("Invalid field name: " + fieldName);
        }
    }

    public void deleteDocumentsByEmployeeId(Long empId) {
        Employee employee = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", empId));
        documentRepository.findByEmployee(employee).ifPresent(document -> {
            documentRepository.deleteById(document.getId());
        });
    }

    public Optional<Documents> getDocumentsByEmployeeId(long empId) {
         Employee employee = employeeRepository.findById(empId).orElse(null);
         if (employee == null) {
            return Optional.empty();
         }
        return documentRepository.findByEmployee(employee);
    }

    public Documents saveOrUpdateDocument(Documents documents) {
        if (documents.getEmployee() == null || documents.getEmployee().getId() == 0) {
            throw new IllegalArgumentException("Document must be associated with an employee.");
        }
        return documentRepository.save(documents);
    }
}
