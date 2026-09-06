package com.agriconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agriconnect.dto.OfferRequest;
import com.agriconnect.dto.OfferResponse;
import com.agriconnect.entity.NegotiationStatus;
import com.agriconnect.entity.Offer;
import com.agriconnect.entity.OfferStatus;
import com.agriconnect.entity.Order;
import com.agriconnect.entity.OrderStatus;
import com.agriconnect.entity.Role;
import com.agriconnect.entity.User;
import com.agriconnect.repository.OfferRepository;
import com.agriconnect.repository.OrderRepository;
import com.agriconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;


    // =========================================================
    // CREATE OFFER
    // BUSINESSMAN ONLY
    // =========================================================

    @Transactional
    public OfferResponse createOffer(
            OfferRequest request,
            Authentication authentication) {

        User user = getCurrentUser(authentication);


        // -----------------------------------------------------
        // VALIDATE REQUEST
        // -----------------------------------------------------

        if (request == null) {
            throw new IllegalArgumentException(
                    "Offer request is required");
        }

        if (request.getOrderId() == null) {
            throw new IllegalArgumentException(
                    "Order ID is required");
        }

        if (request.getOfferedPrice() == null
                || request.getOfferedPrice() <= 0) {

            throw new IllegalArgumentException(
                    "Offered price must be greater than zero");
        }

        if (request.getQuantity() == null
                || request.getQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }


        // -----------------------------------------------------
        // FIND ORDER
        // -----------------------------------------------------

        Order order = orderRepository
                .findById(request.getOrderId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found"));


        // -----------------------------------------------------
        // ONLY BUSINESS
        // -----------------------------------------------------

        if (user.getRole() != Role.BUSINESS) {

            throw new SecurityException(
                    "Only business users can create offers");
        }


        // -----------------------------------------------------
        // ORDER OWNER
        // -----------------------------------------------------

        if (order.getBusinessman() == null
                || order.getBusinessman().getId() == null
                || !order.getBusinessman()
                        .getId()
                        .equals(user.getId())) {

            throw new SecurityException(
                    "You can only make offers on your own orders");
        }


        // -----------------------------------------------------
        // ORDER STATUS
        // -----------------------------------------------------

        if (order.getStatus() != OrderStatus.PLACED) {

            throw new IllegalArgumentException(
                    "Offers can only be made while the order is Placed");
        }


        // -----------------------------------------------------
        // PAYMENT CHECK
        // -----------------------------------------------------

        if (order.getPaymentStatus() != null
                && order.getPaymentStatus()
                        .name()
                        .equals("PAID")) {

            throw new IllegalArgumentException(
                    "Paid orders cannot be negotiated");
        }


        // -----------------------------------------------------
        // QUANTITY
        // -----------------------------------------------------

        if (order.getQuantityOrdered() == null
                || request.getQuantity()
                        > order.getQuantityOrdered()) {

            throw new IllegalArgumentException(
                    "Offer quantity cannot be greater than ordered quantity");
        }


        // -----------------------------------------------------
        // ACTIVE OFFER
        // -----------------------------------------------------

        if (Boolean.TRUE.equals(
                order.getHasActiveOffer())) {

            throw new IllegalArgumentException(
                    "There is already an active offer for this order");
        }


        // -----------------------------------------------------
        // CREATE OFFER
        // -----------------------------------------------------

        Offer offer = new Offer();

        offer.setOrder(order);

        offer.setOfferedBy(user);

        offer.setOfferedPrice(
                request.getOfferedPrice());

        offer.setQuantity(
                request.getQuantity());

        offer.setMessage(
                request.getMessage());

        offer.setStatus(
                OfferStatus.PENDING);


        offer = offerRepository.save(offer);


        // -----------------------------------------------------
        // UPDATE NEGOTIATION
        // -----------------------------------------------------

        order.setNegotiationStatus(
                NegotiationStatus.PENDING);

        order.setHasActiveOffer(true);

        orderRepository.saveAndFlush(order);


        return toOfferResponse(offer);
    }


    // =========================================================
    // ACCEPT OFFER
    // FARMER ONLY
    // =========================================================

    @Transactional
    public OfferResponse acceptOffer(
            Long offerId,
            Authentication authentication) {

        User user = getCurrentUser(authentication);


        // -----------------------------------------------------
        // FIND OFFER
        // -----------------------------------------------------

        Offer offer = offerRepository
                .findById(offerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Offer not found"));


        Order order = offer.getOrder();


        if (order == null) {

            throw new IllegalArgumentException(
                    "Order not found for this offer");
        }


        // -----------------------------------------------------
        // FARMER CHECK
        // -----------------------------------------------------

        if (order.getProduce() == null
                || order.getProduce().getFarmer() == null
                || order.getProduce()
                        .getFarmer()
                        .getId() == null
                || !order.getProduce()
                        .getFarmer()
                        .getId()
                        .equals(user.getId())) {

            throw new SecurityException(
                    "Only the product owner can accept offers");
        }


        // -----------------------------------------------------
        // OFFER STATUS
        // -----------------------------------------------------

        if (offer.getStatus()
                != OfferStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Only pending offers can be accepted");
        }


        // -----------------------------------------------------
        // ORDER STATUS
        // -----------------------------------------------------

        if (order.getStatus()
                != OrderStatus.PLACED) {

            throw new IllegalArgumentException(
                    "Offer can only be accepted while the order is Placed");
        }


        // -----------------------------------------------------
        // ACCEPT OFFER
        // -----------------------------------------------------

        offer.setStatus(
                OfferStatus.ACCEPTED);

        offer.setRespondedAt(
                LocalDateTime.now());

        offerRepository.save(offer);


        // -----------------------------------------------------
        // SET FINAL PRICE
        // -----------------------------------------------------

        order.setFinalPrice(
                offer.getOfferedPrice());


        // -----------------------------------------------------
        // SET TOTAL PRICE
        // -----------------------------------------------------

        order.setTotalPrice(
                offer.getOfferedPrice()
                        * offer.getQuantity());


        // -----------------------------------------------------
        // CONFIRM ORDER
        // -----------------------------------------------------

        order.setStatus(
                OrderStatus.CONFIRMED);


        // -----------------------------------------------------
        // COMPLETE NEGOTIATION
        // -----------------------------------------------------

        order.setNegotiationStatus(
                NegotiationStatus.COMPLETED);

        order.setHasActiveOffer(false);


        orderRepository.saveAndFlush(order);


        return toOfferResponse(offer);
    }


    // =========================================================
    // REJECT OFFER
    // FARMER ONLY
    // =========================================================

    @Transactional
    public OfferResponse rejectOffer(
            Long offerId,
            Authentication authentication) {

        User user = getCurrentUser(authentication);


        // -----------------------------------------------------
        // FIND OFFER
        // -----------------------------------------------------

        Offer offer = offerRepository
                .findById(offerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Offer not found"));


        Order order = offer.getOrder();


        if (order == null) {

            throw new IllegalArgumentException(
                    "Order not found for this offer");
        }


        // -----------------------------------------------------
        // FARMER CHECK
        // -----------------------------------------------------

        if (order.getProduce() == null
                || order.getProduce().getFarmer() == null
                || order.getProduce()
                        .getFarmer()
                        .getId() == null
                || !order.getProduce()
                        .getFarmer()
                        .getId()
                        .equals(user.getId())) {

            throw new SecurityException(
                    "Only the product owner can reject offers");
        }


        // -----------------------------------------------------
        // OFFER STATUS
        // -----------------------------------------------------

        if (offer.getStatus()
                != OfferStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Only pending offers can be rejected");
        }


        // -----------------------------------------------------
        // ORDER STATUS
        // -----------------------------------------------------

        if (order.getStatus()
                != OrderStatus.PLACED) {

            throw new IllegalArgumentException(
                    "Offer can only be rejected while the order is Placed");
        }


        // -----------------------------------------------------
        // REJECT
        // -----------------------------------------------------

        offer.setStatus(
                OfferStatus.REJECTED);

        offer.setRespondedAt(
                LocalDateTime.now());

        offerRepository.save(offer);


        // -----------------------------------------------------
        // ALLOW NEW OFFER
        // -----------------------------------------------------

        order.setHasActiveOffer(false);

        order.setNegotiationStatus(
                NegotiationStatus.NONE);

        orderRepository.saveAndFlush(order);


        return toOfferResponse(offer);
    }


    // =========================================================
    // COUNTER OFFER
    // FARMER ONLY
    // =========================================================

    @Transactional
    public OfferResponse createCounterOffer(
            Long originalOfferId,
            OfferRequest request,
            Authentication authentication) {

        User user = getCurrentUser(authentication);


        if (originalOfferId == null) {

            throw new IllegalArgumentException(
                    "Original offer ID is required");
        }


        if (request == null) {

            throw new IllegalArgumentException(
                    "Counter offer request is required");
        }


        if (request.getOfferedPrice() == null
                || request.getOfferedPrice() <= 0) {

            throw new IllegalArgumentException(
                    "Counter offer price must be greater than zero");
        }


        if (request.getQuantity() == null
                || request.getQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Counter offer quantity must be greater than zero");
        }


        // -----------------------------------------------------
        // FIND ORIGINAL OFFER
        // -----------------------------------------------------

        Offer originalOffer =
                offerRepository
                        .findById(originalOfferId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Original offer not found"));


        Order order =
                originalOffer.getOrder();


        if (order == null) {

            throw new IllegalArgumentException(
                    "Order not found for this offer");
        }


        // -----------------------------------------------------
        // FARMER CHECK
        // -----------------------------------------------------

        if (order.getProduce() == null
                || order.getProduce().getFarmer() == null
                || order.getProduce()
                        .getFarmer()
                        .getId() == null
                || !order.getProduce()
                        .getFarmer()
                        .getId()
                        .equals(user.getId())) {

            throw new SecurityException(
                    "Only the product owner can create counter offers");
        }


        // -----------------------------------------------------
        // OFFER STATUS
        // -----------------------------------------------------

        if (originalOffer.getStatus()
                != OfferStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Only pending offers can be countered");
        }


        // -----------------------------------------------------
        // ORDER STATUS
        // -----------------------------------------------------

        if (order.getStatus()
                != OrderStatus.PLACED) {

            throw new IllegalArgumentException(
                    "Counter offers can only be made while the order is Placed");
        }


        // -----------------------------------------------------
        // QUANTITY
        // -----------------------------------------------------

        if (order.getQuantityOrdered() == null
                || request.getQuantity()
                        > order.getQuantityOrdered()) {

            throw new IllegalArgumentException(
                    "Counter offer quantity cannot be greater than ordered quantity");
        }


        // -----------------------------------------------------
        // MARK ORIGINAL AS COUNTERED
        // -----------------------------------------------------

        originalOffer.setStatus(
                OfferStatus.COUNTERED);

        originalOffer.setRespondedAt(
                LocalDateTime.now());

        offerRepository.save(originalOffer);


        // -----------------------------------------------------
        // CREATE COUNTER OFFER
        // -----------------------------------------------------

        Offer counterOffer =
                new Offer();

        counterOffer.setOrder(
                order);

        counterOffer.setOfferedBy(
                user);

        counterOffer.setOfferedPrice(
                request.getOfferedPrice());

        counterOffer.setQuantity(
                request.getQuantity());

        counterOffer.setMessage(
                request.getMessage());

        counterOffer.setStatus(
                OfferStatus.PENDING);


        counterOffer =
                offerRepository.save(counterOffer);


        // -----------------------------------------------------
        // UPDATE NEGOTIATION
        // -----------------------------------------------------

        order.setHasActiveOffer(true);

        order.setNegotiationStatus(
                NegotiationStatus.PENDING);

        orderRepository.saveAndFlush(order);


        return toOfferResponse(counterOffer);
    }


    // =========================================================
    // GET OFFERS FOR ORDER
    // =========================================================

    public List<OfferResponse> getOffersForOrder(
            Long orderId,
            Authentication authentication) {

        User user =
                getCurrentUser(authentication);


        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found"));


        // -----------------------------------------------------
        // BUSINESS OWNER
        // -----------------------------------------------------

        boolean isBusinessOwner =
                order.getBusinessman() != null
                        && order.getBusinessman().getId() != null
                        && order.getBusinessman()
                                .getId()
                                .equals(user.getId());


        // -----------------------------------------------------
        // FARMER
        // -----------------------------------------------------

        boolean isFarmer =
                order.getProduce() != null
                        && order.getProduce().getFarmer() != null
                        && order.getProduce()
                                .getFarmer()
                                .getId() != null
                        && order.getProduce()
                                .getFarmer()
                                .getId()
                                .equals(user.getId());


        // -----------------------------------------------------
        // ADMIN
        // -----------------------------------------------------

        boolean isAdmin =
                user.getRole() == Role.ADMIN;


        if (!isBusinessOwner
                && !isFarmer
                && !isAdmin) {

            throw new SecurityException(
                    "Not authorized to view offers for this order");
        }


        List<Offer> offers =
                offerRepository
                        .findOfferHistoryForOrder(orderId);


        return offers.stream()
                .map(this::toOfferResponse)
                .toList();
    }


    // =========================================================
    // CURRENT USER
    // =========================================================

    private User getCurrentUser(
            Authentication authentication) {

        if (authentication == null) {

            throw new SecurityException(
                    "User is not authenticated");
        }


        String email =
                authentication.getName();


        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"));
    }


    // =========================================================
    // CONVERT OFFER TO RESPONSE
    // =========================================================

    private OfferResponse toOfferResponse(
            Offer offer) {

        if (offer == null) {

            throw new IllegalArgumentException(
                    "Offer cannot be null");
        }


        if (offer.getOrder() == null) {

            throw new IllegalArgumentException(
                    "Offer order cannot be null");
        }


        if (offer.getOfferedBy() == null) {

            throw new IllegalArgumentException(
                    "Offer user cannot be null");
        }


        return new OfferResponse(

                offer.getId(),

                offer.getOrder()
                        .getId(),

                offer.getOfferedBy()
                        .getName(),

                offer.getOfferedBy()
                        .getId(),

                offer.getOfferedPrice(),

                offer.getQuantity(),

                offer.getMessage(),

                offer.getStatus(),

                offer.getCreatedAt(),

                offer.getRespondedAt()
        );
    }
}