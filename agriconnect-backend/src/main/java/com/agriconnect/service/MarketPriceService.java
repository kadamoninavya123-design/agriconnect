package com.agriconnect.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.agriconnect.dto.AgmarknetApiResponse;
import com.agriconnect.dto.MarketPriceHistoryPoint;
import com.agriconnect.dto.MarketPriceResponse;
import com.agriconnect.entity.MarketPrice;
import com.agriconnect.repository.MarketPriceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketPriceService {

    private static final String DEFAULT_STATE = "Telangana";

    private final MarketPriceRepository marketPriceRepository;
    private final RestTemplate restTemplate;

    @Value("${agmarknet.api.key}")
    private String apiKey;

    @Value("${agmarknet.api.url}")
    private String apiUrl;

    private static final DateTimeFormatter API_DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // =========================================================
    // FETCH GOVERNMENT MARKET PRICES
    // =========================================================

    @Scheduled(cron = "0 0 6 * * *")
    public void fetchAndStoreDailyPrices() {

        log.info("Starting daily market price fetch...");

        try {

            String url = UriComponentsBuilder
                    .fromUriString(apiUrl)
                    .queryParam("api-key", apiKey)
                    .queryParam("format", "json")
                    .queryParam("limit", "500")
                    .toUriString();

            AgmarknetApiResponse response =
                    restTemplate.getForObject(
                            url,
                            AgmarknetApiResponse.class
                    );

            if (response == null || response.getRecords() == null) {

                log.warn("No records returned from Agmarknet API");

                return;
            }

            int savedCount = 0;

            for (AgmarknetApiResponse.AgmarknetRecord record
                    : response.getRecords()) {

                try {

                    LocalDate priceDate =
                            LocalDate.parse(
                                    record.getArrival_date(),
                                    API_DATE_FORMAT
                            );

                    boolean alreadyExists =
                            marketPriceRepository
                                    .existsByCommodityIgnoreCaseAndMarketIgnoreCaseAndPriceDate(
                                            record.getCommodity(),
                                            record.getMarket(),
                                            priceDate
                                    );

                    if (alreadyExists) {
                        continue;
                    }

                    MarketPrice price =
                            MarketPrice.builder()
                                    .commodity(record.getCommodity())
                                    .state(record.getState())
                                    .market(record.getMarket())
                                    .minPrice(
                                            parseDouble(
                                                    record.getMin_price()
                                            )
                                    )
                                    .maxPrice(
                                            parseDouble(
                                                    record.getMax_price()
                                            )
                                    )
                                    .modalPrice(
                                            parseDouble(
                                                    record.getModal_price()
                                            )
                                    )
                                    .priceDate(priceDate)
                                    .build();

                    marketPriceRepository.save(price);

                    savedCount++;

                } catch (Exception e) {

                    log.warn(
                            "Skipping malformed record: {}",
                            e.getMessage()
                    );
                }
            }

            log.info(
                    "Daily market price fetch complete. Saved {} new records.",
                    savedCount
            );

        } catch (Exception e) {

            log.error(
                    "Failed to fetch market prices from Agmarknet API",
                    e
            );
        }
    }

    // =========================================================
    // CONVERT PRICE STRING TO DOUBLE
    // =========================================================

    private Double parseDouble(String value) {

        try {

            return value == null || value.isBlank()
                    ? null
                    : Double.parseDouble(value);

        } catch (NumberFormatException e) {

            return null;
        }
    }

    // =========================================================
    // NORMALIZE COMMODITY NAME
    // =========================================================

    private String normalizeCommodityName(String commodity) {

        if (commodity == null) {
            return null;
        }

        String normalized =
                commodity.trim();

        // Farmer product: Tomatoes
        // Government commodity: Tomato
        if (normalized.equalsIgnoreCase("Tomatoes")) {
            return "Tomato";
        }

        return normalized;
    }

    // =========================================================
    // GET LATEST MARKET PRICE
    // =========================================================

    public MarketPriceResponse getLatestPriceForCommodity(
            String commodity) {

        return getLatestPriceForCommodity(
                commodity,
                DEFAULT_STATE
        );
    }

    public MarketPriceResponse getLatestPriceForCommodity(
            String commodity,
            String state) {

        String searchCommodity =
                normalizeCommodityName(commodity);

        List<MarketPrice> history =
                marketPriceRepository
                        .findByCommodityIgnoreCaseAndStateIgnoreCaseOrderByPriceDateDesc(
                                searchCommodity,
                                state
                        );

        boolean usedFallback = false;

        // =====================================================
        // FALLBACK: SEARCH ALL STATES
        // =====================================================

        if (history.isEmpty()) {

            history =
                    marketPriceRepository
                            .findByCommodityIgnoreCaseOrderByPriceDateDesc(
                                    searchCommodity
                            );

            usedFallback = true;
        }

        // =====================================================
        // NO DATA
        // =====================================================

        if (history.isEmpty()) {

            throw new IllegalArgumentException(
                    "No market price data available for "
                            + commodity
            );
        }

        // =====================================================
        // TODAY'S PRICE
        // =====================================================

        MarketPrice today =
                history.get(0);

        Optional<MarketPrice> yesterday =
                history.size() > 1
                        ? Optional.of(history.get(1))
                        : Optional.empty();

        Double todayPrice =
                today.getModalPrice();

        Double yesterdayPrice =
                yesterday
                        .map(MarketPrice::getModalPrice)
                        .orElse(null);

        // =====================================================
        // CALCULATE PERCENTAGE CHANGE
        // =====================================================

        Double percentChange = null;

        if (todayPrice != null
                && yesterdayPrice != null
                && yesterdayPrice != 0) {

            percentChange =
                    ((todayPrice - yesterdayPrice)
                            / yesterdayPrice)
                            * 100;
        }

        // =====================================================
        // RETURN RESPONSE
        // =====================================================

        return new MarketPriceResponse(
                today.getCommodity(),
                today.getMarket(),
                today.getState(),
                todayPrice,
                yesterdayPrice,
                percentChange,
                today.getPriceDate(),
                today.getFetchedAt(),
                usedFallback
        );
    }

    // =========================================================
    // GET PRICE HISTORY
    // =========================================================

    public List<MarketPriceHistoryPoint> getPriceHistory(
            String commodity,
            int days) {

        return getPriceHistory(
                commodity,
                DEFAULT_STATE,
                days
        );
    }

    public List<MarketPriceHistoryPoint> getPriceHistory(
            String commodity,
            String state,
            int days) {

        String searchCommodity =
                normalizeCommodityName(commodity);

        LocalDate cutoff =
                LocalDate.now().minusDays(days);

        List<MarketPrice> results =
                marketPriceRepository
                        .findByCommodityIgnoreCaseAndStateIgnoreCaseAndPriceDateAfterOrderByPriceDateAsc(
                                searchCommodity,
                                state,
                                cutoff
                        );

        // =====================================================
        // FALLBACK: ALL STATES
        // =====================================================

        if (results.isEmpty()) {

            results =
                    marketPriceRepository
                            .findByCommodityIgnoreCaseAndPriceDateAfterOrderByPriceDateAsc(
                                    searchCommodity,
                                    cutoff
                            );
        }

        return results.stream()
                .map(mp ->
                        new MarketPriceHistoryPoint(
                                mp.getPriceDate(),
                                mp.getModalPrice()
                        )
                )
                .toList();
    }
}