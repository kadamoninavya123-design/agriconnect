package com.agriconnect.controller;

import com.agriconnect.dto.ImageDetectionResponse;
import com.agriconnect.service.ImageAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/produce")
@RequiredArgsConstructor
public class ProductImageController {

    private final ImageAnalysisService imageAnalysisService;

    @PostMapping("/detect-image")
    public ResponseEntity<ImageDetectionResponse> detectImage(@RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(imageAnalysisService.analyzeImage(image));
    }
}