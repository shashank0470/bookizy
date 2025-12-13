package com.appointment.repository;

import com.appointment.entity.Token;
import com.appointment.entity.Token.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    List<Token> findByClinicIdAndStatusInOrderByTokenNumberAsc(Long clinicId, List<Status> statuses);

    Optional<Token> findByClinicIdAndUserIdAndStatusIn(Long clinicId, Long userId, List<Status> statuses);

    @Query("SELECT MAX(t.tokenNumber) FROM Token t WHERE t.clinic.id = :clinicId AND t.createdAt >= CURRENT_DATE")
    Optional<Integer> findMaxTokenNumberForToday(Long clinicId);

    long countByClinicIdAndStatusInAndTokenNumberLessThan(Long clinicId, List<Status> statuses, Integer tokenNumber);
}