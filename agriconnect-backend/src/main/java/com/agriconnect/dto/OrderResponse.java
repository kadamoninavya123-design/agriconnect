package com.agriconnect.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agriconnect.entity.OrderStatus;
import com.agriconnect.entity.PaymentMethod;
import com.agriconnect.entity.PaymentStatus;
import com.agriconnect.entity.PaymentTiming;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderResponse {

    private Long id;

    private String produceName;

    private Double quantityOrdered;

    private Double totalPrice;

    private OrderStatus status;

    private String businessmanName;

    private String farmerName;

    private LocalDateTime createdAt;

    private LocalDate expectedDeliveryDate;

    private Double deliveryLatitude;

    private Double deliveryLongitude;

    private Double currentLatitude;

    private Double currentLongitude;

    private LocalDateTime lastLocationUpdate;

    private LocalDateTime shippedAt;

    private LocalDateTime outForDeliveryAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime estimatedArrivalTime;

    // PAYMENT
    private PaymentMethod paymentMethod;

    private PaymentTiming paymentTiming;

    private PaymentStatus paymentStatus;

    private String paymentTransactionId;

    private LocalDateTime paidAt;


    public OrderResponse(

            Long id,
            String produceName,
            Double quantityOrdered,
            Double totalPrice,
            OrderStatus status,
            String businessmanName,
            String farmerName,
            LocalDateTime createdAt,
            LocalDate expectedDeliveryDate,
            Double deliveryLatitude,
            Double deliveryLongitude,
            Double currentLatitude,
            Double currentLongitude,
            LocalDateTime lastLocationUpdate,
            LocalDateTime shippedAt,
            LocalDateTime outForDeliveryAt,
            LocalDateTime deliveredAt,
            LocalDateTime estimatedArrivalTime,
            PaymentMethod paymentMethod,
            PaymentTiming paymentTiming,
            PaymentStatus paymentStatus,
            String paymentTransactionId,
            LocalDateTime paidAt) {

        this.id = id;
        this.produceName = produceName;
        this.quantityOrdered = quantityOrdered;
        this.totalPrice = totalPrice;
        this.status = status;
        this.businessmanName = businessmanName;
        this.farmerName = farmerName;
        this.createdAt = createdAt;
        this.expectedDeliveryDate = expectedDeliveryDate;

        this.deliveryLatitude = deliveryLatitude;
        this.deliveryLongitude = deliveryLongitude;

        this.currentLatitude = currentLatitude;
        this.currentLongitude = currentLongitude;

        this.lastLocationUpdate = lastLocationUpdate;
        this.shippedAt = shippedAt;
        this.outForDeliveryAt = outForDeliveryAt;
        this.deliveredAt = deliveredAt;
        this.estimatedArrivalTime = estimatedArrivalTime;

        this.paymentMethod = paymentMethod;
        this.paymentTiming = paymentTiming;
        this.paymentStatus = paymentStatus;
        this.paymentTransactionId = paymentTransactionId;
        this.paidAt = paidAt;
    }
}