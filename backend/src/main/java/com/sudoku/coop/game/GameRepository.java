package com.sudoku.coop.game;

import com.sudoku.coop.model.GameEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.sudoku.coop.model.GameState;

@Repository
public interface GameRepository extends JpaRepository<GameEntity, String> {
    Optional<GameEntity> findByRoomCode(String roomCode);
    List<GameEntity> findByState(GameState state);
    
    @org.springframework.data.jpa.repository.Query("SELECT g FROM GameEntity g WHERE (g.hostId = :userId OR g.player2Id = :userId) AND g.state = 'IN_PROGRESS'")
    Optional<GameEntity> findActiveGameByUserId(String userId);
}
