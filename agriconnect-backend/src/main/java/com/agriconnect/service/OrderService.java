package com.agriconnect.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agriconnect.dto.OfferResponse;
import com.agriconnect.dto.OrderRequest;
import com.agriconnect.dto.OrderResponse;
import com.agriconnect.dto.OrderStatusUpdateRequest;
import com.agriconnect.entity.NegotiationStatus;
import com.agriconnect.entity.Order;
import com.agriconnect.entity.OrderStatus;
import com.agriconnect.entity.PaymentMethod;
import com.agriconnect.entity.PaymentStatus;
import com.agriconnect.entity.PaymentTiming;
import com.agriconnect.entity.Produce;
import com.agriconnect.entity.User;
import com.agriconnect.repository.OrderRepository;
import com.agriconnect.repository.ProduceRepository;
import com.agriconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    private final ProduceRepository produceRepository;

    private final UserRepository userRepository;

    private final OfferService offerService;


    // =========================================================
    // PLACE ORDER
    // =========================================================

    @Transactional
    public OrderResponse placeOrder(
            OrderRequest request,
            Authentication authentication) {

        User businessman =
                getCurrentUser(authentication);


        // =====================================================
        // REQUEST CHECK
        // =====================================================

        if (request == null) {

            throw new IllegalArgumentException(
                    "Order request is required");
        }


        // =====================================================
        // FIND PRODUCE
        // =====================================================

        Produce produce =
                produceRepository
                        .findById(
                                request.getProduceId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Produce not found"));


        // =====================================================
        // CHECK QUANTITY
        // =====================================================

        if (request.getQuantityOrdered() == null
                || request.getQuantityOrdered() <= 0) {

            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }


        // =====================================================
        // CHECK STOCK
        // =====================================================

        if (produce.getQuantity() == null
                || produce.getQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "This product is currently unavailable");
        }


        if (request.getQuantityOrdered()
                > produce.getQuantity()) {

            throw new IllegalArgumentException(
                    "Requested quantity exceeds available stock");
        }


        // =====================================================
        // DELIVERY LOCATION
        // =====================================================

        if (request.getDeliveryLatitude() == null
                || request.getDeliveryLongitude() == null) {

            throw new IllegalArgumentException(
                    "Delivery location is required");
        }


        // =====================================================
        // LATITUDE
        // =====================================================

        if (request.getDeliveryLatitude() < -90
                || request.getDeliveryLatitude() > 90) {

            throw new IllegalArgumentException(
                    "Invalid delivery latitude");
        }


        // =====================================================
        // LONGITUDE
        // =====================================================

        if (request.getDeliveryLongitude() < -180
                || request.getDeliveryLongitude() > 180) {

            throw new IllegalArgumentException(
                    "Invalid delivery longitude");
        }


        // =====================================================
        // PRICE
        // =====================================================

        double totalPrice =
                request.getQuantityOrdered()
                        * produce.getPrice();


        // =====================================================
        // PAYMENT METHOD
        // =====================================================

        PaymentMethod paymentMethod =
                request.getPaymentMethod();


        if (paymentMethod == null) {

            paymentMethod =
                    PaymentMethod.CASH_ON_DELIVERY;
        }


        // =====================================================
        // PAYMENT TIMING
        // =====================================================

        PaymentTiming paymentTiming =
                request.getPaymentTiming();


        if (paymentTiming == null) {

            if (paymentMethod
                    == PaymentMethod.CASH_ON_DELIVERY) {

                paymentTiming =
                        PaymentTiming.AFTER_DELIVERY;

            } else {

                paymentTiming =
                        PaymentTiming.BEFORE_DELIVERY;
            }
        }


        // =====================================================
        // PAYMENT STATUS
        // =====================================================

        PaymentStatus paymentStatus;


        if (paymentMethod
                == PaymentMethod.CASH_ON_DELIVERY) {

            /*
             * COD order:
             *
             * Before delivery = COD
             * After delivery  =  SUCCESS
             */

            paymentStatus =
                    PaymentStatus.COD;

            paymentTiming =
                    PaymentTiming.AFTER_DELIVERY;

        } else {

            /*
             * Online payment:
             *
             * Before payment = PENDING
             * After payment  = SUCCESS
             */

            paymentStatus =
                    PaymentStatus.PENDING;

            paymentTiming =
                    PaymentTiming.BEFORE_DELIVERY;
        }


        // =====================================================
        // CREATE ORDER
        // =====================================================

        Order order =
                Order.builder()

                        .businessman(
                                businessman)

                        .produce(
                                produce)

                        .quantityOrdered(
                                request.getQuantityOrdered())

                        .totalPrice(
                                totalPrice)

                        .finalPrice(
                                null)

                        .status(
                                OrderStatus.PLACED)

                        .negotiationStatus(
                                NegotiationStatus.NONE)

                        .hasActiveOffer(
                                false)

                        .deliveryLatitude(
                                request.getDeliveryLatitude())

                        .deliveryLongitude(
                                request.getDeliveryLongitude())

                        .paymentMethod(
                                paymentMethod)

                        .paymentTiming(
                                paymentTiming)

                        .paymentStatus(
                                paymentStatus)

                        .paymentTransactionId(
                                null)

                        .paidAt(
                                null)

                        .build();


        // =====================================================
        // SAVE ORDER
        // =====================================================

        Order savedOrder =
                orderRepository
                        .saveAndFlush(order);


        // =====================================================
        // REDUCE STOCK
        // =====================================================

        produce.setQuantity(
                produce.getQuantity()
                        - request.getQuantityOrdered());


        produceRepository
                .saveAndFlush(produce);


        // =====================================================
        // RETURN
        // =====================================================

        return toResponse(savedOrder);
    }


    // =========================================================
    // MARK ONLINE PAYMENT SUCCESSFUL
    // =========================================================

    @Transactional
    public OrderResponse markPaymentSuccessful(
            Long orderId,
            String transactionId,
            Authentication authentication) {

        User businessman =
                getCurrentUser(authentication);


        // =====================================================
        // FIND ORDER
        // =====================================================

        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found"));


        // =====================================================
        // OWNER CHECK
        // =====================================================

        if (order.getBusinessman() == null
                || order.getBusinessman().getId() == null
                || !order.getBusinessman()
                        .getId()
                        .equals(businessman.getId())) {

            throw new SecurityException(
                    "You are not authorized to pay for this order");
        }


        // =====================================================
        // CANCELLED
        // =====================================================

        if (order.getStatus()
                == OrderStatus.CANCELLED) {

            throw new IllegalArgumentException(
                    "Cancelled orders cannot be paid");
        }


        // =====================================================
        // DELIVERED
        // =====================================================

        if (order.getStatus()
                == OrderStatus.DELIVERED) {

            throw new IllegalArgumentException(
                    "Delivered orders cannot be paid again");
        }


        // =====================================================
        // COD
        // =====================================================

        if (order.getPaymentMethod()
                == PaymentMethod.CASH_ON_DELIVERY) {

            throw new IllegalArgumentException(
                    "Cash on Delivery orders are paid after delivery");
        }


        // =====================================================
        // ALREADY  SUCCESS
        // =====================================================

        if (order.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            throw new IllegalArgumentException(
                    "This order has already been paid");
        }


        // =====================================================
        // GENERATE TRANSACTION ID
        // =====================================================

        if (transactionId == null
                || transactionId.trim().isEmpty()) {

            transactionId =
                    "AGRI-"
                    + UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase();
        }


        // =====================================================
        // PAYMENT
        // =====================================================

        order.setPaymentStatus(
                PaymentStatus.SUCCESS);


        order.setPaymentTransactionId(
                transactionId);


        order.setPaidAt(
                LocalDateTime.now());


        // =====================================================
        // COMPLETE NEGOTIATION
        // =====================================================

        order.setHasActiveOffer(false);

        order.setNegotiationStatus(
                NegotiationStatus.COMPLETED);


        // =====================================================
        // SAVE
        // =====================================================

        Order updatedOrder =
                orderRepository
                        .saveAndFlush(order);


        return toResponse(updatedOrder);
    }


    // =========================================================
    // BUSINESSMAN - MY ORDERS
    // =========================================================

    public List<OrderResponse> getMyOrders(
            Authentication authentication) {

        User businessman =
                getCurrentUser(authentication);


        return orderRepository
                .findByBusinessmanOrderByCreatedAtDesc(
                        businessman)

                .stream()

                .map(this::toResponse)

                .collect(Collectors.toList());
    }


    // =========================================================
    // FARMER - MY ORDERS
    // =========================================================

    public List<OrderResponse> getOrdersForMyProduce(
            Authentication authentication) {

        User farmer =
                getCurrentUser(authentication);


        return orderRepository
                .findByProduce_FarmerOrderByCreatedAtDesc(
                        farmer)

                .stream()

                .map(this::toResponse)

                .collect(Collectors.toList());
    }


    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @Transactional
    public OrderResponse updateStatus(
            Long orderId,
            OrderStatusUpdateRequest request,
            Authentication authentication) {

        User currentUser =
                getCurrentUser(authentication);


        // =====================================================
        // FIND ORDER
        // =====================================================

        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found"));


        // =====================================================
        // REQUEST CHECK
        // =====================================================

        if (request == null
                || request.getStatus() == null) {

            throw new IllegalArgumentException(
                    "Status is required");
        }


        OrderStatus currentStatus =
                order.getStatus();


        OrderStatus newStatus =
                request.getStatus();


        // =====================================================
        // GET USERS
        // =====================================================

        User farmer =
                order.getProduce()
                        .getFarmer();


        User businessman =
                order.getBusinessman();


        boolean isFarmer =
                farmer != null
                && farmer.getId() != null
                && farmer.getId()
                        .equals(currentUser.getId());


        boolean isBusinessman =
                businessman != null
                && businessman.getId() != null
                && businessman.getId()
                        .equals(currentUser.getId());


        // =====================================================
        // AUTHORIZATION
        // =====================================================

        if (!isFarmer && !isBusinessman) {

            throw new SecurityException(
                    "You are not authorized to update this order");
        }


        // =====================================================
        // DELIVERED
        // =====================================================

        if (newStatus
                == OrderStatus.DELIVERED) {

            // -------------------------------------------------
            // ONLY FARMER
            // -------------------------------------------------

            if (!isFarmer) {

                throw new SecurityException(
                        "Only the farmer can mark the order as delivered");
            }


            // -------------------------------------------------
            // CHECK PREVIOUS STATUS
            // -------------------------------------------------

            if (currentStatus
                    != OrderStatus.OUT_FOR_DELIVERY) {

                throw new IllegalArgumentException(
                        "Order must be OUT_FOR_DELIVERY before it can be delivered");
            }


            // -------------------------------------------------
            // UPDATE STATUS
            // -------------------------------------------------

            order.setStatus(
                    OrderStatus.DELIVERED);


            order.setDeliveredAt(
                    LocalDateTime.now());


            order.setEstimatedArrivalTime(
                    null);


            // -------------------------------------------------
            // COD PAYMENT
            // -------------------------------------------------

            if (order.getPaymentMethod()
                    == PaymentMethod.CASH_ON_DELIVERY) {

                /*
                 * COD:
                 *
                 * COD ->  SUCCESS
                 */

                order.setPaymentStatus(
                        PaymentStatus.SUCCESS);


                order.setPaidAt(
                        LocalDateTime.now());


                // ---------------------------------------------
                // GENERATE COD TRANSACTION ID
                // ---------------------------------------------

                if (order.getPaymentTransactionId()
                        == null
                        || order.getPaymentTransactionId()
                                .trim()
                                .isEmpty()) {

                    order.setPaymentTransactionId(
                            "COD-"
                            + UUID.randomUUID()
                                    .toString()
                                    .substring(0, 8)
                                    .toUpperCase());
                }
            }


            // -------------------------------------------------
            // COMPLETE NEGOTIATION
            // -------------------------------------------------

            order.setHasActiveOffer(false);

            order.setNegotiationStatus(
                    NegotiationStatus.COMPLETED);


            // -------------------------------------------------
            // SAVE
            // -------------------------------------------------

            orderRepository
                    .saveAndFlush(order);


            return toResponse(order);
        }


        // =====================================================
        // CANCEL
        // =====================================================

        if (newStatus
                == OrderStatus.CANCELLED) {

            // -------------------------------------------------
            // DELIVERED
            // -------------------------------------------------

            if (currentStatus
                    == OrderStatus.DELIVERED) {

                throw new IllegalArgumentException(
                        "Delivered orders cannot be cancelled");
            }


            // -------------------------------------------------
            // ALREADY CANCELLED
            // -------------------------------------------------

            if (currentStatus
                    == OrderStatus.CANCELLED) {

                throw new IllegalArgumentException(
                        "Order is already cancelled");
            }


            // -------------------------------------------------
            // BUSINESSMAN
            // -------------------------------------------------

            if (isBusinessman
                    && currentStatus
                    != OrderStatus.PLACED) {

                throw new SecurityException(
                        "You can only cancel an order while it is still Placed");
            }


            // -------------------------------------------------
            // RETURN STOCK
            // -------------------------------------------------

            Produce produce =
                    order.getProduce();


            if (produce.getQuantity() == null) {

                produce.setQuantity(
                        order.getQuantityOrdered());

            } else {

                produce.setQuantity(
                        produce.getQuantity()
                                + order.getQuantityOrdered());
            }


            produceRepository
                    .saveAndFlush(produce);


            // -------------------------------------------------
            // UPDATE ORDER
            // -------------------------------------------------

            order.setStatus(
                    OrderStatus.CANCELLED);


            order.setHasActiveOffer(
                    false);


            order.setNegotiationStatus(
                    NegotiationStatus.COMPLETED);


            orderRepository
                    .saveAndFlush(order);


            return toResponse(order);
        }


        // =====================================================
        // ALL OTHER STATUS
        // FARMER ONLY
        // =====================================================

        if (!isFarmer) {

            throw new SecurityException(
                    "Only the farmer can update this order status");
        }


        // =====================================================
        // PREVENT AFTER DELIVERY
        // =====================================================

        if (currentStatus
                == OrderStatus.DELIVERED) {

            throw new IllegalArgumentException(
                    "Delivered orders cannot be changed");
        }


        // =====================================================
        // PREVENT AFTER CANCELLATION
        // =====================================================

        if (currentStatus
                == OrderStatus.CANCELLED) {

            throw new IllegalArgumentException(
                    "Cancelled orders cannot be changed");
        }


        // =====================================================
        // VALID TRANSITIONS
        // =====================================================

        boolean validTransition =

                (currentStatus
                        == OrderStatus.PLACED
                        && newStatus
                        == OrderStatus.CONFIRMED)

                ||

                (currentStatus
                        == OrderStatus.CONFIRMED
                        && newStatus
                        == OrderStatus.PREPARING)

                ||

                (currentStatus
                        == OrderStatus.PREPARING
                        && newStatus
                        == OrderStatus.READY)

                ||

                (currentStatus
                        == OrderStatus.READY
                        && newStatus
                        == OrderStatus.SHIPPED)

                ||

                (currentStatus
                        == OrderStatus.SHIPPED
                        && newStatus
                        == OrderStatus.OUT_FOR_DELIVERY);


        if (!validTransition) {

            throw new IllegalArgumentException(
                    "Invalid status change: "
                    + currentStatus
                    + " -> "
                    + newStatus);
        }


        // =====================================================
        // UPDATE STATUS
        // =====================================================

        order.setStatus(
                newStatus);


        // =====================================================
        // CONFIRMED
        // =====================================================

        if (newStatus
                == OrderStatus.CONFIRMED) {

            order.setExpectedDeliveryDate(
                    LocalDate.now()
                            .plusDays(3));
        }


        // =====================================================
        // SHIPPED
        // =====================================================

        if (newStatus
                == OrderStatus.SHIPPED) {

            order.setShippedAt(
                    LocalDateTime.now());
        }


        // =====================================================
        // OUT FOR DELIVERY
        // =====================================================

        if (newStatus
                == OrderStatus.OUT_FOR_DELIVERY) {

            LocalDateTime now =
                    LocalDateTime.now();


            order.setOutForDeliveryAt(
                    now);


            order.setEstimatedArrivalTime(
                    now.plusHours(1));
        }


        // =====================================================
        // SAVE
        // =====================================================

        orderRepository
                .saveAndFlush(order);


        return toResponse(order);
    }


    // =========================================================
    // BUSINESSMAN STATS
    // =========================================================

    public Map<String, Object> getMyStats(
            Authentication authentication) {

        User businessman =
                getCurrentUser(authentication);


        long totalOrders =
                orderRepository
                        .countByBusinessman(
                                businessman);


        long pendingOrders =
                orderRepository
                        .countByBusinessmanAndStatus(
                                businessman,
                                OrderStatus.PLACED);


        double totalSpent =
                orderRepository
                        .findByBusinessmanOrderByCreatedAtDesc(
                                businessman)

                        .stream()

                        .filter(order ->
                                order.getStatus()
                                        != OrderStatus.CANCELLED)

                        .mapToDouble(order -> {

                            if (order.getFinalPrice()
                                    != null) {

                                return order.getFinalPrice();
                            }


                            if (order.getTotalPrice()
                                    != null) {

                                return order.getTotalPrice();
                            }


                            return 0.0;
                        })

                        .sum();


        return Map.of(

                "totalOrders",
                totalOrders,

                "pendingOrders",
                pendingOrders,

                "totalSpent",
                totalSpent
        );
    }


    // =========================================================
    // FARMER STATS
    // =========================================================

    public Map<String, Object> getFarmerStats(
            Authentication authentication) {

        User farmer =
                getCurrentUser(authentication);


        long totalProducts =
                produceRepository
                        .findByFarmerId(
                                farmer.getId())
                        .size();


        long totalOrders =
                orderRepository
                        .countByProduce_Farmer(
                                farmer);


        long pendingOrders =
                orderRepository
                        .countByProduce_FarmerAndStatus(
                                farmer,
                                OrderStatus.PLACED);


        List<OrderResponse> recentOrders =
                orderRepository
                        .findByProduce_FarmerOrderByCreatedAtDesc(
                                farmer)

                        .stream()

                        .limit(5)

                        .map(this::toResponse)

                        .collect(Collectors.toList());


        return Map.of(

                "totalProducts",
                totalProducts,

                "totalOrders",
                totalOrders,

                "pendingOrders",
                pendingOrders,

                "recentOrders",
                recentOrders
        );
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
    // ORDER -> RESPONSE
    // =========================================================

    private OrderResponse toResponse(
            Order order) {

        OrderResponse response =
                new OrderResponse();


        // =====================================================
        // BASIC
        // =====================================================

        response.setId(
                order.getId());


        if (order.getProduce() != null) {

            response.setProduceName(
                    order.getProduce()
                            .getName());
        }


        response.setQuantityOrdered(
                order.getQuantityOrdered());


        // =====================================================
        // PRICE
        // =====================================================

        Double displayPrice =
                order.getFinalPrice() != null
                        ? order.getFinalPrice()
                        : order.getTotalPrice();


        response.setTotalPrice(
                displayPrice);


        // =====================================================
        // STATUS
        // =====================================================

        response.setStatus(
                order.getStatus());


        // =====================================================
        // BUSINESSMAN
        // =====================================================

        if (order.getBusinessman() != null) {

            response.setBusinessmanName(
                    order.getBusinessman()
                            .getName());
        }


        // =====================================================
        // FARMER
        // =====================================================

        if (order.getProduce() != null
                && order.getProduce()
                        .getFarmer() != null) {

            response.setFarmerName(
                    order.getProduce()
                            .getFarmer()
                            .getName());
        }


        // =====================================================
        // CREATED DATE
        // =====================================================

        response.setCreatedAt(
                order.getCreatedAt());


        // =====================================================
        // EXPECTED DELIVERY
        // =====================================================

        response.setExpectedDeliveryDate(
                order.getExpectedDeliveryDate());


        // =====================================================
        // DELIVERY LOCATION
        // =====================================================

        response.setDeliveryLatitude(
                order.getDeliveryLatitude());


        response.setDeliveryLongitude(
                order.getDeliveryLongitude());


        // =====================================================
        // CURRENT LOCATION
        // =====================================================

        response.setCurrentLatitude(
                order.getCurrentLatitude());


        response.setCurrentLongitude(
                order.getCurrentLongitude());


        // =====================================================
        // TRACKING
        // =====================================================

        response.setLastLocationUpdate(
                order.getLastLocationUpdate());


        response.setShippedAt(
                order.getShippedAt());


        response.setOutForDeliveryAt(
                order.getOutForDeliveryAt());


        response.setDeliveredAt(
                order.getDeliveredAt());


        // =====================================================
        // ETA
        // =====================================================

        response.setEstimatedArrivalTime(
                order.getEstimatedArrivalTime());


        // =====================================================
        // PAYMENT
        // =====================================================

        response.setPaymentMethod(
                order.getPaymentMethod());


        response.setPaymentStatus(
                order.getPaymentStatus());


        response.setPaymentTransactionId(
                order.getPaymentTransactionId());


        response.setPaidAt(
                order.getPaidAt());


        return response;
    }


    // =========================================================
    // GET OFFERS
    // =========================================================

    public List<OfferResponse> getOffersForOrder(
            Long orderId,
            Authentication authentication) {

        return offerService
                .getOffersForOrder(
                        orderId,
                        authentication);
    }


    // =========================================================
    // CAN NEGOTIATE
    // =========================================================

    @Transactional(readOnly = true)
    public boolean canNegotiate(
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


        // =====================================================
        // AUTHORIZATION
        // =====================================================

        boolean isBusinessOwner =
                order.getBusinessman() != null
                && order.getBusinessman()
                        .getId()
                        .equals(user.getId());


        boolean isFarmer =
                order.getProduce() != null
                && order.getProduce()
                        .getFarmer() != null
                && order.getProduce()
                        .getFarmer()
                        .getId()
                        .equals(user.getId());


        if (!isBusinessOwner && !isFarmer) {

            throw new SecurityException(
                    "Not authorized to view this order");
        }


        // =====================================================
        // NO NEGOTIATION AFTER PAYMENT
        // =====================================================

        if (order.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            return false;
        }


        // =====================================================
        // CANCELLED
        // =====================================================

        if (order.getStatus()
                == OrderStatus.CANCELLED) {

            return false;
        }


        // =====================================================
        // DELIVERED
        // =====================================================

        if (order.getStatus()
                == OrderStatus.DELIVERED) {

            return false;
        }


        // =====================================================
        // ONLY PLACED
        // =====================================================

        if (order.getStatus()
                != OrderStatus.PLACED) {

            return false;
        }


        // =====================================================
        // ACTIVE OFFER
        // =====================================================

        if (Boolean.TRUE.equals(
                order.getHasActiveOffer())) {

            return false;
        }


        // =====================================================
        // NEGOTIATION STATUS
        // =====================================================

        NegotiationStatus negotiationStatus =
                order.getNegotiationStatus();


        if (negotiationStatus == null) {

            negotiationStatus =
                    NegotiationStatus.NONE;
        }


        if (negotiationStatus
                == NegotiationStatus.COMPLETED) {

            return false;
        }


        return true;
    }
}