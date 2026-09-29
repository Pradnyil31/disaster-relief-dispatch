package com.disasterrelief.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DispatchAllocationResponse {
    private Long id;
    private Long inventoryItemId;
    private String inventoryItemName;
    private Integer quantity;
}
