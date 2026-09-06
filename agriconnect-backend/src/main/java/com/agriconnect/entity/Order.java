package com.agriconnect.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    // =========================================================
    // ORDER ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // BUSINESSMAN
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "businessman_id", nullable = false)
    private User businessman;


    // =========================================================
    // PRODUCE
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "produce_id", nullable = false)
    private Produce produce;


    // =========================================================
    // ORDER DETAILS
    // =========================================================

    @Column(nullable = false)
    private Double quantityOrdered;

    @Column(nullable = false)
    private Double totalPrice;


    // =========================================================
    // ORDER STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;


    // =========================================================
    // NEGOTIATION
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NegotiationStatus negotiationStatus =
            NegotiationStatus.NONE;

    private Double finalPrice;

    @Column(nullable = false)
    @Builder.Default
    private Boolean hasActiveOffer = false;


    // =========================================================
    // EXPECTED DELIVERY
    // =========================================================

    private LocalDate expectedDeliveryDate;


    // =========================================================
    // DELIVERY TRACKING
    // =========================================================

    private Double deliveryLatitude;

    private Double deliveryLongitude;

    private Double currentLatitude;

    private Double currentLongitude;

    private LocalDateTime lastLocationUpdate;

    private LocalDateTime shippedAt;

    private LocalDateTime outForDeliveryAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime estimatedArrivalTime;


    // =========================================================
    // PAYMENT METHOD
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentMethod paymentMethod =
            PaymentMethod.CASH_ON_DELIVERY;


    // =========================================================
    // PAYMENT TIMING
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentTiming paymentTiming =
            PaymentTiming.AFTER_DELIVERY;


    // =========================================================
    // PAYMENT STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus =
            PaymentStatus.COD;


    // =========================================================
    // PAYMENT TRANSACTION ID
    // =========================================================

    private String paymentTransactionId;


    // =========================================================
    // PAYMENT COMPLETED DATE AND TIME
    // =========================================================

    private LocalDateTime paidAt;


    // =========================================================
    // CREATED DATE
    // =========================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;


    // =========================================================
    // BEFORE INSERT
    // =========================================================

    @PrePersist
    protected void onCreate() {

        // -----------------------------------------------------
        // CREATED TIME
        // -----------------------------------------------------

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }


        // -----------------------------------------------------
        // NEGOTIATION DEFAULT
        // -----------------------------------------------------

        if (negotiationStatus == null) {
            negotiationStatus =
                    NegotiationStatus.NONE;
        }


        // -----------------------------------------------------
        // ACTIVE OFFER DEFAULT
        // -----------------------------------------------------

        if (hasActiveOffer == null) {
            hasActiveOffer = false;
        }


        // -----------------------------------------------------
        // PAYMENT METHOD DEFAULT
        // -----------------------------------------------------

        if (paymentMethod == null) {
            paymentMethod =
                    PaymentMethod.CASH_ON_DELIVERY;
        }


        // -----------------------------------------------------
        // PAYMENT TIMING DEFAULT
        // -----------------------------------------------------

        if (paymentTiming == null) {
            paymentTiming =
                    PaymentTiming.AFTER_DELIVERY;
        }


        // -----------------------------------------------------
        // PAYMENT STATUS
        // -----------------------------------------------------

        /*
         * AFTER_DELIVERY
         * means payment is completed after delivery.
         */

        if (paymentTiming ==
                PaymentTiming.AFTER_DELIVERY) {

            paymentStatus =
                    PaymentStatus.COD;
        }


        /*
         * BEFORE_DELIVERY
         * means online payment is expected.
         */

        else if (paymentTiming ==
                PaymentTiming.BEFORE_DELIVERY) {

            if (paymentStatus == null ||
                    paymentStatus == PaymentStatus.COD) {

                paymentStatus =
                        PaymentStatus.PENDING;
            }
        }
    }
}