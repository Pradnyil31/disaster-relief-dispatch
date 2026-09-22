package com.disasterrelief.backend.controller;

import com.disasterrelief.backend.dto.request.DonationPledgeRequest;
import com.disasterrelief.backend.dto.response.DonationResponse;
import com.disasterrelief.backend.model.User;
import com.disasterrelief.backend.repository.UserRepository;
import com.disasterrelief.backend.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/donations")
public class DonationController {

    private final DonationService donationService;
    private final UserRepository userRepository;

    public DonationController(DonationService donationService, UserRepository userRepository) {
        this.donationService = donationService;
        this.userRepository = userRepository;
    }

    @PostMapping("/pledge")
    public ResponseEntity<DonationResponse> pledgeDonation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DonationPledgeRequest request) {

        User donor = null;
        if (userDetails != null) {
            donor = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        }

        DonationResponse response = donationService.pledgeDonation(donor, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DonationResponse>> getAllDonations() {
        List<DonationResponse> response = donationService.getAllDonations();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<DonationResponse>> getMyDonations(@AuthenticationPrincipal UserDetails userDetails) {
        User donor = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        List<DonationResponse> response = donationService.getDonorDonations(donor);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<DonationResponse> approveDonation(@PathVariable Long id) {
        DonationResponse response = donationService.approveDonation(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<DonationResponse> rejectDonation(@PathVariable Long id) {
        DonationResponse response = donationService.rejectDonation(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/verify-payment")
    public ResponseEntity<DonationResponse> verifyPayment(@PathVariable Long id) {
        DonationResponse response = donationService.verifyPayment(id);
        return ResponseEntity.ok(response);
    }
}