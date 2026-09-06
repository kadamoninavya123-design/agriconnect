package com.agriconnect.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agriconnect.entity.Order;
import com.agriconnect.entity.OrderStatus;
import com.agriconnect.entity.Produce;
import com.agriconnect.entity.User;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByBusinessmanOrderByCreatedAtDesc(User businessman);

    List<Order> findByProduce_FarmerOrderByCreatedAtDesc(User farmer);

    long countByBusinessman(User businessman);

    long countByProduce_Farmer(User farmer);

    long countByBusinessmanAndStatus(
            User businessman,
            OrderStatus status
    );

    long countByProduce_FarmerAndStatus(
            User farmer,
            OrderStatus status
    );

    // Check whether a produce has existing orders
    boolean existsByProduce(Produce produce);
}