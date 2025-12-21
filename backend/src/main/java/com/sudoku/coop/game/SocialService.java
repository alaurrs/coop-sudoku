package com.sudoku.coop.game;

import com.sudoku.coop.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SocialService {
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final GameInvitationRepository invitationRepository;
    private final GameRepository gameRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public SocialService(UserRepository userRepository, 
                         FriendshipRepository friendshipRepository, 
                         FriendRequestRepository friendRequestRepository,
                         GameInvitationRepository invitationRepository, 
                         GameRepository gameRepository,
                         SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.invitationRepository = invitationRepository;
        this.gameRepository = gameRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public record FriendInfo(String id, String username, String avatar, String status) {}
    public record InviteInfo(Long id, String inviterName, String roomCode) {}
    public record FriendRequestInfo(Long id, String senderName, String status) {}

    public void updateActivity(String userId) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setLastSeenAt(Instant.now());
            userRepository.save(u);
        });
    }

    public List<FriendInfo> getFriends(String userId) {
        updateActivity(userId);
        List<FriendshipEntity> friendships = friendshipRepository.findByUserId(userId);
        
        return friendships.stream()
            .map(f -> userRepository.findById(f.getFriendId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(u -> {
                String status = "Offline";
                if (u.getLastSeenAt() != null && u.getLastSeenAt().isAfter(Instant.now().minusSeconds(300))) {
                    status = gameRepository.findActiveGameByUserId(u.getId()).isPresent() ? "In a game" : "Online";
                }
                return new FriendInfo(u.getId(), u.getUsername(), u.getAvatar(), status);
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public void sendFriendRequest(String userId, String targetUsername) {
        UserEntity receiver = userRepository.findByUsername(targetUsername)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (userId.equals(receiver.getId())) {
            throw new IllegalArgumentException("Cannot invite yourself");
        }

        if (friendshipRepository.findByUserIdAndFriendId(userId, receiver.getId()).isPresent()) {
            throw new IllegalArgumentException("Already friends");
        }

        Optional<FriendRequestEntity> existing = friendRequestRepository.findBySenderIdAndReceiverId(userId, receiver.getId());
        if (existing.isPresent()) {
            FriendRequestEntity req = existing.get();
            if (req.getStatus().equals("PENDING")) {
                throw new IllegalArgumentException("Request already pending");
            }
            req.setStatus("PENDING");
            friendRequestRepository.save(req);
            broadcastToUser(receiver.getId(), "FRIEND_REQUEST", new FriendRequestInfo(req.getId(), resolveUsername(userId), "PENDING"));
        } else {
            FriendRequestEntity req = friendRequestRepository.save(new FriendRequestEntity(userId, receiver.getId()));
            broadcastToUser(receiver.getId(), "FRIEND_REQUEST", new FriendRequestInfo(req.getId(), resolveUsername(userId), "PENDING"));
        }
    }

    @Transactional
    public void respondToFriendRequest(Long requestId, boolean accept) {
        FriendRequestEntity request = friendRequestRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        
        if (accept) {
            request.setStatus("ACCEPTED");
            if (friendshipRepository.findByUserIdAndFriendId(request.getSenderId(), request.getReceiverId()).isEmpty()) {
                friendshipRepository.save(new FriendshipEntity(request.getSenderId(), request.getReceiverId()));
                friendshipRepository.save(new FriendshipEntity(request.getReceiverId(), request.getSenderId()));
            }
        } else {
            request.setStatus("REJECTED");
        }
        friendRequestRepository.save(request);
        broadcastToUser(request.getSenderId(), "FRIEND_REQUEST_RESPONSE", request.getStatus());
    }

    public List<FriendRequestInfo> getPendingFriendRequests(String userId) {
        return friendRequestRepository.findByReceiverIdAndStatus(userId, "PENDING").stream()
            .map(req -> {
                String senderName = userRepository.findById(req.getSenderId())
                    .map(UserEntity::getUsername).orElse("Unknown");
                return new FriendRequestInfo(req.getId(), senderName, req.getStatus());
            })
            .collect(Collectors.toList());
    }

    public List<FriendInfo> searchUsers(String query, String currentUserId) {
        List<String> friendIds = friendshipRepository.findByUserId(currentUserId).stream()
            .map(FriendshipEntity::getFriendId)
            .collect(Collectors.toList());

        List<FriendRequestEntity> sentRequests = friendRequestRepository.findBySenderId(currentUserId);

        return userRepository.findAll().stream()
            .filter(u -> !u.getId().equals(currentUserId))
            .filter(u -> !friendIds.contains(u.getId()))
            .filter(u -> u.getUsername().toLowerCase().contains(query.toLowerCase()))
            .limit(10)
            .map(u -> {
                String status = "Not Friend";
                Optional<FriendRequestEntity> req = sentRequests.stream()
                    .filter(r -> r.getReceiverId().equals(u.getId()))
                    .findFirst();
                if (req.isPresent()) {
                    status = req.get().getStatus();
                }
                return new FriendInfo(u.getId(), u.getUsername(), u.getAvatar(), status);
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public void removeFriend(String userId, String friendId) {
        friendshipRepository.deleteByUserIdAndFriendId(userId, friendId);
        friendshipRepository.deleteByUserIdAndFriendId(friendId, userId);
        friendRequestRepository.findBySenderIdAndReceiverId(userId, friendId).ifPresent(friendRequestRepository::delete);
        friendRequestRepository.findBySenderIdAndReceiverId(friendId, userId).ifPresent(friendRequestRepository::delete);
    }

    public List<InviteInfo> getPendingInvites(String userId) {
        return invitationRepository.findByInviteeIdAndStatus(userId, "PENDING").stream()
            .map(inv -> {
                String inviterName = userRepository.findById(inv.getInviterId())
                    .map(UserEntity::getUsername).orElse("Unknown");
                return new InviteInfo(inv.getId(), inviterName, inv.getRoomCode());
            })
            .collect(Collectors.toList());
    }

    public void sendInvite(String inviterId, String inviteeName, String roomCode) {
        UserEntity invitee = userRepository.findByUsername(inviteeName)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        GameInvitationEntity invitation = new GameInvitationEntity(inviterId, invitee.getId(), roomCode);
        invitationRepository.save(invitation);
        
        broadcastToUser(invitee.getId(), "GAME_INVITE", new InviteInfo(invitation.getId(), resolveUsername(inviterId), roomCode));
    }

    public void respondToInvite(Long inviteId, boolean accept) {
        GameInvitationEntity invitation = invitationRepository.findById(inviteId).orElse(null);
        if (invitation == null) return;
        
        invitation.setStatus(accept ? "ACCEPTED" : "REJECTED");
        invitationRepository.save(invitation);
        broadcastToUser(invitation.getInviterId(), "INVITE_RESPONSE", invitation.getStatus());
    }

    public String findUsernameById(String userId) {
        return userRepository.findById(userId).map(UserEntity::getUsername).orElse("Unknown");
    }

    public String findAvatarById(String userId) {
        return userRepository.findById(userId).map(UserEntity::getAvatar).orElse("guest");
    }

    public void notifyFriendsOfUpdate(String userId) {
        List<FriendshipEntity> friendships = friendshipRepository.findByUserId(userId);
        System.out.println("SocialService: Notifying " + friendships.size() + " friends of user " + userId + " about profile update");
        for (FriendshipEntity f : friendships) {
            broadcastToUser(f.getFriendId(), "FRIEND_PROFILE_UPDATED", userId);
        }
    }

    private String resolveUsername(String userId) {
        return userRepository.findById(userId).map(UserEntity::getUsername).orElse("Unknown");
    }

    private void broadcastToUser(String userId, String type, Object payload) {
        messagingTemplate.convertAndSend("/topic/user/" + userId, new GameEvent(type, payload));
    }
}
