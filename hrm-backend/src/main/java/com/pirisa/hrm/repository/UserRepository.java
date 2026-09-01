package com.pirisa.hrm.repository;

import com.pirisa.hrm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByUsername(String username);

    User findByEmail(String email);

    List<User> findByCmpId(long cmpId);
}
