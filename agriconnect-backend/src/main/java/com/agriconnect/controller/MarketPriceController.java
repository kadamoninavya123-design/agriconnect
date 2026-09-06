package com.agriconnect.controller;

import com.agriconnect.dto.MarketPriceHistoryPoint;
import com.agriconnect.dto.MarketPriceResponse;
import com.agriconnect.service.MarketPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market-prices")
@RequiredArgsConstructor
public class MarketPriceController {

    private final MarketPriceService marketPriceService;

    @GetMapping("/{commodity}")
    public ResponseEntity<?> getLatestPrice(@PathVariable String commodity) {
        try {
            return ResponseEntity.ok(marketPriceService.getLatestPriceForCommodity(commodity));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/{commodity}/history")
    public ResponseEntity<List<MarketPriceHistoryPoint>> getPriceHistory(
            @PathVariable String commodity,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(marketPriceService.getPriceHistory(commodity, days));
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refreshNow() {
        marketPriceService.fetchAndStoreDailyPrices();
        return ResponseEntity.ok("Market prices refreshed");
    }
}