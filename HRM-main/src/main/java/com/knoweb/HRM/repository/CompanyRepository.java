package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Company findByUsername(String username);

   // Company findByCmp_email(String cmpEmail);

    Company findByCmpEmail(String cmpEmail);

    Company findByStripeCustomerId(String stripeCustomerId);
}
