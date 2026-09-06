package com.agriconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfferActionRequest {

    @NotBlank(message = "Action is required")
    private String action; // ACCEPT, REJECT, COUNTER

    @Positive(message = "Counter price must be positive")
    private Double counterPrice;

    private String counterMessage;
}
