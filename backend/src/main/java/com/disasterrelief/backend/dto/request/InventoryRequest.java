package com.disasterrelief.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.disasterrelief.backend.model.ReliefItem;

@Data
public class InventoryRequest {

    @NotBlank(message = "Item name is required")
    private String name;

    @NotNull(message = "Category is required")
    private ReliefItem category;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Minimum threshold is required")
    @Min(value = 0, message = "Minimum threshold cannot be negative")
    private Integer minimumThreshold;
}