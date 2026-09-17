package com.disasterrelief.backend.dto.request;

import com.disasterrelief.backend.model.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SosStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private RequestStatus status;
}