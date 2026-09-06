package com.agriconnect.service;

import java.util.Collections;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.agriconnect.dto.AuthRequest;
import com.agriconnect.dto.AuthResponse;
import com.agriconnect.dto.RegisterRequest;
import com.agriconnect.entity.Role;
import com.agriconnect.entity.User;
import com.agriconnect.repository.UserRepository;
import com.agriconnect.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @Value("${google.client.id}")
    private String googleClientId;


    // =========================================================
    // NORMAL SIGNUP
    // =========================================================

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .role(request.getRole())
                .build();

        userRepository.save(user);

        return generateAuthResponse(user);
    }


    // =========================================================
    // NORMAL LOGIN
    // =========================================================

    public AuthResponse login(AuthRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        return generateAuthResponse(user);
    }


    // =========================================================
    // GOOGLE LOGIN / SIGNUP
    // =========================================================

    public AuthResponse googleLogin(
            String idTokenString,
            Role requestedRole) {

        try {

            // =====================================================
            // 1. CREATE GOOGLE TOKEN VERIFIER
            // =====================================================

            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(
                            new com.google.api.client.http.javanet.NetHttpTransport(),
                            new com.google.api.client.json.gson.GsonFactory()
                    )
                    .setAudience(
                            Collections.singletonList(
                                    googleClientId
                            )
                    )
                    .build();


            // =====================================================
            // 2. VERIFY GOOGLE ID TOKEN
            // =====================================================

            GoogleIdToken idToken =
                    verifier.verify(idTokenString);

            if (idToken == null) {

                throw new IllegalArgumentException(
                        "Invalid Google ID token"
                );
            }


            // =====================================================
            // 3. GET GOOGLE ACCOUNT INFORMATION
            // =====================================================

            GoogleIdToken.Payload payload =
                    idToken.getPayload();

            String googleId =
                    payload.getSubject();

            String email =
                    payload.getEmail();

            String name =
                    (String) payload.get("name");


            if (googleId == null || email == null) {

                throw new IllegalArgumentException(
                        "Google account information is missing"
                );
            }


            // =====================================================
            // 4. CHECK WHETHER GOOGLE ACCOUNT ALREADY EXISTS
            // =====================================================

            User user =
                    userRepository
                            .findByGoogleId(googleId)
                            .orElse(null);


            // =====================================================
            // EXISTING GOOGLE USER
            // =====================================================

            if (user != null) {

                return generateAuthResponse(user);
            }


            // =====================================================
            // 5. CHECK WHETHER EMAIL ALREADY EXISTS
            // =====================================================

            User existingUser =
                    userRepository
                            .findByEmail(email)
                            .orElse(null);


            // =====================================================
            // EXISTING NORMAL USER
            // =====================================================

            if (existingUser != null) {

                existingUser.setGoogleId(googleId);

                userRepository.save(existingUser);

                return generateAuthResponse(existingUser);
            }


            // =====================================================
            // 6. NEW GOOGLE USER
            // =====================================================

            if (requestedRole == null ||
                    requestedRole == Role.ADMIN) {

                throw new IllegalArgumentException(
                        "Account not registered. Please sign up first."
                );
            }


            // =====================================================
            // 7. CREATE NEW GOOGLE USER
            // =====================================================

            User newUser = User.builder()
                    .name(
                            name != null
                                    ? name
                                    : email
                    )
                    .email(email)
                    .password(
                            passwordEncoder.encode(
                                    UUID.randomUUID().toString()
                            )
                    )
                    .role(requestedRole)
                    .googleId(googleId)
                    .build();


            userRepository.save(newUser);


            // =====================================================
            // 8. LOGIN NEW GOOGLE USER
            // =====================================================

            return generateAuthResponse(newUser);

        }

        // =========================================================
        // HANDLE EXPECTED ERRORS
        // =========================================================

        catch (IllegalArgumentException e) {

            throw e;
        }

        // =========================================================
        // HANDLE OTHER GOOGLE ERRORS
        // =========================================================

        catch (Exception e) {

            e.printStackTrace();

            throw new IllegalArgumentException(
                    "Google authentication failed"
            );
        }
    }


    // =========================================================
    // GENERATE JWT RESPONSE
    // =========================================================

    private AuthResponse generateAuthResponse(User user) {

        UserDetails userDetails =
                userDetailsService
                        .loadUserByUsername(
                                user.getEmail()
                        );


        String token =
                jwtUtil.generateToken(
                        userDetails,
                        user.getRole().name()
                );


        return new AuthResponse(
                token,
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }


    // =========================================================
    // TEMPORARY ADMIN PASSWORD RESET
    // =========================================================

    public void resetAdminPassword(
            String email,
            String newPassword) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Admin account not found"
                        )
                );

        if (user.getRole() != Role.ADMIN) {

            throw new IllegalArgumentException(
                    "This account is not an ADMIN account"
            );
        }

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);
    }
}