package com.portfolio.controller;

import com.portfolio.model.User;
import com.portfolio.service.AuthService;
import com.portfolio.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            log.info("Attempting to register user: {}", user.getUsername());
            User registeredUser = authService.register(user);
            
            // Generate token for newly registered user
            Authentication authentication = authService.login(user.getUsername(), user.getPassword());
            String jwt = tokenProvider.generateToken(authentication);
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", registeredUser);
            response.put("accessToken", jwt);
            response.put("tokenType", "Bearer");
            
            log.info("Successfully registered user: {}", registeredUser.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Failed to register user: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            log.info("Attempting to login user: {}", loginRequest.getUsername());
            Authentication authentication = authService.login(loginRequest.getUsername(), loginRequest.getPassword());
            
            String jwt = tokenProvider.generateToken(authentication);
            
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("tokenType", "Bearer");
            response.put("username", loginRequest.getUsername());
            
            log.info("Successfully logged in user: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to login user: {}", e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid credentials");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return authService.getCurrentUser()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}

@Data
class LoginRequest {
    private String username;
    private String password;
} 