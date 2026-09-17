package com.disasterrelief.backend.service;

import com.disasterrelief.backend.dto.request.DonationPledgeRequest;
import com.disasterrelief.backend.dto.request.InventoryRequest;
import com.disasterrelief.backend.dto.response.DonationResponse;
import com.disasterrelief.backend.exception.BusinessRuleException;
import com.disasterrelief.backend.exception.ResourceNotFoundException;
import com.disasterrelief.backend.model.*;
import com.disasterrelief.backend.repository.DonationRepository;
import com.disasterrelief.backend.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final PaymentGatewayService paymentGatewayService;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;

    public DonationService(DonationRepository donationRepository,
                           PaymentGatewayService paymentGatewayService,
                           InventoryRepository inventoryRepository,
                           InventoryService inventoryService) {
        this.donationRepository = donationRepository;
        this.paymentGatewayService = paymentGatewayService;
        this.inventoryRepository = inventoryRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public DonationResponse pledgeDonation(User donor, DonationPledgeRequest request) {
        if (request.getType() == DonationType.MONETARY && (request.getAmount() == null || request.getAmount() <= 0)) {
            throw new BusinessRuleException("Monetary donation requires a valid positive amount");
        }

        if (request.getType() == DonationType.PHYSICAL && (request.getItemName() == null || request.getItemName().isBlank() || request.getQuantity() == null || request.getQuantity() <= 0)) {
            throw new BusinessRuleException("Physical donation requires item name and a positive quantity");
        }

        String razorpayOrderId = null;
        String transactionId = null;

        if (request.getType() == DonationType.MONETARY) {
            razorpayOrderId = paymentGatewayService.createRazorpayOrderId(request.getAmount());
            transactionId = paymentGatewayService.generateTransactionId();
        }

        Donation donation = Donation.builder()
                .donor(donor)
                .type(request.getType())
                .amount(request.getAmount())
                .itemName(request.getItemName())
                .quantity(request.getQuantity())
                .status(request.getType() == DonationType.MONETARY ? DonationStatus.APPROVED : DonationStatus.PENDING)
                .razorpayOrderId(razorpayOrderId)
                .transactionId(transactionId)
                .build();

        Donation saved = donationRepository.save(donation);
        return mapToResponse(saved);
    }

    @Transactional
    public DonationResponse approveDonation(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + donationId));

        if (donation.getStatus() == DonationStatus.APPROVED) {
            throw new BusinessRuleException("Donation is already APPROVED");
        }

        donation.setStatus(DonationStatus.APPROVED);
        Donation updated = donationRepository.save(donation);

        // If physical donation, auto-increment or add to inventory!
        if (donation.getType() == DonationType.PHYSICAL && donation.getItemName() != null) {
            inventoryRepository.findAll().stream()
                    .filter(i -> i.getName().equalsIgnoreCase(donation.getItemName()))
                    .findFirst()
                    .ifPresentOrElse(
                            existingItem -> {
                                existingItem.setQuantity(existingItem.getQuantity() + donation.getQuantity());
                                inventoryRepository.save(existingItem);
                            },
                            () -> {
                                InventoryRequest newReq = new InventoryRequest();
                                newReq.setName(donation.getItemName());
                                newReq.setCategory("DONATION");
                                newReq.setQuantity(donation.getQuantity());
                                newReq.setUnit("units");
                                newReq.setMinimumThreshold(5);
                                inventoryService.createInventoryItem(newReq);
                            }
                    );
        }

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getAllDonations() {
        return donationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getDonorDonations(User donor) {
        return donationRepository.findByDonorOrderByCreatedAtDesc(donor).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DonationResponse mapToResponse(Donation donation) {
        return DonationResponse.builder()
                .id(donation.getId())
                .donorId(donation.getDonor() != null ? donation.getDonor().getId() : null)
                .donorName(donation.getDonor() != null ? donation.getDonor().getName() : "Anonymous Donor")
                .type(donation.getType())
                .amount(donation.getAmount())
                .itemName(donation.getItemName())
                .quantity(donation.getQuantity())
                .status(donation.getStatus())
                .transactionId(donation.getTransactionId())
                .razorpayOrderId(donation.getRazorpayOrderId())
                .createdAt(donation.getCreatedAt())
                .updatedAt(donation.getUpdatedAt())
                .build();
    }
}