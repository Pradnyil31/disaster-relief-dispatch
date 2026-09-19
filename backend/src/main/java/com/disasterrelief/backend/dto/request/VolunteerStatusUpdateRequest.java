package com.disasterrelief.backend.dto.request;

import com.disasterrelief.backend.model.VolunteerStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VolunteerStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private VolunteerStatus status;
}
