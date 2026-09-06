package com.agriconnect.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.agriconnect.dto.AuthRequest;
import com.agriconnect.dto.AuthResponse;
import com.agriconnect.dto.GoogleAuthRequest;
import com.agriconnect.dto.RegisterRequest;
import com.agriconnect.entity.Role;
import com.agriconnect.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


    // =========================================================
    // NORMAL SIGNUP
    // =========================================================

    @PostMapping("/signup")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        try {

            AuthResponse response =
                    authService.register(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // NORMAL LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody AuthRequest request) {

        try {

            AuthResponse response =
                    authService.login(request);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }


    // =========================================================
    // GOOGLE LOGIN
    // =========================================================

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(
            @Valid @RequestBody GoogleAuthRequest request) {

        try {

            Role role = null;

            if (request.getRole() != null &&
                    !request.getRole().trim().isEmpty()) {

                role = Role.valueOf(
                        request.getRole().toUpperCase()
                );
            }

            AuthResponse response =
                    authService.googleLogin(
                            request.getIdToken(),
                            role
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Google authentication failed");
        }
    }


    // =========================================================
    // TEMPORARY ADMIN PASSWORD RESET
    // =========================================================

    @PostMapping("/reset-admin")
    public ResponseEntity<?> resetAdminPassword(
            @RequestParam String email,
            @RequestParam String password) {

        try {

            authService.resetAdminPassword(
                    email,
                    password
            );

            return ResponseEntity.ok(
                    "Admin password reset successfully"
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}