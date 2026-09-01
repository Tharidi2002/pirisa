package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Unit;
import com.pirisa.hrm.repository.DesignationRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.repository.UnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UnitService {

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DesignationRepository designationRepository;

    public Unit createUnit(Unit unit) {
        return unitRepository.save(unit);
    }

    public List<Unit> getUnitsByCompanyId(long cmpId) {
        return unitRepository.findByCmpId(cmpId);
    }

    public Unit updateUnit(Unit unit) {
        Optional<Unit> existingDept = unitRepository.findById(unit.getId());
        if (existingDept.isPresent()) {
            Unit dept = existingDept.get();
            dept.setDptName(unit.getDptName());
            dept.setDptCode(unit.getDptCode());
            dept.setDptDesc(unit.getDptDesc());
            return unitRepository.save(dept);
        }
        return null;
    }

    @Transactional
    public void deleteUnit(Long dpt_id) {
        try {
            if (!unitRepository.existsById(dpt_id)) {
                throw new RuntimeException("Unit not found with id: " + dpt_id);
            }

            long employeeCount = employeeRepository.countByDepartmentId(dpt_id);
            if (employeeCount > 0) {
                throw new RuntimeException("Cannot delete department because it has " + employeeCount + " employee(s) assigned to it.");
            }

            long designationCount = designationRepository.countByDepartmentId(dpt_id);
            if (designationCount > 0) {
                designationRepository.deleteByDepartmentId(dpt_id);
            }

            unitRepository.deleteById(dpt_id);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete unit: " + e.getMessage(), e);
        }
    }

    public List<Unit> searchUnits(long cmpId, String query) {
        List<Unit> allDepts = unitRepository.findByCmpId(cmpId);
        String lowercaseQuery = query.toLowerCase();
        
        return allDepts.stream()
                .filter(dept -> 
                    dept.getDptName().toLowerCase().contains(lowercaseQuery) ||
                    dept.getDptCode().toLowerCase().contains(lowercaseQuery) ||
                    (dept.getDptDesc() != null && dept.getDptDesc().toLowerCase().contains(lowercaseQuery))
                )
                .collect(java.util.stream.Collectors.toList());
    }
}
