package com.agriconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ImageDetectionResponse {
    private String name;
    private String category;
    private Double confidence;
    private Double freshnessScore;
    private String freshnessLabel;
}