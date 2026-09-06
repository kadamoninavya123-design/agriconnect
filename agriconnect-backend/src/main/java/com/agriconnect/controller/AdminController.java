package com.agriconnect.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agriconnect.dto.OrderResponse;
import com.agriconnect.dto.ProduceResponse;
import com.agriconnect.dto.UserResponse;
import com.agriconnect.entity.Order;
import com.agriconnect.entity.OrderStatus;
import com.agriconnect.entity.Produce;
import com.agriconnect.entity.User;
import com.agriconnect.repository.OrderRepository;
import com.agriconnect.repository.ProduceRepository;
import com.agriconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ProduceRepository produceRepository;
    private final OrderRepository orderRepository;


    // =========================================================
    // GET ALL ACTIVE USERS
    // =========================================================

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> responses =
                userRepository.findAll()
                        .stream()
                        .filter(user ->
                                Boolean.TRUE.equals(user.getActive()))
                        .map(user -> new UserResponse(
                                user.getId(),
                                user.getName(),
                                user.getEmail(),
                                user.getPhone(),
                                user.getRole()
                        ))
                        .toList();

        return ResponseEntity.ok(responses);
    }


    // =========================================================
    // DEACTIVATE USER
    // =========================================================

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        User user =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));

        /*
         * We are not physically deleting the user.
         *
         * Existing orders and products may reference
         * this user.
         */

        user.setActive(false);

        userRepository.save(user);

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // GET ALL AVAILABLE PRODUCE
    // =========================================================

    @GetMapping("/produce")
    public ResponseEntity<List<ProduceResponse>> getAllProduce() {

        List<ProduceResponse> responses =
                produceRepository.findAll()
                        .stream()
                        .filter(produce ->
                                Boolean.TRUE.equals(
                                        produce.getAvailable()))
                        .map(this::toProduceResponse)
                        .toList();

        return ResponseEntity.ok(responses);
    }


    // =========================================================
    // DEACTIVATE PRODUCE
    // =========================================================

    @DeleteMapping("/produce/{id}")
    public ResponseEntity<Void> deleteProduce(
            @PathVariable Long id) {

        Produce produce =
                produceRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"));

        /*
         * Do not physically delete produce because
         * existing orders may contain produce_id.
         */

        produce.setAvailable(false);

        produceRepository.save(produce);

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // GET ALL ORDERS
    // =========================================================

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        List<OrderResponse> responses =
                orderRepository.findAll()
                        .stream()
                        .map(this::toOrderResponse)
                        .toList();

        return ResponseEntity.ok(responses);
    }


    // =========================================================
    // ADMIN STATISTICS
    // =========================================================

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {

        // -----------------------------------------------------
        // TOTAL ACTIVE USERS
        // -----------------------------------------------------

        long totalUsers =
                userRepository.findAll()
                        .stream()
                        .filter(user ->
                                Boolean.TRUE.equals(
                                        user.getActive()))
                        .count();


        // -----------------------------------------------------
        // TOTAL AVAILABLE PRODUCTS
        // -----------------------------------------------------

        long totalProducts =
                produceRepository.findAll()
                        .stream()
                        .filter(produce ->
                                Boolean.TRUE.equals(
                                        produce.getAvailable()))
                        .count();


        // -----------------------------------------------------
        // TOTAL ORDERS
        // -----------------------------------------------------

        long totalOrders =
                orderRepository.count();


        // -----------------------------------------------------
        // TOTAL REVENUE
        // -----------------------------------------------------

        double totalRevenue =
                orderRepository.findAll()
                        .stream()
                        .filter(order ->
                                order.getStatus()
                                        != OrderStatus.CANCELLED)
                        .mapToDouble(order -> {

                            /*
                             * If negotiation happened,
                             * use final negotiated price.
                             */

                            if (order.getFinalPrice() != null) {
                                return order.getFinalPrice();
                            }

                            /*
                             * Otherwise use original price.
                             */

                            if (order.getTotalPrice() != null) {
                                return order.getTotalPrice();
                            }

                            return 0.0;
                        })
                        .sum();


        // -----------------------------------------------------
        // RETURN STATISTICS
        // -----------------------------------------------------

        return ResponseEntity.ok(
                Map.of(
                        "totalUsers",
                        totalUsers,

                        "totalProducts",
                        totalProducts,

                        "totalOrders",
                        totalOrders,

                        "totalRevenue",
                        totalRevenue
                )
        );
    }


    // =========================================================
    // CONVERT PRODUCE TO RESPONSE
    // =========================================================

    private ProduceResponse toProduceResponse(
            Produce produce) {

        return new ProduceResponse(
                produce.getId(),
                produce.getName(),
                produce.getCategory(),
                produce.getQuantity(),
                produce.getPrice(),
                produce.getImageUrl(),
                produce.getFarmer().getId(),
                produce.getFarmer().getName(),
                produce.getAvailable()
        );
    }


    // =========================================================
    // CONVERT ORDER TO RESPONSE
    // =========================================================

    private OrderResponse toOrderResponse(
            Order order) {

        /*
         * IMPORTANT:
         *
         * We are NOT using the long OrderResponse constructor.
         *
         * We create an empty OrderResponse and use setters.
         *
         * This avoids constructor mismatch errors.
         */

        OrderResponse response =
                new OrderResponse();


        // =====================================================
        // BASIC ORDER DETAILS
        // =====================================================

        response.setId(
                order.getId());

        response.setProduceName(
                order.getProduce().getName());

        response.setQuantityOrdered(
                order.getQuantityOrdered());


        // =====================================================
        // PRICE
        // =====================================================

        Double displayPrice;

        if (order.getFinalPrice() != null) {

            displayPrice =
                    order.getFinalPrice();

        } else {

            displayPrice =
                    order.getTotalPrice();
        }

        response.setTotalPrice(
                displayPrice);


        // =====================================================
        // ORDER STATUS
        // =====================================================

        response.setStatus(
                order.getStatus());


        // =====================================================
        // BUSINESSMAN
        // =====================================================

        if (order.getBusinessman() != null) {

            response.setBusinessmanName(
                    order.getBusinessman().getName());
        }


        // =====================================================
        // FARMER
        // =====================================================

        if (order.getProduce() != null
                && order.getProduce().getFarmer() != null) {

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
        // EXPECTED DELIVERY DATE
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
        // TRACKING TIMES
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
        // ESTIMATED ARRIVAL
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


        // =====================================================
        // RETURN
        // =====================================================

        return response;
    }
}