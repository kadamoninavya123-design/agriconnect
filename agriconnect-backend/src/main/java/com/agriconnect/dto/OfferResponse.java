package com.agriconnect.dto;

import com.agriconnect.entity.OfferStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class OfferResponse {
    private Long id;
    private Long orderId;
    private String offeredByName;
    private Long offeredByUserId;
    private Double offeredPrice;
    private Double quantity;
    private String message;
    private OfferStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
