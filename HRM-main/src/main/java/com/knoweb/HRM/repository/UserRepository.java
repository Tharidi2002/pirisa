package com.knoweb.HRM.repository;

import com.knoweb.HRM.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByUsername(String username);


    List<User> findByCmpId(long cmpId);
}
