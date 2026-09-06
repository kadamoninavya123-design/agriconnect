package com.agriconnect.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agriconnect.dto.OfferRequest;
import com.agriconnect.dto.OfferResponse;
import com.agriconnect.service.OfferService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;


    // =========================================================
    // CREATE OFFER
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createOffer(
            @Valid @RequestBody OfferRequest request,
            Authentication authentication) {

        try {

            OfferResponse response =
                    offerService.createOffer(
                            request,
                            authentication);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));
        }
    }


    // =========================================================
    // GET OFFERS FOR ORDER
    // =========================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOffersForOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        try {

            List<OfferResponse> offers =
                    offerService.getOffersForOrder(
                            orderId,
                            authentication);

            return ResponseEntity.ok(offers);

        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));
        }
    }


    // =========================================================
    // ACCEPT OFFER
    // FARMER ONLY
    // =========================================================

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptOffer(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            OfferResponse response =
                    offerService.acceptOffer(
                            id,
                            authentication);

            return ResponseEntity.ok(response);

        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));
        }
    }


    // =========================================================
    // REJECT OFFER
    // FARMER ONLY
    // =========================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectOffer(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            OfferResponse response =
                    offerService.rejectOffer(
                            id,
                            authentication);

            return ResponseEntity.ok(response);

        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));
        }
    }


    // =========================================================
    // COUNTER OFFER
    // FARMER ONLY
    // =========================================================

    @PostMapping("/{id}/counter")
    public ResponseEntity<?> createCounterOffer(
            @PathVariable Long id,
            @Valid @RequestBody OfferRequest request,
            Authentication authentication) {

        try {

            OfferResponse response =
                    offerService.createCounterOffer(
                            id,
                            request,
                            authentication);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", true,
                            "message", e.getMessage()));
        }
    }
}