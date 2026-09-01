package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.Email;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailRepository extends JpaRepository<Email, Long> {
}
