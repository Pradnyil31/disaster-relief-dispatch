package com.disasterrelief.backend.dto.response;

import com.disasterrelief.backend.model.DonationStatus;
import com.disasterrelief.backend.model.DonationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DonationResponse {
    private Long id;
    private Long donorId;
    private String donorName;
    private DonationType type;
    private Double amount;
    private String itemName;
    private Integer quantity;
    private DonationStatus status;
    private String transactionId;
    private String razorpayOrderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}