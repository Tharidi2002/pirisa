package com.knoweb.HRM.service;

import com.knoweb.HRM.model.EmployeeLeave;
import com.knoweb.HRM.repository.EmployeeLeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeLeaveService {

    @Autowired
    private EmployeeLeaveRepository employeeLeaveRepository;

    public EmployeeLeave saveLeaveRequest(EmployeeLeave leaveRequest) {
        return employeeLeaveRepository.save(leaveRequest);
    }

    public List<EmployeeLeave> getAllLeaveRequests() {
        return employeeLeaveRepository.findAll();
    }

    public List<EmployeeLeave> getLeaveRequestsByEmployeeId(Long employeeId) {
        return employeeLeaveRepository.findByEmployeeId(employeeId);
    }

    public EmployeeLeave updateLeaveStatus(Long id, String status, String leaveReason) {
        EmployeeLeave leaveRequest = employeeLeaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        leaveRequest.setStatus(status);
        leaveRequest.setLeaveReason(leaveReason);

        return employeeLeaveRepository.save(leaveRequest);
    }
}
