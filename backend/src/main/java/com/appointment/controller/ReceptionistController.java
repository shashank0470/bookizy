package com.appointment.controller;

import com.appointment.dto.TokenResponse;
import com.appointment.entity.Token;
import com.appointment.repository.TokenRepository;
import com.appointment.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {

    private final TokenRepository tokenRepository;
    private final WebSocketService webSocketService;

    @GetMapping("/clinic/{clinicId}/queue")
    public ResponseEntity<List<TokenResponse>> getFullQueue(@PathVariable Long clinicId) {
        List<Token.Status> visibleStatuses = Arrays.asList(
                Token.Status.WAITING, Token.Status.ARRIVED, Token.Status.SERVING
        );

        List<Token> tokens = tokenRepository.findByClinicIdAndStatusInOrderByTokenNumberAsc(clinicId, visibleStatuses);

        List<TokenResponse> responses = tokens.stream()
                .map(this::buildFullTokenResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/token/{tokenId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long tokenId,
            @RequestBody Map<String, String> request) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        String statusStr = request.get("status").toUpperCase();
        token.setStatus(Token.Status.valueOf(statusStr));
        tokenRepository.save(token);

        webSocketService.notifyQueueUpdate(token.getClinic().getId());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/clinic/{clinicId}/serve-next")
    public ResponseEntity<?> serveNext(@PathVariable Long clinicId) {
        List<Token> waiting = tokenRepository.findByClinicIdAndStatusInOrderByTokenNumberAsc(
                clinicId, Arrays.asList(Token.Status.ARRIVED)
        );

        if (!waiting.isEmpty()) {
            Token nextToken = waiting.get(0);
            nextToken.setStatus(Token.Status.SERVING);
            tokenRepository.save(nextToken);

            webSocketService.notifyQueueUpdate(clinicId);
        }

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/token/{tokenId}")
    public ResponseEntity<?> removeToken(@PathVariable Long tokenId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        token.setStatus(Token.Status.CANCELLED);
        tokenRepository.save(token);

        webSocketService.notifyQueueUpdate(token.getClinic().getId());

        return ResponseEntity.ok().build();
    }

    private TokenResponse buildFullTokenResponse(Token token) {
        TokenResponse response = new TokenResponse();
        response.setId(token.getId());
        response.setTokenNumber(token.getTokenNumber());
        response.setPatientName(token.getPatientName());
        response.setPatientAge(token.getPatientAge());
        response.setStatus(token.getStatus().name().toLowerCase());
        response.setIsOwn(false);
        return response;
    }
}