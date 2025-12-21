package com.sudoku.coop.game;

import com.sudoku.coop.model.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final SudokuGenerator generator;
    private final SimpMessagingTemplate messagingTemplate;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final SocialService socialService;
    
    private final Map<String, Suggestion> activeSuggestions = new ConcurrentHashMap<>();

    public GameService(SudokuGenerator generator, SimpMessagingTemplate messagingTemplate, 
                       GameRepository gameRepository, UserRepository userRepository,
                       SocialService socialService) {
        this.generator = generator;
        this.messagingTemplate = messagingTemplate;
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.socialService = socialService;
    }

    public List<GameSummary> getAvailableGames() {
        List<GameState> activeStates = Arrays.asList(GameState.WAITING, GameState.IN_PROGRESS);
        return gameRepository.findAll().stream()
            .filter(g -> activeStates.contains(g.getState()))
            .map(entity -> {
                String hostName = resolveUsername(entity.getHostId());
                return new GameSummary(
                    entity.getRoomCode(),
                    hostName,
                    entity.getDifficulty(),
                    entity.getState().name(),
                    entity.getPlayer2Id() == null ? 1 : 2,
                    entity.getCreatedAt().toEpochMilli()
                );
            })
            .collect(Collectors.toList());
    }

    public GameSession createGame(String userId, String difficulty) {
        String roomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        
        int holes = switch (difficulty.toUpperCase()) {
            case "EASY" -> 35;
            case "HARD" -> 55;
            default -> 45; // MEDIUM
        };
        
        var grid = generator.generate(holes);
        
        GameEntity entity = new GameEntity(roomCode, userId, grid.puzzle(), grid.solution(), difficulty.toUpperCase());
        gameRepository.save(entity);
        
        broadcastLobbyUpdate();
        return mapToSession(entity);
    }

    public GameSession joinGame(String roomCode, String userId) {
        GameEntity entity = gameRepository.findByRoomCode(roomCode)
            .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        if (entity.getPlayer2Id() != null && !entity.getPlayer2Id().equals(userId) && !entity.getHostId().equals(userId)) {
             throw new IllegalStateException("Room full");
        }

        if (!entity.getHostId().equals(userId) && entity.getPlayer2Id() == null) {
            entity.setPlayer2Id(userId);
            gameRepository.save(entity);
            broadcastLobbyUpdate();
        }
        
        GameSession session = mapToSession(entity);
        
        if (entity.getPlayer2Id() != null) {
            if (entity.getState() == GameState.WAITING) {
                entity.setState(GameState.IN_PROGRESS);
                gameRepository.save(entity);
                session.setState(GameState.IN_PROGRESS);
                broadcast(roomCode, "GAME_START", session);
                broadcastLobbyUpdate();
            } else {
                broadcast(roomCode, "PLAYER_JOINED", session);
            }
        }
        
        return session;
    }

    public void startGame(String roomCode) {
        GameEntity entity = gameRepository.findByRoomCode(roomCode).orElse(null);
        if (entity == null) return;
        
        entity.setState(GameState.IN_PROGRESS);
        gameRepository.save(entity);
        broadcast(roomCode, "GAME_START", mapToSession(entity));
        broadcastLobbyUpdate();
    }

    public void suggestMove(String roomCode, String userId, int row, int col, int value) {
        GameEntity entity = gameRepository.findByRoomCode(roomCode).orElse(null);
        if (entity == null || entity.getState() != GameState.IN_PROGRESS) return;

        boolean isSolo = entity.getPlayer2Id() == null; 
        
        if (isSolo) {
            applyMove(entity, row, col, value);
        } else {
            String username = resolveUsername(userId);
            String avatar = resolveAvatar(userId);
            var suggestion = new Suggestion(userId, username, avatar, row, col, value);
            activeSuggestions.put(roomCode, suggestion);
            broadcast(roomCode, "SUGGEST_MOVE", suggestion);
        }
    }

    public void confirmMove(String roomCode, String userId, boolean accepted) {
        var suggestion = activeSuggestions.get(roomCode);
        if (suggestion == null) return;
        
        if (suggestion.suggesterId().equals(userId)) return;

        if (accepted) {
            GameEntity entity = gameRepository.findByRoomCode(roomCode).orElse(null);
            if (entity != null) {
                applyMove(entity, suggestion.row(), suggestion.col(), suggestion.value());
            }
        } else {
            activeSuggestions.remove(roomCode);
            broadcast(roomCode, "REJECT_MOVE", null);
        }
    }

    public void surrenderGame(String roomCode, String userId) {
        GameEntity entity = gameRepository.findByRoomCode(roomCode).orElse(null);
        if (entity == null) return;
        
        entity.setState(GameState.COMPLETED);
        gameRepository.save(entity);
        broadcast(roomCode, "GAME_SURRENDERED", userId);
        broadcastLobbyUpdate();
    }

    private void applyMove(GameEntity entity, int row, int col, int value) {
        int[][] current = entity.getCurrentGridArray();
        int[][] solution = entity.getSolutionGridArray();
        
        current[row][col] = value;
        entity.setCurrentGridArray(current);
        
        boolean isCorrect = solution[row][col] == value;
        
        if (isCorrect && Arrays.deepEquals(current, solution)) {
            entity.setState(GameState.COMPLETED);
            broadcastLobbyUpdate();
        }
        
        gameRepository.save(entity);
        activeSuggestions.remove(entity.getRoomCode());

        var update = new MoveResult(
            row, col, value, isCorrect, 
            entity.getState() == GameState.COMPLETED
        );
        
        broadcast(entity.getRoomCode(), "CONFIRM_MOVE", update);
    }

    private GameSession mapToSession(GameEntity entity) {
        GameSession.PlayerInfo host = new GameSession.PlayerInfo(
            entity.getHostId(),
            resolveUsername(entity.getHostId()),
            resolveAvatar(entity.getHostId())
        );
            
        GameSession session = new GameSession(
            entity.getRoomCode(),
            entity.getCurrentGridArray(),
            entity.getSolutionGridArray(),
            host,
            entity.getState(),
            entity.getCreatedAt().toEpochMilli(),
            entity.getDifficulty()
        );
        
        if (entity.getPlayer2Id() != null) {
            session.addPlayer(new GameSession.PlayerInfo(
                entity.getPlayer2Id(),
                resolveUsername(entity.getPlayer2Id()),
                resolveAvatar(entity.getPlayer2Id())
            ));
        }
        
        session.setPendingSuggestion(activeSuggestions.get(entity.getRoomCode()));
        return session;
    }

    private String resolveUsername(String userId) {
        if (userId == null) return "Unknown";
        return userRepository.findById(userId)
            .map(UserEntity::getUsername)
            .orElse("Unknown");
    }

    private String resolveAvatar(String userId) {
        if (userId == null) return "guest";
        return userRepository.findById(userId)
            .map(UserEntity::getAvatar)
            .orElse("guest");
    }

    private void broadcastLobbyUpdate() {
        messagingTemplate.convertAndSend("/topic/lobby", getAvailableGames());
    }

    private void broadcast(String roomCode, String type, Object payload) {
        messagingTemplate.convertAndSend("/topic/game/" + roomCode, new GameEvent(type, payload));
    }
}
