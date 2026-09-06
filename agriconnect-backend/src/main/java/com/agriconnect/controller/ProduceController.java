package com.agriconnect.controller;

import com.agriconnect.dto.ProduceRequest;
import com.agriconnect.dto.ProduceResponse;
import com.agriconnect.service.ProduceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produce")
@RequiredArgsConstructor
public class ProduceController {

    private final ProduceService produceService;

    @PostMapping
    public ResponseEntity<?> addProduce(@Valid @RequestBody ProduceRequest request, Authentication authentication) {
        try {
            ProduceResponse response = produceService.addProduce(request, authentication);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProduceResponse>> getMyProduce(Authentication authentication) {
        return ResponseEntity.ok(produceService.getMyProduce(authentication));
    }

    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Object>> getMyStats(Authentication authentication) {
        long count = produceService.getMyProduceCount(authentication);
        return ResponseEntity.ok(Map.of("totalProducts", count));
    }

    @GetMapping("/browse/all")
    public ResponseEntity<List<ProduceResponse>> browseAllProduce() {
        return ResponseEntity.ok(produceService.getAllProduce());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduce(@PathVariable Long id, Authentication authentication) {
        try {
            produceService.deleteProduce(id, authentication);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduce(
            @PathVariable Long id,
            @Valid @RequestBody ProduceRequest request,
            Authentication authentication) {
        try {
            ProduceResponse response = produceService.updateProduce(id, request, authentication);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
