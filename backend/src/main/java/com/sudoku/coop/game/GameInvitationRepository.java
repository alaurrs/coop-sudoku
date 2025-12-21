package com.sudoku.coop.game;

import com.sudoku.coop.model.GameInvitationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GameInvitationRepository extends JpaRepository<GameInvitationEntity, Long> {
    List<GameInvitationEntity> findByInviteeIdAndStatus(String inviteeId, String status);
}
