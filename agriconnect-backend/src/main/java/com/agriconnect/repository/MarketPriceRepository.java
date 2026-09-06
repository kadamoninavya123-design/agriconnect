package com.agriconnect.repository;

import com.agriconnect.entity.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
    List<MarketPrice> findByCommodityIgnoreCaseOrderByPriceDateDesc(String commodity);
    Optional<MarketPrice> findFirstByCommodityIgnoreCaseOrderByPriceDateDesc(String commodity);
    boolean existsByCommodityIgnoreCaseAndMarketIgnoreCaseAndPriceDate(String commodity, String market, LocalDate priceDate);
    List<MarketPrice> findByCommodityIgnoreCaseAndPriceDateAfterOrderByPriceDateAsc(String commodity, LocalDate afterDate);

    List<MarketPrice> findByCommodityIgnoreCaseAndStateIgnoreCaseOrderByPriceDateDesc(String commodity, String state);
    List<MarketPrice> findByCommodityIgnoreCaseAndStateIgnoreCaseAndPriceDateAfterOrderByPriceDateAsc(
            String commodity, String state, LocalDate afterDate);
}