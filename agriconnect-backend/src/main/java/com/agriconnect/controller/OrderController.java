package com.agriconnect.controller;

import com.agriconnect.dto.OrderRequest;
import com.agriconnect.dto.OrderResponse;
import com.agriconnect.dto.OrderStatusUpdateRequest;
import com.agriconnect.service.OrderService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;


    // =========================================================
    // PLACE ORDER
    // =========================================================

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.placeOrder(
                        request,
                        authentication));
    }


    // =========================================================
    // BUSINESSMAN - MY ORDERS
    // =========================================================

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> myOrders(
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.getMyOrders(
                        authentication));
    }


    // =========================================================
    // FARMER - MY ORDERS
    // =========================================================

    @GetMapping("/for-my-produce")
    public ResponseEntity<List<OrderResponse>>
    ordersForMyProduce(
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.getOrdersForMyProduce(
                        authentication));
    }


    // =========================================================
    // BUSINESSMAN STATS
    // =========================================================

    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Object>>
    getMyStats(
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.getMyStats(
                        authentication));
    }


    // =========================================================
    // FARMER STATS
    // =========================================================

    @GetMapping("/farmer-stats")
    public ResponseEntity<Map<String, Object>>
    getFarmerStats(
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.getFarmerStats(
                        authentication));
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,

            @Valid
            @RequestBody
            OrderStatusUpdateRequest request,

            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.updateStatus(
                        id,
                        request,
                        authentication));
    }


    // =========================================================
    // GET OFFERS
    // =========================================================

    @GetMapping("/{id}/offers")
    public ResponseEntity<?> getOffersForOrder(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            return ResponseEntity.ok(
                    orderService.getOffersForOrder(
                            id,
                            authentication));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // CAN NEGOTIATE
    // =========================================================

    @GetMapping("/{id}/can-negotiate")
    public ResponseEntity<?> canNegotiate(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            boolean canNegotiate =
                    orderService.canNegotiate(
                            id,
                            authentication);


            return ResponseEntity.ok(
                    Map.of(
                            "canNegotiate",
                            canNegotiate));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(e.getMessage());
        }
    }
}