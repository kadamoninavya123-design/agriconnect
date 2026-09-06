package com.agriconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProduceResponse {
    private Long id;
    private String name;
    private String category;
    private Double quantity;
    private Double price;
    private String imageUrl;
    private Long farmerId;
    private String farmerName;
    private Boolean available;
}