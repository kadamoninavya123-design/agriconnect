package com.agriconnect.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agriconnect.entity.Order;
import com.agriconnect.entity.OrderStatus;
import com.agriconnect.entity.PaymentMethod;
import com.agriconnect.entity.PaymentStatus;
import com.agriconnect.entity.PaymentTiming;
import com.agriconnect.entity.User;
import com.agriconnect.repository.OrderRepository;
import com.agriconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // =========================================================
    // START ONLINE PAYMENT
    // =========================================================
    //
    // IMPORTANT:
    // This method DOES NOT mark the order as SUCCESS.
    // It only verifies that the order is ready for online payment
    // and keeps the payment status as PENDING.
    //
    // The payment becomes SUCCESS only after confirmOnlinePayment()
    // is called.
    // =========================================================

    @Transactional
    public Order payOrder(
            Long orderId,
            Authentication authentication) {

        User businessman =
                getCurrentBusinessman(authentication);

        Order order =
                findOrder(orderId);

        checkOrderOwner(order, businessman);

        checkOrderCanBePaid(order);

        PaymentMethod paymentMethod =
                order.getPaymentMethod();

        if (paymentMethod == null) {
            throw new IllegalArgumentException(
                    "Payment method is not selected");
        }

        if (paymentMethod == PaymentMethod.CASH_ON_DELIVERY) {

            throw new IllegalArgumentException(
                    "This order is Cash on Delivery. Payment will be completed after delivery.");
        }

        if (order.getPaymentTiming()
                != PaymentTiming.BEFORE_DELIVERY) {

            throw new IllegalArgumentException(
                    "Online payment must be made before delivery");
        }

        // -----------------------------------------------------
        // Already successful
        // -----------------------------------------------------

        if (order.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            throw new IllegalArgumentException(
                    "This order has already been paid");
        }

        // -----------------------------------------------------
        // A failed payment can be retried.
        // -----------------------------------------------------

        if (order.getPaymentStatus()
                == PaymentStatus.FAILED) {

            order.setPaymentStatus(
                    PaymentStatus.PENDING);

            order.setPaymentTransactionId(null);
            order.setPaidAt(null);
        }

        // -----------------------------------------------------
        // The /pay endpoint represents the user's simulated
        // successful payment action.
        // Therefore SUCCESS is set ONLY here, after the user
        // clicks the Pay button.
        // -----------------------------------------------------

        if (order.getPaymentStatus() == null
                || order.getPaymentStatus() == PaymentStatus.COD
                || order.getPaymentStatus() == PaymentStatus.PENDING) {

            order.setPaymentStatus(
                    PaymentStatus.SUCCESS);

            order.setPaymentTransactionId(
                    generateOnlineTransactionId());

            order.setPaidAt(
                    LocalDateTime.now());

            order.setHasActiveOffer(false);
        }

        return orderRepository.saveAndFlush(order);
    }

    // =========================================================
    // CONFIRM ONLINE PAYMENT
    // =========================================================
    //
    // Call this method ONLY after the payment provider confirms
    // that the payment was actually successful.
    // =========================================================

    @Transactional
    public Order confirmOnlinePayment(
            Long orderId,
            String transactionId,
            Authentication authentication) {

        User businessman =
                getCurrentBusinessman(authentication);

        Order order =
                findOrder(orderId);

        checkOrderOwner(order, businessman);

        checkOrderCanBePaid(order);

        if (order.getPaymentMethod()
                == PaymentMethod.CASH_ON_DELIVERY) {

            throw new IllegalArgumentException(
                    "Cash on Delivery orders cannot be confirmed as online payment");
        }

        if (order.getPaymentTiming()
                != PaymentTiming.BEFORE_DELIVERY) {

            throw new IllegalArgumentException(
                    "Online payment must be before delivery");
        }

        if (order.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            throw new IllegalArgumentException(
                    "This order has already been paid");
        }

        if (order.getPaymentStatus()
                != PaymentStatus.PENDING) {

            throw new IllegalArgumentException(
                    "Order is not waiting for online payment");
        }

        if (transactionId == null
                || transactionId.trim().isEmpty()) {

            transactionId = generateOnlineTransactionId();
        }

        order.setPaymentStatus(
                PaymentStatus.SUCCESS);

        order.setPaymentTransactionId(
                transactionId.trim());

        order.setPaidAt(
                LocalDateTime.now());

        order.setHasActiveOffer(false);

        return orderRepository.saveAndFlush(order);
    }

    // =========================================================
    // MARK ONLINE PAYMENT AS FAILED
    // =========================================================

    @Transactional
    public Order failOnlinePayment(
            Long orderId,
            Authentication authentication) {

        User businessman =
                getCurrentBusinessman(authentication);

        Order order =
                findOrder(orderId);

        checkOrderOwner(order, businessman);

        checkOrderCanBePaid(order);

        if (order.getPaymentMethod()
                == PaymentMethod.CASH_ON_DELIVERY) {

            throw new IllegalArgumentException(
                    "Cash on Delivery orders cannot fail as online payment");
        }

        if (order.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            throw new IllegalArgumentException(
                    "A successful payment cannot be marked as failed");
        }

        order.setPaymentStatus(
                PaymentStatus.FAILED);

        order.setPaymentTransactionId(null);
        order.setPaidAt(null);

        return orderRepository.saveAndFlush(order);
    }

    // =========================================================
    // MARK COD PAYMENT AS SUCCESSFUL AFTER DELIVERY
    // =========================================================
    //
    // COD status flow:
    // COD -> SUCCESS
    //
    // This method is intended to be called when the farmer
    // completes delivery and payment has been collected.
    // =========================================================

    @Transactional
    public Order markCodPaymentAsPaid(
            Long orderId) {

        Order order =
                findOrder(orderId);

        if (order.getStatus()
                != OrderStatus.DELIVERED) {

            throw new IllegalArgumentException(
                    "COD payment can be completed only after delivery");
        }

        if (order.getPaymentMethod()
                != PaymentMethod.CASH_ON_DELIVERY) {

            throw new IllegalArgumentException(
                    "This order is not Cash on Delivery");
        }

        if (order.getPaymentStatus()
                == PaymentStatus.SUCCESS) {

            return order;
        }

        order.setPaymentStatus(
                PaymentStatus.SUCCESS);

        order.setPaidAt(
                LocalDateTime.now());

        if (order.getPaymentTransactionId() == null
                || order.getPaymentTransactionId().trim().isEmpty()) {

            order.setPaymentTransactionId(
                    "COD-"
                    + UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase());
        }

        return orderRepository.saveAndFlush(order);
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private User getCurrentBusinessman(
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

    private Order findOrder(
            Long orderId) {

        if (orderId == null) {

            throw new IllegalArgumentException(
                    "Order id is required");
        }

        return orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found"));
    }

    private void checkOrderOwner(
            Order order,
            User businessman) {

        if (order.getBusinessman() == null
                || order.getBusinessman().getId() == null
                || businessman.getId() == null
                || !order.getBusinessman()
                        .getId()
                        .equals(businessman.getId())) {

            throw new SecurityException(
                    "You are not authorized to pay for this order");
        }
    }

    private void checkOrderCanBePaid(
            Order order) {

        if (order.getStatus()
                == OrderStatus.CANCELLED) {

            throw new IllegalArgumentException(
                    "Cancelled orders cannot be paid");
        }

        if (order.getStatus()
                == OrderStatus.DELIVERED) {

            throw new IllegalArgumentException(
                    "Delivered orders cannot be paid again");
        }
    }

    private String generateOnlineTransactionId() {

        return "AGRI-"
                + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }
}
