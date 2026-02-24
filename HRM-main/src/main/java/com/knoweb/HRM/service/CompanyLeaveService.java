package com.knoweb.HRM.service;

import com.knoweb.HRM.model.CompanyLeave;
import com.knoweb.HRM.model.Department;
import com.knoweb.HRM.repository.CompanyLeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyLeaveService {


    @Autowired
    private CompanyLeaveRepository companyLeaveRepository;

    public CompanyLeave createCompanyLeave(CompanyLeave companyLeave) {
        return companyLeaveRepository.save(companyLeave);
    }

    public List<CompanyLeave> getLeaveByCompanyId(long companyId) {
        return companyLeaveRepository.findByCompanyId(companyId);
    }
}
