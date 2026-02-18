package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Employee;
import com.knoweb.HRM.model.EmployeeLeave;
import com.knoweb.HRM.repository.EmployeeLeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmployeeLeaveRequestService {

    @Autowired
    private EmployeeLeaveRequestRepository employeeLeaveRequestRepository;

    public EmployeeLeave createEmployeeLeave(EmployeeLeave employeeLeave) {
        return employeeLeaveRequestRepository.save(employeeLeave);
    }

    public EmployeeLeave updateEmployeeLeave(Long empleave_id, EmployeeLeave updateEmployeeLeave) {
        EmployeeLeave employeeLeave = getEmployeeLeaveById(empleave_id);
        if (employeeLeave != null) {
            employeeLeave.setLeaveStatus(updateEmployeeLeave.getLeaveStatus());
            return employeeLeaveRequestRepository.save(employeeLeave);
        }
        return null;
    }

    public EmployeeLeave getEmployeeLeaveById(long id) {
        Optional<EmployeeLeave> optionalUser = employeeLeaveRequestRepository.findById(id);
        return optionalUser.orElse(null);
    }
}
