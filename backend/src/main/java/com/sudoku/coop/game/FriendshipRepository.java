package com.sudoku.coop.game;

import com.sudoku.coop.model.FriendshipEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<FriendshipEntity, Long> {
    List<FriendshipEntity> findByUserId(String userId);
    Optional<FriendshipEntity> findByUserIdAndFriendId(String userId, String friendId);
    void deleteByUserIdAndFriendId(String userId, String friendId);
}