package com.sudoku.coop.game;

import com.sudoku.coop.model.*;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/game", "/game"})
public class GameController {

    private final GameService gameService;
    private final SocialService socialService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public GameController(GameService gameService, SocialService socialService, org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.socialService = socialService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/ping")
    public String ping() {
        System.out.println("Ping received!");
        return "pong";
    }

    @PostMapping("/create")
    public GameSession create(@RequestParam String difficulty, @RequestParam String userId) {
        System.out.println("Received create request: difficulty=" + difficulty + ", userId=" + userId);
        socialService.updateActivity(userId);
        try {
            return gameService.createGame(userId, difficulty);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/{roomId}/join")
    public GameSession join(@PathVariable String roomId, @RequestParam String userId) {
        socialService.updateActivity(userId);
        return gameService.joinGame(roomId, userId);
    }

    @PostMapping("/{roomId}/start")
    public void startGame(@PathVariable String roomId) {
        gameService.startGame(roomId);
    }

    @PostMapping("/{roomId}/surrender")
    public void surrender(@PathVariable String roomId, @RequestParam String userId) {
        gameService.surrenderGame(roomId, userId);
    }

    @GetMapping("/lobbies")
    public java.util.List<GameSummary> getLobbies() {
        return gameService.getAvailableGames();
    }

    // WebSocket Endpoints
    // Client sends to: /app/game/{roomId}/suggest
    @MessageMapping("/game/{roomId}/suggest")
    public void suggest(@DestinationVariable String roomId, @Payload SuggestionRequest req) {
        socialService.updateActivity(req.userId());
        gameService.suggestMove(roomId, req.userId(), req.row(), req.col(), req.value());
    }

    // Client sends to: /app/game/{roomId}/confirm
        @MessageMapping("/game/{roomId}/confirm")
        public void confirm(@DestinationVariable String roomId, @Payload ConfirmationRequest req) {
            socialService.updateActivity(req.userId());
            gameService.confirmMove(roomId, req.userId(), req.accepted());
        }
    
        @MessageMapping("/game/{roomId}/cursor")
        public void cursor(@DestinationVariable String roomId, @Payload CursorPosition req) {
            // Broadcast directly to topic to avoid unnecessary DB calls for cursor tracking
            messagingTemplate.convertAndSend("/topic/game/" + roomId, 
                new GameEvent("CURSOR_MOVE", req)
            );
        }
    
        @MessageMapping("/game/{roomId}/chat")
                public void chat(@DestinationVariable String roomId, @Payload ChatRequest req) {

                String username = socialService.findUsernameById(req.userId());

                String avatar = socialService.findAvatarById(req.userId());

                // Broadcast directly to topic

                messagingTemplate.convertAndSend("/topic/game/" + roomId, 

                    new GameEvent("GAME_CHAT", new ChatMessage(req.userId(), username, avatar, req.message(), System.currentTimeMillis()))

                );

            }

        }

        

    