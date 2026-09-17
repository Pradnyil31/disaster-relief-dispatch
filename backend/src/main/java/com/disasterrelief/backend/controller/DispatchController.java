package com.disasterrelief.backend.controller;

import com.disasterrelief.backend.dto.request.DispatchRequest;
import com.disasterrelief.backend.dto.request.DispatchStatusUpdateRequest;
import com.disasterrelief.backend.dto.response.DispatchResponse;
import com.disasterrelief.backend.model.User;
import com.disasterrelief.backend.repository.UserRepository;
import com.disasterrelief.backend.service.DispatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dispatch")
public class DispatchController {

    private final DispatchService dispatchService;
    private final UserRepository userRepository;

    public DispatchController(DispatchService dispatchService, UserRepository userRepository) {
        this.dispatchService = dispatchService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<DispatchResponse> createDispatchTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DispatchRequest request) {

        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        DispatchResponse response = dispatchService.createDispatchTask(request, admin);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DispatchResponse>> getAllDispatchTasks() {
        List<DispatchResponse> response = dispatchService.getAllDispatchTasks();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<DispatchResponse>> getMyDispatchTasks(@AuthenticationPrincipal UserDetails userDetails) {
        User volunteer = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        List<DispatchResponse> response = dispatchService.getVolunteerDispatchTasks(volunteer);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispatchResponse> getDispatchTaskById(@PathVariable Long id) {
        DispatchResponse response = dispatchService.getDispatchTaskById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DispatchResponse> updateTaskStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody DispatchStatusUpdateRequest request) {

        User actor = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        DispatchResponse response = dispatchService.updateTaskStatus(id, actor, request);
        return ResponseEntity.ok(response);
    }
}