package com.sudoku.coop.auth;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public record LoginRequest(String username, String password) {}
    public record RegisterRequest(String username, String password, String avatar) {}
    public record GuestRequest(String username) {}

    @PostMapping("/register")
    public AuthService.AuthResponse register(@RequestBody RegisterRequest req) {
        return authService.register(req.username(), req.password(), req.avatar());
    }

    @PostMapping("/login")
    public AuthService.AuthResponse login(@RequestBody LoginRequest req) {
        return authService.login(req.username(), req.password());
    }

        @PostMapping("/guest")

        public AuthService.AuthResponse guest(@RequestBody GuestRequest req) {

            return authService.loginAsGuest(req.username());

        }

    

        public record UpdateAvatarRequest(String userId, String avatar) {}

    

        @PostMapping("/update-avatar")

        public AuthService.AuthResponse updateAvatar(@RequestBody UpdateAvatarRequest req) {

            return authService.updateAvatar(req.userId(), req.avatar());

        }

    }

    