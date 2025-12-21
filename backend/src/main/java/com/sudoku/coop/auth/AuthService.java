package com.sudoku.coop.auth;

import com.sudoku.coop.game.SocialService;
import com.sudoku.coop.game.UserRepository;
import com.sudoku.coop.model.UserEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final SocialService socialService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtService jwtService, SocialService socialService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.socialService = socialService;
    }

    public record AuthResponse(String token, String userId, String username) {}

    public AuthResponse register(String username, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }
        UserEntity user = new UserEntity(username, passwordEncoder.encode(password), false);
        userRepository.save(user);
        socialService.updateActivity(user.getId());
        return new AuthResponse(jwtService.generateToken(user.getId(), user.getUsername()), user.getId(), user.getUsername());
    }

    public AuthResponse login(String username, String password) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        socialService.updateActivity(user.getId());
        return new AuthResponse(jwtService.generateToken(user.getId(), user.getUsername()), user.getId(), user.getUsername());
    }

    public AuthResponse loginAsGuest(String requestedName) {
        String name = (requestedName == null || requestedName.isBlank()) 
            ? "Guest_" + UUID.randomUUID().toString().substring(0, 4) 
            : requestedName;
            
        // Check conflicts if user provided a name
        if (userRepository.findByUsername(name).isPresent()) {
             name = name + "_" + UUID.randomUUID().toString().substring(0, 4);
        }

        UserEntity user = new UserEntity(name, null, true);
        userRepository.save(user);
        socialService.updateActivity(user.getId());
        return new AuthResponse(jwtService.generateToken(user.getId(), user.getUsername()), user.getId(), user.getUsername());
    }
}
