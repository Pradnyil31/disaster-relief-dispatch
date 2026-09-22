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
    private Long sosId;
    private String citizenName;
    private String citizenPhone;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private UrgencyLevel urgencyLevel;
    private java.util.List<com.disasterrelief.backend.model.ReliefItem> requiredSupplies;
    private Long volunteerId;
    private String volunteerName;
    private String volunteerPhone;
    private TaskStatus status;
    private String notes; // Dispatch / Volunteer notes
    private String citizenNotes; // Original SOS notes
    private LocalDateTime assignedAt;
    private LocalDateTime enRouteAt;
    private LocalDateTime deliveredAt;
    private java.util.List<com.disasterrelief.backend.model.TaskStatusLog> history;
}