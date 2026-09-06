package com.agriconnect.dto;

import java.time.LocalDate;

public class MarketPriceHistoryPoint {

    private LocalDate date;
    private Double modalPrice;

    // No-argument constructor
    public MarketPriceHistoryPoint() {
    }

    // Parameterized constructor
    public MarketPriceHistoryPoint(LocalDate date, Double modalPrice) {
        this.date = date;
        this.modalPrice = modalPrice;
    }

    // Getter
    public LocalDate getDate() {
        return date;
    }

    // Setter
    public void setDate(LocalDate date) {
        this.date = date;
    }

    // Getter
    public Double getModalPrice() {
        return modalPrice;
    }

    // Setter
    public void setModalPrice(Double modalPrice) {
        this.modalPrice = modalPrice;
    }
}