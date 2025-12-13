package com.appointment.service;

import com.appointment.dto.QueueUpdateMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyQueueUpdate(Long clinicId) {
        QueueUpdateMessage message = new QueueUpdateMessage();
        message.setClinicId(clinicId);
        message.setMessage("Queue updated");
        message.setTimestamp(System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/clinic/" + clinicId, message);
    }
}