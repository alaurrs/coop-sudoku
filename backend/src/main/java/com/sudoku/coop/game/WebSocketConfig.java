package com.sudoku.coop.game;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // On enregistre les deux variantes (avec et sans /api) pour parer à tout nettoyage de chemin par le proxy
        registry.addEndpoint("/ws-sudoku", "/api/ws-sudoku")
                .setAllowedOriginPatterns("*");
        
        registry.addEndpoint("/ws-sudoku", "/api/ws-sudoku")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
