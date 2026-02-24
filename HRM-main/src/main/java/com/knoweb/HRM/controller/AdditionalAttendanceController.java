package com.knoweb.HRM.controller;

import com.knoweb.HRM.model.AdditionalAttendance;
import com.knoweb.HRM.service.AdditionalAttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/additional-attendances") // Using a more RESTful endpoint
public class AdditionalAttendanceController {

    @Autowired
    private AdditionalAttendanceService additionalAttendanceService;

    @PostMapping
    public ResponseEntity<AdditionalAttendance> createAdditionalAttendance(@RequestBody AdditionalAttendance additionalAttendance) {
        AdditionalAttendance createdAttendance = additionalAttendanceService.createAdditionalAttendance(additionalAttendance);
        return new ResponseEntity<>(createdAttendance, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteAdditionalAttendance(@PathVariable Long id) {
        additionalAttendanceService.deleteAdditionalAttendance(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdditionalAttendance> updateAdditionalAttendance(@PathVariable Long id, @RequestBody AdditionalAttendance additionalAttendanceDetails) {
        AdditionalAttendance updatedAttendance = additionalAttendanceService.updateAdditionalAttendance(id, additionalAttendanceDetails);
        return ResponseEntity.ok(updatedAttendance);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdditionalAttendance> getAdditionalAttendanceById(@PathVariable Long id) {
        AdditionalAttendance additionalAttendance = additionalAttendanceService.getAdditionalAttendanceById(id);
        return ResponseEntity.ok(additionalAttendance);
    }
}
