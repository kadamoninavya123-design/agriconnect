package com.agriconnect.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.agriconnect.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // AUTHENTICATION PROVIDER
    // =========================================================

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {

        return config.getAuthenticationManager();
    }

    // =========================================================
    // CORS
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:3000"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                // =====================================================
                // CSRF
                // =====================================================

                .csrf(csrf -> csrf.disable())

                // =====================================================
                // CORS
                // =====================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // =====================================================
                // AUTHORIZATION
                // =====================================================

                .authorizeHttpRequests(auth -> auth

                        // =================================================
                        // PUBLIC AUTH
                        // =================================================

                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // =================================================
                        // PUBLIC PRODUCT BROWSING
                        // =================================================

                        .requestMatchers(
                                "/api/produce/browse/**"
                        ).permitAll()

                        // =================================================
                        // PUBLIC MARKET PRICES
                        // =================================================

                        .requestMatchers(
                                "/api/market-prices/**"
                        ).permitAll()

                        // =================================================
                        // PRODUCE - FARMER / ADMIN
                        // =================================================

                        .requestMatchers(
                                "/api/produce/my-stats"
                        ).hasAnyRole(
                                "FARMER",
                                "ADMIN"
                        )

                        .requestMatchers(
                                "/api/produce/**"
                        ).hasAnyRole(
                                "FARMER",
                                "ADMIN"
                        )

                        // =================================================
                        // FARMER ORDER LIST
                        // =================================================

                        .requestMatchers(
                                "/api/orders/for-my-produce",
                                "/api/orders/farmer-stats"
                        ).hasAnyRole(
                                "FARMER",
                                "ADMIN"
                        )

                        // =================================================
                        // ORDER STATUS
                        // =================================================

                        .requestMatchers(
                                "/api/orders/*/status"
                        ).hasAnyRole(
                                "FARMER",
                                "BUSINESS",
                                "ADMIN"
                        )

                        // =================================================
                        // ORDER TRACKING VIEW
                        // =================================================

                        .requestMatchers(
                                "/api/orders/*/tracking"
                        ).hasAnyRole(
                                "FARMER",
                                "BUSINESS",
                                "ADMIN"
                        )

                        // =================================================
                        // GPS LOCATION UPDATE
                        // =================================================

                        .requestMatchers(
                                "/api/orders/*/tracking/location"
                        ).hasAnyRole(
                                "FARMER",
                                "ADMIN"
                        )

                        // =================================================
                        // ORDER OFFERS
                        // =================================================

                        .requestMatchers(
                                "/api/orders/*/offers",
                                "/api/offers/**"
                        ).hasAnyRole(
                                "FARMER",
                                "BUSINESS",
                                "ADMIN"
                        )

                        // =================================================
                        // NEGOTIATION
                        // =================================================

                        .requestMatchers(
                                "/api/orders/*/can-negotiate"
                        ).hasAnyRole(
                                "FARMER",
                                "BUSINESS",
                                "ADMIN"
                        )

                        // =================================================
                        // BUSINESSMAN STATS
                        // =================================================

                        .requestMatchers(
                                "/api/orders/my-stats"
                        ).hasAnyRole(
                                "BUSINESS",
                                "ADMIN"
                        )

                        // =================================================
                        // BUSINESSMAN MY ORDERS
                        // =================================================

                        .requestMatchers(
                                "/api/orders/my-orders"
                        ).hasAnyRole(
                                "BUSINESS",
                                "ADMIN"
                        )

                        // =================================================
                        // PLACE ORDER
                        // =================================================

                        .requestMatchers(
                                "/api/orders"
                        ).hasAnyRole(
                                "BUSINESS",
                                "ADMIN"
                        )

                        // =================================================
                        // ADMIN STATS
                        // =================================================

                        .requestMatchers(
                                "/api/admin/stats"
                        ).hasRole("ADMIN")

                        // =================================================
                        // ADMIN
                        // =================================================

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // =================================================
                        // CHAT
                        // =================================================

                        .requestMatchers(
                                "/api/chat/**"
                        ).authenticated()

                        // =================================================
                        // FALLBACK
                        // =================================================

                        .anyRequest().authenticated()
                )

                // =====================================================
                // STATELESS SESSION
                // =====================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =====================================================
                // AUTHENTICATION PROVIDER
                // =====================================================

                .authenticationProvider(
                        authenticationProvider()
                )

                // =====================================================
                // JWT FILTER
                // =====================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}