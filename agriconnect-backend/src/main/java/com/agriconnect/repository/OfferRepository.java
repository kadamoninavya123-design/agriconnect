package com.agriconnect.repository;

import com.agriconnect.entity.Offer;
import com.agriconnect.entity.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByOrderId(Long orderId);

    List<Offer> findByOrderIdAndStatus(Long orderId, OfferStatus status);

    @Query("SELECT o FROM Offer o WHERE o.order.id = :orderId AND o.status = 'PENDING' ORDER BY o.createdAt DESC")
    Optional<Offer> findActiveOfferForOrder(@Param("orderId") Long orderId);

    @Query("SELECT o FROM Offer o WHERE o.order.id = :orderId ORDER BY o.createdAt DESC")
    List<Offer> findOfferHistoryForOrder(@Param("orderId") Long orderId);
}
