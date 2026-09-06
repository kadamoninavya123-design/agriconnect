package com.agriconnect.dto;

import com.agriconnect.entity.PaymentMethod;
import com.agriconnect.entity.PaymentTiming;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequest {

    // =========================================================
    // PRODUCT
    // =========================================================

    @NotNull(message = "Produce ID is required")
    private Long produceId;


    // =========================================================
    // QUANTITY
    // =========================================================

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantityOrdered;


    // =========================================================
    // DELIVERY LOCATION
    // =========================================================

    @NotNull(message = "Delivery latitude is required")
    private Double deliveryLatitude;

    @NotNull(message = "Delivery longitude is required")
    private Double deliveryLongitude;


    // =========================================================
    // PAYMENT METHOD
    // =========================================================

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;


    // =========================================================
    // PAYMENT TIMING
    // =========================================================

    @NotNull(message = "Payment timing is required")
    private PaymentTiming paymentTiming;
}