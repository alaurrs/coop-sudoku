package com.sudoku.coop.game;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/social")
public class SocialController {
    private final SocialService socialService;

    public SocialController(SocialService socialService) {
        this.socialService = socialService;
    }

    @GetMapping("/friends")
    public List<SocialService.FriendInfo> getFriends(@RequestParam String userId) {
        return socialService.getFriends(userId);
    }

    @GetMapping("/invites")
    public List<SocialService.InviteInfo> getInvites(@RequestParam String userId) {
        return socialService.getPendingInvites(userId);
    }

    @PostMapping("/invite")
    public void invite(@RequestParam String inviterId, @RequestParam String inviteeName, @RequestParam String roomCode) {
        socialService.sendInvite(inviterId, inviteeName, roomCode);
    }

    @PostMapping("/invite/{id}/respond")
    public void respond(@PathVariable Long id, @RequestParam boolean accept) {
        socialService.respondToInvite(id, accept);
    }

    @GetMapping("/search")
    public List<SocialService.FriendInfo> search(@RequestParam String query, @RequestParam String userId) {
        return socialService.searchUsers(query, userId);
    }

    @GetMapping("/friend-requests")
    public List<SocialService.FriendRequestInfo> getFriendRequests(@RequestParam String userId) {
        return socialService.getPendingFriendRequests(userId);
    }

    @PostMapping("/friend-request/send")
    public void sendFriendRequest(@RequestParam String userId, @RequestParam String friendUsername) {
        socialService.sendFriendRequest(userId, friendUsername);
    }

    @PostMapping("/friend-request/{id}/respond")
    public void respondToFriendRequest(@PathVariable Long id, @RequestParam boolean accept) {
        socialService.respondToFriendRequest(id, accept);
    }

    @DeleteMapping("/remove-friend")
    public void removeFriend(@RequestParam String userId, @RequestParam String friendId) {
        socialService.removeFriend(userId, friendId);
    }
}
