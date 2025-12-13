package com.appointment.dto;


import lombok.Data;

@Data
public class TokenBookingRequest {
    private String patientName;
    private Integer patientAge;
}

