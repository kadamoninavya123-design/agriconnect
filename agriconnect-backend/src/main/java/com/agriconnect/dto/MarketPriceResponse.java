package com.agriconnect.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MarketPriceResponse {

    private String commodity;
    private String market;
    private String state;
    private Double todayModalPrice;
    private Double yesterdayModalPrice;
    private Double percentChange;
    private LocalDate priceDate;
    private LocalDateTime lastUpdated;
    private boolean fallback;

    public MarketPriceResponse() {
    }

    public MarketPriceResponse(
            String commodity,
            String market,
            String state,
            Double todayModalPrice,
            Double yesterdayModalPrice,
            Double percentChange,
            LocalDate priceDate,
            LocalDateTime lastUpdated,
            boolean fallback) {

        this.commodity = commodity;
        this.market = market;
        this.state = state;
        this.todayModalPrice = todayModalPrice;
        this.yesterdayModalPrice = yesterdayModalPrice;
        this.percentChange = percentChange;
        this.priceDate = priceDate;
        this.lastUpdated = lastUpdated;
        this.fallback = fallback;
    }

    public String getCommodity() {
        return commodity;
    }

    public void setCommodity(String commodity) {
        this.commodity = commodity;
    }

    public String getMarket() {
        return market;
    }

    public void setMarket(String market) {
        this.market = market;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Double getTodayModalPrice() {
        return todayModalPrice;
    }

    public void setTodayModalPrice(Double todayModalPrice) {
        this.todayModalPrice = todayModalPrice;
    }

    public Double getYesterdayModalPrice() {
        return yesterdayModalPrice;
    }

    public void setYesterdayModalPrice(Double yesterdayModalPrice) {
        this.yesterdayModalPrice = yesterdayModalPrice;
    }

    public Double getPercentChange() {
        return percentChange;
    }

    public void setPercentChange(Double percentChange) {
        this.percentChange = percentChange;
    }

    public LocalDate getPriceDate() {
        return priceDate;
    }

    public void setPriceDate(LocalDate priceDate) {
        this.priceDate = priceDate;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public boolean isFallback() {
        return fallback;
    }

    public void setFallback(boolean fallback) {
        this.fallback = fallback;
    }
}