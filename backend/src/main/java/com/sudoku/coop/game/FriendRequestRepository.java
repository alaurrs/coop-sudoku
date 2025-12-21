package com.sudoku.coop.game;

import com.sudoku.coop.model.FriendRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequestEntity, Long> {
    List<FriendRequestEntity> findByReceiverIdAndStatus(String receiverId, String status);
    List<FriendRequestEntity> findBySenderId(String senderId);
    Optional<FriendRequestEntity> findBySenderIdAndReceiverId(String senderId, String receiverId);
}
