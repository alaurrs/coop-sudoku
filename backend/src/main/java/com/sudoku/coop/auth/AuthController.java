package com.sudoku.coop.auth;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public record LoginRequest(String username, String password) {}
    public record GuestRequest(String username) {}

    @PostMapping("/register")
    public AuthService.AuthResponse register(@RequestBody LoginRequest req) {
        return authService.register(req.username(), req.password());
    }

    @PostMapping("/login")
    public AuthService.AuthResponse login(@RequestBody LoginRequest req) {
        return authService.login(req.username(), req.password());
    }

    @PostMapping("/guest")
    public AuthService.AuthResponse guest(@RequestBody GuestRequest req) {
        return authService.loginAsGuest(req.username());
    }
}
