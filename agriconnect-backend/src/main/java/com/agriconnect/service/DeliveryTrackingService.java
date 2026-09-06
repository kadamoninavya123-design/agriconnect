package com.agriconnect.service;

import java.time.LocalDateTime;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agriconnect.dto.DeliveryLocationRequest;
import com.agriconnect.dto.DeliveryTrackingResponse;
import com.agriconnect.entity.Order;
import com.agriconnect.entity.User;
import com.agriconnect.repository.OrderRepository;
import com.agriconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryTrackingService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public DeliveryTrackingResponse updateLocation(
            Long orderId,
            DeliveryLocationRequest request,
            Authentication authentication) {

        User farmer = getCurrentUser(authentication);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        // Only the farmer who owns the produce can send GPS location
        if (!order.getProduce()
                .getFarmer()
                .getId()
                .equals(farmer.getId())) {

            throw new SecurityException(
                    "Only the farmer of this order can update delivery location");
        }

        if (request.getLatitude() == null
                || request.getLongitude() == null) {

            throw new IllegalArgumentException(
                    "Latitude and longitude are required");
        }

        if (request.getLatitude() < -90
                || request.getLatitude() > 90) {

            throw new IllegalArgumentException(
                    "Invalid latitude");
        }

        if (request.getLongitude() < -180
                || request.getLongitude() > 180) {

            throw new IllegalArgumentException(
                    "Invalid longitude");
        }

        order.setCurrentLatitude(request.getLatitude());
        order.setCurrentLongitude(request.getLongitude());
        order.setLastLocationUpdate(LocalDateTime.now());

        orderRepository.save(order);

        return toResponse(order);
    }

    public DeliveryTrackingResponse getTracking(
            Long orderId,
            Authentication authentication) {

        User user = getCurrentUser(authentication);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        boolean isFarmer =
                order.getProduce()
                        .getFarmer()
                        .getId()
                        .equals(user.getId());

        boolean isBusinessman =
                order.getBusinessman()
                        .getId()
                        .equals(user.getId());

        if (!isFarmer && !isBusinessman) {
            throw new SecurityException(
                    "You are not authorized to view this delivery");
        }

        return toResponse(order);
    }

    private User getCurrentUser(
            Authentication authentication) {

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"));
    }

    private DeliveryTrackingResponse toResponse(Order order) {

        return new DeliveryTrackingResponse(
                order.getId(),
                order.getStatus(),
                order.getDeliveryLatitude(),
                order.getDeliveryLongitude(),
                order.getCurrentLatitude(),
                order.getCurrentLongitude(),
                order.getExpectedDeliveryDate(),
                order.getEstimatedArrivalTime(),
                order.getLastLocationUpdate(),
                order.getShippedAt(),
                order.getOutForDeliveryAt(),
                order.getDeliveredAt()
        );
    }
}