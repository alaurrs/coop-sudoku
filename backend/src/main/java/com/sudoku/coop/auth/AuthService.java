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

    public record AuthResponse(String token, String userId, String username, String avatar) {}

    public AuthResponse register(String username, String password, String avatar) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }
        UserEntity user = new UserEntity(username, passwordEncoder.encode(password), false);
        user.setAvatar(avatar);
        userRepository.save(user);
        socialService.updateActivity(user.getId());
        return mapToResponse(user);
    }

    public AuthResponse login(String username, String password) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        socialService.updateActivity(user.getId());
        return mapToResponse(user);
    }

    public AuthResponse loginAsGuest(String requestedName) {
        String name = (requestedName == null || requestedName.isBlank()) 
            ? "Guest_" + UUID.randomUUID().toString().substring(0, 4) 
            : requestedName;
            
        if (userRepository.findByUsername(name).isPresent()) {
             name = name + "_" + UUID.randomUUID().toString().substring(0, 4);
        }

        UserEntity user = new UserEntity(name, null, true);
        // Default avatar for guests
        user.setAvatar("guest");
        userRepository.save(user);
        socialService.updateActivity(user.getId());
        return mapToResponse(user);
    }

        private AuthResponse mapToResponse(UserEntity user) {

            String token = jwtService.generateToken(user.getId(), user.getUsername());

            return new AuthResponse(token, user.getId(), user.getUsername(), user.getAvatar());

        }

    

            public AuthResponse updateAvatar(String userId, String avatar) {

    

                UserEntity user = userRepository.findById(userId)

    

                        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    

                user.setAvatar(avatar);

    

                userRepository.save(user);

    

                

    

                // Notify all friends that they need to refresh their list

    

                socialService.notifyFriendsOfUpdate(userId);

    

                

    

                return mapToResponse(user);

    

            }

    

        }

    

        

    