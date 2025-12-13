package com.appointment.controller;

import com.appointment.dto.TokenBookingRequest;
import com.appointment.dto.TokenResponse;
import com.appointment.entity.User;
import com.appointment.repository.UserRepository;
import com.appointment.service.TokenService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tokens")
@RequiredArgsConstructor
public class TokenController {

    private final TokenService tokenService;
    private final UserRepository userRepository;

    @PostMapping("/clinic/{clinicId}")
    public ResponseEntity<TokenResponse> bookToken(
            @PathVariable Long clinicId,
            @RequestBody TokenBookingRequest request,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(tokenService.bookToken(clinicId, userId, request));
    }

    @GetMapping("/clinic/{clinicId}/queue")
    public ResponseEntity<List<TokenResponse>> getQueue(
            @PathVariable Long clinicId,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(tokenService.getQueueForClinic(clinicId, userId));
    }

    @GetMapping("/clinic/{clinicId}/my-token")
    public ResponseEntity<TokenResponse> getMyToken(
            @PathVariable Long clinicId,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(tokenService.getMyToken(clinicId, userId));
    }

    @DeleteMapping("/{tokenId}")
    public ResponseEntity<?> cancelToken(
            @PathVariable Long tokenId,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        tokenService.cancelToken(tokenId, userId);
        return ResponseEntity.ok().build();
    }

    private Long extractUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}