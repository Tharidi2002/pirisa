package com.pirisa.hrm.service;

import com.pirisa.hrm.dto.CompanyRegistrationRequest;
import com.pirisa.hrm.model.Company;
import com.pirisa.hrm.model.User;
import com.pirisa.hrm.repository.CompanyRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CompanyRegistrationService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void registerCompany(CompanyRegistrationRequest request) {
        String companyName = request.getCmpName().trim();
        String username = request.getUsername().trim();
        String email = request.getCmpEmail().trim();

        if (companyRepository.findByName(companyName) != null) {
            throw new IllegalArgumentException("Company name already exists");
        }
        if (companyRepository.findByUsername(username) != null
                || userRepository.findByUsername(username) != null
                || employeeRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (companyRepository.findByCmpEmail(email) != null
                || userRepository.findByEmail(email) != null
                || employeeRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        Company company = new Company();
        company.setCmp_name(companyName);
        company.setCmpEmail(email);
        company.setCmp_phone(request.getCmpPhone().trim());
        company.setCmp_address(request.getCmpAddress().trim());
        company.setUsername(username);
        company.setCmp_password(passwordEncoder.encode(request.getPassword()));
        company.setCompany_status("ACTIVE");
        Company savedCompany = companyRepository.save(company);

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("CMPNY");
        user.setCmpId(savedCompany.getId());
        userRepository.save(user);

    }

    public boolean isUsernameAvailable(String username) {
        return companyRepository.findByUsername(username) == null
                && userRepository.findByUsername(username) == null
                && !employeeRepository.existsByUsernameIgnoreCase(username);
    }

    public boolean isEmailAvailable(String email) {
        return companyRepository.findByCmpEmail(email) == null
                && userRepository.findByEmail(email) == null
                && !employeeRepository.existsByEmailIgnoreCase(email);
    }
}
