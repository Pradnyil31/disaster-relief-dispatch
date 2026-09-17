package com.disasterrelief.backend.dto.request;

import com.disasterrelief.backend.model.DonationType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DonationPledgeRequest {

    @NotNull(message = "Donation type is required")
    private DonationType type;

    private Double amount;
    private String itemName;
    private Integer quantity;
}