package com.appointment.dto;


import lombok.Data;

@Data
public class QueueUpdateMessage {
    private Long clinicId;
    private String message;
    private Long timestamp;
}
