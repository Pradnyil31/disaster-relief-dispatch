package com.disasterrelief.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DispatchRequest {

    @NotNull(message = "SOS Request ID is required")
    private Long sosRequestId;

    @NotNull(message = "Volunteer ID is required")
    private Long volunteerId;

    private java.util.List<DispatchInventoryRequest> inventoryAllocations;
    private String notes;
}