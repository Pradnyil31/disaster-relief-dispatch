package com.disasterrelief.backend.dto.response;

import com.disasterrelief.backend.model.TaskStatus;
import com.disasterrelief.backend.model.UrgencyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DispatchResponse {
    private Long id;
    private Long sosRequestId;
    private String citizenName;
    private String locationAddress;
    private UrgencyLevel urgencyLevel;
    private Long volunteerId;
    private String volunteerName;
    private TaskStatus status;
    private String notes;
    private LocalDateTime assignedAt;
    private LocalDateTime deliveredAt;
}