package com.agriconnect.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agriconnect.entity.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryTrackingResponse {

    private Long orderId;

    private OrderStatus status;

    private Double deliveryLatitude;
    private Double deliveryLongitude;

    private Double currentLatitude;
    private Double currentLongitude;

    private LocalDate expectedDeliveryDate;

    private LocalDateTime estimatedArrivalTime;

    private LocalDateTime lastLocationUpdate;

    private LocalDateTime shippedAt;

    private LocalDateTime outForDeliveryAt;

    private LocalDateTime deliveredAt;
}