package com.agriconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ChatResponse {
    private String reply;
    private List<SuggestedProduce> suggestedProduce;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class SuggestedProduce {
        private Long id;
        private String name;
        private Double price;
        private String unit;
    }
}