package com.knoweb.HRM.service;

import com.knoweb.HRM.model.Allowance;
import com.knoweb.HRM.model.CompanyLeave;
import com.knoweb.HRM.repository.AllowanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AllowanceService {

    @Autowired
    private AllowanceRepository allowanceRepository;

    public Allowance createAllowance(Allowance allowance) {
        return allowanceRepository.save(allowance);
    }


    public List<Allowance> getAllowanceByCompanyId(long companyId) {
        return allowanceRepository.findByCompanyId(companyId);
    }
}
