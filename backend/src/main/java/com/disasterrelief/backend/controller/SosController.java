package com.disasterrelief.backend.controller;

import com.disasterrelief.backend.dto.request.SosStatusUpdateRequest;
import com.disasterrelief.backend.dto.request.SosSubmitRequest;
import com.disasterrelief.backend.dto.response.SosResponse;
import com.disasterrelief.backend.model.RequestStatus;
import com.disasterrelief.backend.model.UrgencyLevel;
import com.disasterrelief.backend.model.User;
import com.disasterrelief.backend.repository.UserRepository;
import com.disasterrelief.backend.service.SosService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sos")
public class SosController {

    private final SosService sosService;
    private final UserRepository userRepository;

    public SosController(SosService sosService, UserRepository userRepository) {
        this.sosService = sosService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<SosResponse> submitSos(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SosSubmitRequest request) {

        User citizen = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        SosResponse response = sosService.submitSosRequest(citizen, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping(value = "/webhook/sms", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<SosResponse> handleSmsWebhook(
            @RequestParam("From") String from,
            @RequestParam("Body") String body) {

        SosResponse response = sosService.processSmsWebhook(from, body);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<SosResponse>> getAllSos(
            @RequestParam(required = false) UrgencyLevel urgency,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SosResponse> response = sosService.getAllSosRequests(urgency, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<SosResponse>> getMySos(@AuthenticationPrincipal UserDetails userDetails) {
        User citizen = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        List<SosResponse> response = sosService.getCitizenSosRequests(citizen);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SosResponse> getSosById(@PathVariable Long id) {
        SosResponse response = sosService.getSosRequestById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SosResponse> updateSosStatus(
            @PathVariable Long id,
            @Valid @RequestBody SosStatusUpdateRequest request) {

        SosResponse response = sosService.updateSosStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }
}