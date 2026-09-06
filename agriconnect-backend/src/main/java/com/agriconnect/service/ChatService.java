package com.agriconnect.service;

import com.agriconnect.dto.ChatRequest;
import com.agriconnect.dto.ChatResponse;
import com.agriconnect.entity.Produce;
import com.agriconnect.repository.ProduceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ProduceRepository produceRepository;

    public ChatResponse handleMessage(ChatRequest request) {
        String message = request.getMessage() == null ? "" : request.getMessage().toLowerCase();
        List<Produce> allProduce = produceRepository.findAll();

        String reply;
        List<Produce> matches;

        if (message.contains("cheap") || message.contains("price") || message.contains("low")) {
            matches = allProduce.stream()
                    .sorted(Comparator.comparingDouble(Produce::getPrice))
                    .limit(3)
                    .toList();
            reply = matches.isEmpty()
                    ? "There are no listings available right now."
                    : "Here are some of the best-priced items available right now.";
        } else if (message.contains("fresh") || message.contains("new") || message.contains("today")) {
            matches = allProduce.stream()
                    .sorted(Comparator.comparingLong(Produce::getId).reversed())
                    .limit(3)
                    .toList();
            reply = matches.isEmpty()
                    ? "There are no listings available right now."
                    : "These are the most recently added listings.";
        } else if (message.contains("hello") || message.contains("hi")) {
            matches = List.of();
            reply = "Hi! Ask me what's fresh, cheap, or in season right now.";
        } else {
            String category = extractMatchingCategory(message, allProduce);
            if (category != null) {
                matches = allProduce.stream()
                        .filter(p -> category.equalsIgnoreCase(p.getCategory()))
                        .limit(5)
                        .toList();
                reply = "Here's what's available in " + category + ".";
            } else {
                matches = allProduce.stream().limit(3).toList();
                reply = "I can help you find produce by freshness, price, or category — try asking 'what's cheap today?'";
            }
        }

        List<ChatResponse.SuggestedProduce> suggestions = matches.stream()
                .map(p -> new ChatResponse.SuggestedProduce(p.getId(), p.getName(), p.getPrice(), "kg"))
                .toList();

        return new ChatResponse(reply, suggestions);
    }

    private String extractMatchingCategory(String message, List<Produce> allProduce) {
        return allProduce.stream()
                .map(Produce::getCategory)
                .filter(cat -> cat != null && message.contains(cat.toLowerCase()))
                .findFirst()
                .orElse(null);
    }
}