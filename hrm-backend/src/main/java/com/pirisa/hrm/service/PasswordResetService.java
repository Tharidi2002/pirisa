package com.pirisa.hrm.service;

import com.pirisa.hrm.model.Company;
import com.pirisa.hrm.model.Employee;
import com.pirisa.hrm.model.User;
import com.pirisa.hrm.repository.CompanyRepository;
import com.pirisa.hrm.repository.EmployeeRepository;
import com.pirisa.hrm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private CompanyRepository companyRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private EmployeeRepository empRepo;
    @Autowired private BCryptPasswordEncoder passwordEncoder;
    @Autowired private EmailService emailService;

    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String msg) { super(msg); }
    }

    public static class DeliveryException extends RuntimeException {
        public DeliveryException(String msg) { super(msg); }
    }

    @Transactional
    public void resetPasswordForIdentifier(String identifier) {
        Company company = companyRepo.findByUsername(identifier);
        User user = userRepo.findByUsername(identifier);
        Employee employee = empRepo.findByUsername(identifier);

        String email = company != null ? company.getCmpEmail()
                : user != null ? user.getEmail()
                : employee != null ? employee.getEmail()
                : null;
        if (email == null || email.trim().isEmpty()) {
            resetPasswordForEmail(identifier);
            return;
        }

        resetPasswordForEmail(email.trim());
    }

    @Transactional
    public void resetPasswordForEmail(String email) {
        Company c = companyRepo.findByCmpEmail(email);
        User u = userRepo.findByEmail(email);
        Employee e = empRepo.findByEmail(email);

        if (c == null && u == null && e == null) {
            throw new NotFoundException("No account found for the provided email");
        }

        String plain = UUID.randomUUID().toString().substring(0, 8);
        String hashed = passwordEncoder.encode(plain);
        boolean emailSent;
        try {
            emailSent = emailService.sendEmail(
                    email,
                    "Password Reset Request",
                    "<p>Your password reset was requested.</p>"
                            + "<p>Your temporary password is: <strong>" + plain + "</strong></p>"
                            + "<p>Please log in and change it as soon as possible.</p>");
        } catch (RuntimeException exception) {
            throw new DeliveryException("Password reset email could not be sent. Your password was not changed.");
        }
        if (!emailSent) {
            throw new DeliveryException("Password reset email could not be sent. Your password was not changed.");
        }

        if (c != null) {
            c.setCmp_password(hashed);
            companyRepo.save(c);
        }
        if (u != null) {
            u.setPassword(hashed);
            userRepo.save(u);
        }
        if (e != null) {
            e.setPassword(hashed);
            empRepo.save(e);
        }

    }
}
