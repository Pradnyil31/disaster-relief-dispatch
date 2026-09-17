package com.disasterrelief.backend.dto.request;

import com.disasterrelief.backend.model.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DispatchStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;

    private String notes;
}