package com.disasterrelief.backend.dto.request;

import lombok.Data;

@Data
public class DispatchInventoryRequest {
    private Long inventoryItemId;
    private Integer quantityDeducted;
}
