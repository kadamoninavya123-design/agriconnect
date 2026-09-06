package com.agriconnect.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.agriconnect.dto.ProduceRequest;
import com.agriconnect.dto.ProduceResponse;
import com.agriconnect.entity.Produce;
import com.agriconnect.entity.User;
import com.agriconnect.repository.OrderRepository;
import com.agriconnect.repository.ProduceRepository;
import com.agriconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProduceService {

    private final OrderRepository orderRepository;
    private final ProduceRepository produceRepository;
    private final UserRepository userRepository;

    public ProduceResponse addProduce(
            ProduceRequest request,
            Authentication authentication) {

        User farmer = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("Farmer not found"));

        Produce produce = Produce.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .imageUrl(request.getImageUrl())
                .available(true)
                .farmer(farmer)
                .build();

        Produce saved = produceRepository.save(produce);

        return toResponse(saved);
    }

    public List<ProduceResponse> getMyProduce(
            Authentication authentication) {

        User farmer = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("Farmer not found"));

        return produceRepository.findByFarmerId(farmer.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get only available products for the Business marketplace
    public List<ProduceResponse> getAllProduce() {

        return produceRepository.findAll()
                .stream()
                .filter(Produce::getAvailable)
                .map(this::toResponse)
                .toList();
    }

    public void deleteProduce(
            Long id,
            Authentication authentication) {

        Produce produce = produceRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Produce not found"));

        // Check whether the logged-in farmer owns this product
        if (!produce.getFarmer().getEmail()
                .equals(authentication.getName())) {

            throw new IllegalArgumentException(
                    "You can only delete your own produce"
            );
        }

        /*
         * If the product has existing orders, we should NOT
         * physically delete it because the orders table still
         * references this product.
         *
         * Instead, mark the product as unavailable.
         */
        if (orderRepository.existsByProduce(produce)) {

            produce.setAvailable(false);

            produceRepository.save(produce);

            return;
        }

        /*
         * If the product has no existing orders,
         * permanently delete it from the database.
         */
        produceRepository.delete(produce);
    }

    public ProduceResponse updateProduce(
            Long id,
            ProduceRequest request,
            Authentication authentication) {

        Produce produce = produceRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Produce not found"));

        // Check whether the logged-in farmer owns this product
        if (!produce.getFarmer().getEmail()
                .equals(authentication.getName())) {

            throw new IllegalArgumentException(
                    "You can only update your own produce"
            );
        }

        if (request.getName() != null) {
            produce.setName(request.getName());
        }

        if (request.getDescription() != null) {
            produce.setDescription(request.getDescription());
        }

        if (request.getCategory() != null) {
            produce.setCategory(request.getCategory());
        }

        if (request.getPrice() != null) {
            produce.setPrice(request.getPrice());
        }

        if (request.getImageUrl() != null) {
            produce.setImageUrl(request.getImageUrl());
        }

        if (request.getQuantity() != null) {
            produce.setQuantity(request.getQuantity());

            if (request.getQuantity() > 0) {
                produce.setAvailable(true);
            } else {
                produce.setAvailable(false);
            }
        }

        Produce saved = produceRepository.save(produce);

        return toResponse(saved);
    }

    public long getMyProduceCount(
            Authentication authentication) {

        User farmer = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("Farmer not found"));

        return produceRepository
                .findByFarmerId(farmer.getId())
                .size();
    }

    private ProduceResponse toResponse(Produce produce) {

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
}