package com.agriconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.agriconnect.dto.DeliveryLocationRequest;
import com.agriconnect.dto.DeliveryTrackingResponse;
import com.agriconnect.service.DeliveryTrackingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class DeliveryTrackingController {

    private final DeliveryTrackingService deliveryTrackingService;

    @PutMapping("/{id}/tracking/location")
    public ResponseEntity<DeliveryTrackingResponse> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryLocationRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                deliveryTrackingService.updateLocation(
                        id,
                        request,
                        authentication
                )
        );
    }

    @GetMapping("/{id}/tracking")
    public ResponseEntity<DeliveryTrackingResponse> getTracking(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                deliveryTrackingService.getTracking(
                        id,
                        authentication
                )
        );
    }
}