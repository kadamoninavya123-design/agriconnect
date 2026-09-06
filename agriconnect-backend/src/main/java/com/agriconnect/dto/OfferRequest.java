package com.agriconnect.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfferRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Offered price is required")
    @Positive(message = "Offered price must be positive")
    private Double offeredPrice;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    private String message;
}
