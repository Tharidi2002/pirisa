package com.pirisa.hrm.controller;

import com.pirisa.hrm.service.CompanyLogoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/logo")
public class CompanyLogoController {

    @Autowired
    private CompanyLogoService companyLogoService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadLogo(
            @RequestParam("comId") long comId,
            @RequestParam("logo") MultipartFile logo) throws IOException {

        companyLogoService.uploadLogo(comId, logo);
        messagingTemplate.convertAndSend("/topic/company/" + comId, Map.of(
                "type", "COMPANY_LOGO_UPDATED",
                "companyId", comId,
                "timestamp", System.currentTimeMillis()
        ));
        return ResponseEntity.ok("Company Logo uploaded successfully!");
    }

    @GetMapping("/view/{comId}")
    public ResponseEntity<byte[]> viewLogo(@PathVariable("comId") Long comId) {
        byte[] logoData = companyLogoService.viewLogo(comId);
        if (logoData == null || logoData.length == 0) {
            // Return a default 1x1 transparent PNG instead of 404
            byte[] defaultLogo = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                // ... (1x1 transparent PNG bytes)
            };
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(defaultLogo);
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(logoData);
    }
}