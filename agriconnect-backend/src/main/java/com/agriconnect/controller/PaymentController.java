package com.agriconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agriconnect.entity.Order;
import com.agriconnect.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;


    // =========================================================
    // ONLINE PAYMENT
    // =========================================================

    @PostMapping("/{orderId}/pay")
    public ResponseEntity<Order> payOrder(

            @PathVariable Long orderId,

            Authentication authentication) {

        return ResponseEntity.ok(
                paymentService.payOrder(
                        orderId,
                        authentication
                )
        );
    }
}