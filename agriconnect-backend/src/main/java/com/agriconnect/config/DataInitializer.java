package com.agriconnect.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.agriconnect.entity.Role;
import com.agriconnect.entity.User;
import com.agriconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Logger logger =
            LoggerFactory.getLogger(DataInitializer.class);

    @Override
    public void run(String... args) throws Exception {

        User admin = userRepository.findByEmail("admin@agriconnect.com")
                .orElseGet(() -> User.builder()
                        .name("Admin")
                        .email("admin@agriconnect.com")
                        .phone("1234567890")
                        .role(Role.ADMIN)
                        .build());

        // Set / reset admin password
        admin.setPassword(passwordEncoder.encode("admin123"));

        // Make sure this account has ADMIN role
        admin.setRole(Role.ADMIN);

        // Make sure the account is active
        admin.setActive(true);

        // Save the admin account
        userRepository.save(admin);

        logger.info("Admin password updated successfully");
    }
}