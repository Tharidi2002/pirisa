package com.pirisa.hrm.service;

import com.pirisa.hrm.config.SecurityConfig;
import com.pirisa.hrm.model.User;
import com.pirisa.hrm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityConfig securityConfig;


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public long getUserCount(){ return userRepository.count();}


    public User updateUser(Long user_id, User updateUser) {
        User user = getUserById(user_id);
        if (user != null) {
            user.setName(updateUser.getName());
            user.setUsername(updateUser.getUsername());
            user.setRole(updateUser.getRole());
            return userRepository.save(user);
        }
        return null;
    }

    public User getUserById(Long user_id) {
        Optional<User> optionalUser = userRepository.findById(user_id);
        return optionalUser.orElse(null);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User updateCurrentUserProfile(String username, String name, String email) {
        User user = userRepository.findByUsername(username);
        if (user == null) return null;

        user.setName(name.trim());
        user.setEmail(email.trim());
        return userRepository.save(user);
    }


    public User changeUserPassword(Long user_id, String oldPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findById(user_id);
        if (!userOptional.isPresent()) {
            return null;
        }
        User user = userOptional.get();
        // Verify if the provided old password matches the stored password.
        if (!securityConfig.passwordEncoder().matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        // Encrypt the new password using BCrypt and update the company.
        String hashedPassword = securityConfig.passwordEncoder().encode(newPassword);
        user.setPassword(hashedPassword);
        return userRepository.save(user);
    }


    public List<User> getUsersByCompanyId(long cmpId) {
        return userRepository.findByCmpId(cmpId);
    }


}
