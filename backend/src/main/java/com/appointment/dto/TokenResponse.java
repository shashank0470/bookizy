package com.appointment.dto;


import lombok.Data;

@Data
public class TokenResponse {
    private Long id;
    private Integer tokenNumber;
    private String patientName;
    private Integer patientAge;
    private String status;
    private Boolean isOwn;
    private Integer estimatedTimeMinutes;
}
