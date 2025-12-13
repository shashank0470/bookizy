package com.appointment.service;

import com.appointment.dto.TokenBookingRequest;
import com.appointment.dto.TokenResponse;
import com.appointment.entity.Clinic;
import com.appointment.entity.Token;
import com.appointment.entity.User;
import com.appointment.repository.ClinicRepository;
import com.appointment.repository.TokenRepository;
import com.appointment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepository;
    private final ClinicRepository clinicRepository;
    private final UserRepository userRepository;
    private final WebSocketService webSocketService;

    @Transactional
    public TokenResponse bookToken(Long clinicId, Long userId, TokenBookingRequest request) {
        List<Token.Status> activeStatuses = Arrays.asList(
                Token.Status.WAITING, Token.Status.ARRIVED, Token.Status.SERVING
        );

        tokenRepository.findByClinicIdAndUserIdAndStatusIn(clinicId, userId, activeStatuses)
                .ifPresent(token -> {
                    throw new RuntimeException("You already have an active token");
                });

        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new RuntimeException("Clinic not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Integer maxToken = tokenRepository.findMaxTokenNumberForToday(clinicId).orElse(0);
        Integer newTokenNumber = maxToken + 1;

        Token token = new Token();
        token.setTokenNumber(newTokenNumber);
        token.setPatientName(request.getPatientName());
        token.setPatientAge(request.getPatientAge());
        token.setStatus(Token.Status.WAITING);
        token.setClinic(clinic);
        token.setUser(user);
        token.setCreatedAt(LocalDateTime.now());

        tokenRepository.save(token);

        webSocketService.notifyQueueUpdate(clinicId);

        return buildTokenResponse(token, userId);
    }

    public List<TokenResponse> getQueueForClinic(Long clinicId, Long userId) {
        List<Token.Status> visibleStatuses = Arrays.asList(
                Token.Status.WAITING, Token.Status.ARRIVED, Token.Status.SERVING
        );

        List<Token> tokens = tokenRepository.findByClinicIdAndStatusInOrderByTokenNumberAsc(clinicId, visibleStatuses);

        return tokens.stream()
                .map(token -> buildTokenResponse(token, userId))
                .collect(Collectors.toList());
    }

    public TokenResponse getMyToken(Long clinicId, Long userId) {
        List<Token.Status> activeStatuses = Arrays.asList(
                Token.Status.WAITING, Token.Status.ARRIVED, Token.Status.SERVING
        );

        return tokenRepository.findByClinicIdAndUserIdAndStatusIn(clinicId, userId, activeStatuses)
                .map(token -> buildTokenResponse(token, userId))
                .orElse(null);
    }

    @Transactional
    public void cancelToken(Long tokenId, Long userId) {
        Token token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        if (!token.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        token.setStatus(Token.Status.CANCELLED);
        tokenRepository.save(token);

        webSocketService.notifyQueueUpdate(token.getClinic().getId());
    }

    private TokenResponse buildTokenResponse(Token token, Long currentUserId) {
        TokenResponse response = new TokenResponse();
        response.setId(token.getId());
        response.setTokenNumber(token.getTokenNumber());
        response.setStatus(token.getStatus().name().toLowerCase());

        boolean isOwnToken = token.getUser().getId().equals(currentUserId);
        if (isOwnToken) {
            response.setPatientName(token.getPatientName());
            response.setPatientAge(token.getPatientAge());
        }

        response.setIsOwn(isOwnToken);

        int estimatedTime = calculateEstimatedTime(token);
        response.setEstimatedTimeMinutes(estimatedTime);

        return response;
    }

    private int calculateEstimatedTime(Token token) {
        List<Token.Status> activeStatuses = Arrays.asList(
                Token.Status.WAITING, Token.Status.ARRIVED, Token.Status.SERVING
        );

        long patientsAhead = tokenRepository.countByClinicIdAndStatusInAndTokenNumberLessThan(
                token.getClinic().getId(), activeStatuses, token.getTokenNumber()
        );

        return (int) (patientsAhead * token.getClinic().getAvgTimePerPatient());
    }
}