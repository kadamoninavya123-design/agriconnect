package com.agriconnect.repository;

import com.agriconnect.entity.Produce;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProduceRepository extends JpaRepository<Produce, Long> {
    List<Produce> findByFarmerId(Long farmerId);
}