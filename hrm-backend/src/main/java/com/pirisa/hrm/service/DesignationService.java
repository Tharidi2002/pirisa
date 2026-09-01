package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Unit;
import com.pirisa.hrm.model.Designation;
import com.pirisa.hrm.repository.UnitRepository;
import com.pirisa.hrm.repository.DesignationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DesignationService {

    @Autowired
    private DesignationRepository designationRepository;

    public Designation createDesignation(Designation designation) {
        return designationRepository.save(designation);
    }

    public void deleteDesignation(Long designation_id) {
        try {
            if (!designationRepository.existsById(designation_id)) {
                throw new RuntimeException("Designation not found with id: " + designation_id);
            }
            designationRepository.deleteById(designation_id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete designation: " + e.getMessage(), e);
        }
    }

    public List<Designation> getDesignationsByDptId(long dptId) {
        return designationRepository.findByDptId(dptId);
    }
}
