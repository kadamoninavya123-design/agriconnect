package com.agriconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProduceRequest {
    @NotBlank
    private String name;

    private String description;

    private String category;

    @NotNull
    private Double price;

    @NotNull
    private Double quantity;

    private String imageUrl;
}