package com.disasterrelief.backend.dto.response;

import com.disasterrelief.backend.model.RequestSource;
import com.disasterrelief.backend.model.RequestStatus;
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
public class SosResponse {
    private Long id;
    private Long citizenId;
    private String citizenName;
    private UrgencyLevel urgencyLevel;
    private RequestStatus status;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private java.util.List<com.disasterrelief.backend.model.ReliefItem> requiredSupplies;
    private RequestSource source;
    private String citizenPhone;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}