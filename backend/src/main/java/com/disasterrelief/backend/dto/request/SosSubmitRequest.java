package com.disasterrelief.backend.dto.request;

import com.disasterrelief.backend.model.UrgencyLevel;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SosSubmitRequest {

    @NotNull(message = "Urgency level is required")
    private UrgencyLevel urgencyLevel;

    private Double latitude;
    private Double longitude;
    private String locationName;
    private java.util.List<com.disasterrelief.backend.model.ReliefItem> requiredSupplies;
    private String citizenPhone;
    private String notes;
}