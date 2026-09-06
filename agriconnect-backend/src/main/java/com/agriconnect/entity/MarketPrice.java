package com.agriconnect.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "market_prices")
public class MarketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String commodity;

    private String state;

    private String market;

    private Double minPrice;

    private Double maxPrice;

    private Double modalPrice;

    @Column(nullable = false)
    private LocalDate priceDate;

    @Column(nullable = false)
    private LocalDateTime fetchedAt;

    public MarketPrice() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCommodity() {
        return commodity;
    }

    public void setCommodity(String commodity) {
        this.commodity = commodity;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getMarket() {
        return market;
    }

    public void setMarket(String market) {
        this.market = market;
    }

    public Double getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }

    public Double getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }

    public Double getModalPrice() {
        return modalPrice;
    }

    public void setModalPrice(Double modalPrice) {
        this.modalPrice = modalPrice;
    }

    public LocalDate getPriceDate() {
        return priceDate;
    }

    public void setPriceDate(LocalDate priceDate) {
        this.priceDate = priceDate;
    }

    public LocalDateTime getFetchedAt() {
        return fetchedAt;
    }

    public void setFetchedAt(LocalDateTime fetchedAt) {
        this.fetchedAt = fetchedAt;
    }

    @PrePersist
    protected void onCreate() {
        fetchedAt = LocalDateTime.now();
    }

    // Manual builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private final MarketPrice marketPrice = new MarketPrice();

        public Builder commodity(String commodity) {
            marketPrice.commodity = commodity;
            return this;
        }

        public Builder state(String state) {
            marketPrice.state = state;
            return this;
        }

        public Builder market(String market) {
            marketPrice.market = market;
            return this;
        }

        public Builder minPrice(Double minPrice) {
            marketPrice.minPrice = minPrice;
            return this;
        }

        public Builder maxPrice(Double maxPrice) {
            marketPrice.maxPrice = maxPrice;
            return this;
        }

        public Builder modalPrice(Double modalPrice) {
            marketPrice.modalPrice = modalPrice;
            return this;
        }

        public Builder priceDate(LocalDate priceDate) {
            marketPrice.priceDate = priceDate;
            return this;
        }

        public MarketPrice build() {
            return marketPrice;
        }
    }
}