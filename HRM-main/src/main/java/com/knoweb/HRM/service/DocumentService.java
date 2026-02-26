package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Documents;
import com.knoweb.HRM.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    public Documents uploadAllDocuments(
            Long empId,
            MultipartFile cv,
            MultipartFile birthCertificate,
            MultipartFile idCopy,
            MultipartFile policeReport,
            MultipartFile bankPassbook,
            MultipartFile photo,
            MultipartFile appointmentLetter) throws IOException {

        Documents document = new Documents();
        document.setEmpId(empId);

        if (cv != null && !cv.isEmpty()) {
            document.setCv(cv.getBytes());
        }
        if (birthCertificate != null && !birthCertificate.isEmpty()) {
            document.setBirthCertificate(birthCertificate.getBytes());
        }
        if (idCopy != null && !idCopy.isEmpty()) {
            document.setIdCopy(idCopy.getBytes());
        }
        if (policeReport != null && !policeReport.isEmpty()) {
            document.setPoliceReport(policeReport.getBytes());
        }
        if (bankPassbook != null && !bankPassbook.isEmpty()) {
            document.setBankPassbook(bankPassbook.getBytes());
        }
        if (appointmentLetter != null && !appointmentLetter.isEmpty()) {
            document.setAppointmentLetter(appointmentLetter.getBytes());
        }
        if (photo != null && !photo.isEmpty()) {
            document.setPhoto(photo.getBytes());
        }

        return documentRepository.save(document);
    }

    // View a specific document by field name
    public byte[] viewDocument(Long docId, String fieldName) {
        Documents document = documentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        switch (fieldName) {
            case "cv":
                return document.getCv();
            case "birthCertificate":
                return document.getBirthCertificate();
            case "idCopy":
                return document.getIdCopy();
            case "policeReport":
                return document.getPoliceReport();
            case "bankPassbook":
                return document.getBankPassbook();
            case "appointmentLetter":
                return document.getAppointmentLetter();
            case "photo":
                return document.getPhoto();
            default:
                throw new IllegalArgumentException("Invalid field name: " + fieldName);
        }
    }

    public byte[] viewDocument1(Long empId, String fieldName) {
        Optional<Documents> documentOpt = documentRepository.findByempId(empId);
        
        if (!documentOpt.isPresent()) {
            return null; // Return null instead of throwing exception
        }
        
        Documents document = documentOpt.get();

        switch (fieldName) {
            case "cv":
                return document.getCv();
            case "birthCertificate":
                return document.getBirthCertificate();
            case "idCopy":
                return document.getIdCopy();
            case "policeReport":
                return document.getPoliceReport();
            case "bankPassbook":
                return document.getBankPassbook();
            case "appointmentLetter":
                return document.getAppointmentLetter();
            case "photo":
                return document.getPhoto();
            default:
                throw new IllegalArgumentException("Invalid field name: " + fieldName);
        }
    }

    public void deleteDocuments(Long doc_id) {
        documentRepository.deleteById(doc_id);
    }


    public Optional<Documents> getDocumentsByempId(long emp_id) {
        //logger.info("Fetching documents by empId {}", emp_id);
        return documentRepository.findByempId(emp_id);
    }

    public Documents updateDocument(Documents documents) {
        return documentRepository.save(documents);
    }
}
