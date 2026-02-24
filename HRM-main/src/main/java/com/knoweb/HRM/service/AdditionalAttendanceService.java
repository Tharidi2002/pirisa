package com.knoweb.HRM.service;

import com.knoweb.HRM.model.AdditionalAttendance;
import com.knoweb.HRM.repository.AdditionalAttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdditionalAttendanceService {

    @Autowired
    private AdditionalAttendanceRepository additionalAttendanceRepository;

    public AdditionalAttendance createAdditionalAttendance(AdditionalAttendance additionalAttendance) {
        return additionalAttendanceRepository.save(additionalAttendance);
    }

    public void deleteAdditionalAttendance(Long additionalAttendanceId) {
        additionalAttendanceRepository.deleteById(additionalAttendanceId);
    }

    public AdditionalAttendance updateAdditionalAttendance(Long additionalAttendanceId, AdditionalAttendance additionalAttendanceDetails) {
        AdditionalAttendance additionalAttendance = getAdditionalAttendanceById(additionalAttendanceId);
        if (additionalAttendance != null) {
            additionalAttendance.setTravelStart(additionalAttendanceDetails.getTravelStart());
            additionalAttendance.setTravelEnd(additionalAttendanceDetails.getTravelEnd());
            return additionalAttendanceRepository.save(additionalAttendance);
        }
        return null; // Or throw a ResourceNotFoundException
    }

    public AdditionalAttendance getAdditionalAttendanceById(Long additionalAttendanceId) {
        Optional<AdditionalAttendance> optionalAdditionalAttendance = additionalAttendanceRepository.findById(additionalAttendanceId);
        return optionalAdditionalAttendance.orElse(null); // Or throw a ResourceNotFoundException
    }
}
