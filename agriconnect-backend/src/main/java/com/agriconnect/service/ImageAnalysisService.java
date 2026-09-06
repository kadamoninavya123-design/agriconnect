package com.agriconnect.service;

import com.agriconnect.dto.ImageDetectionResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Random;

@Service
public class ImageAnalysisService {

    private final Random random = new Random();

    // Placeholder implementation — returns realistic mock detection results.
    // Replace this method's body later with a real call to a vision-capable
    // LLM API (Claude/OpenAI) once you're ready to wire that up.
    public ImageDetectionResponse analyzeImage(MultipartFile image) {
        String[] sampleNames = {"Tomatoes", "Onions", "Spinach", "Carrots", "Potatoes"};
        String[] sampleCategories = {"Vegetables", "Vegetables", "Leafy Greens", "Vegetables", "Vegetables"};

        int index = random.nextInt(sampleNames.length);
        double confidence = 0.75 + (random.nextDouble() * 0.2); // 0.75 - 0.95
        double freshnessScore = 0.6 + (random.nextDouble() * 0.35); // 0.60 - 0.95

        String freshnessLabel = freshnessScore >= 0.85 ? "Looks fresh"
                : freshnessScore >= 0.65 ? "Moderate — check before listing"
                : "May need a closer look";

        return new ImageDetectionResponse(
                sampleNames[index],
                sampleCategories[index],
                Math.round(confidence * 100.0) / 100.0,
                Math.round(freshnessScore * 100.0) / 100.0,
                freshnessLabel
        );
    }
}