package com.agriconnect.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChatRequest {
    private String message;
    private List<Message> conversationHistory;

    @Getter
    @Setter
    public static class Message {
        private String role;
        private String content;
    }
}