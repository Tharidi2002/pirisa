package com.knoweb.HRM.service;

import com.knoweb.HRM.model.CompanyLogoes;
import com.knoweb.HRM.repository.CompanyLogoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class CompanyLogoService {

    @Autowired
    private CompanyLogoRepository companyLogoRepository;

    public byte[] viewLogo(Long cmpId) {
        CompanyLogoes logo = companyLogoRepository.findByCmpId(cmpId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No Logo found for this Company ID"));
        return logo.getLogo();
    }

    public CompanyLogoes uploadLogo(Long cmpId, MultipartFile logo) throws IOException {
        CompanyLogoes companyLogo = new CompanyLogoes();
        companyLogo.setCmpId(cmpId);
        if (logo != null && !logo.isEmpty()) {
            companyLogo.setLogo(logo.getBytes());
        }
        return companyLogoRepository.save(companyLogo);
    }
}
