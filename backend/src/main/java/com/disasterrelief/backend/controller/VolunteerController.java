package com.disasterrelief.backend.controller;

import com.disasterrelief.backend.dto.request.VolunteerStatusUpdateRequest;
import com.disasterrelief.backend.dto.response.VolunteerResponse;
import com.disasterrelief.backend.exception.ResourceNotFoundException;
import com.disasterrelief.backend.model.Role;
import com.disasterrelief.backend.model.User;
import com.disasterrelief.backend.model.VolunteerStatus;
import com.disasterrelief.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.disasterrelief.backend.repository.DispatchTaskRepository;
import com.disasterrelief.backend.model.TaskStatus;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/volunteers")
public class VolunteerController {

    private final UserRepository userRepository;
    private final DispatchTaskRepository dispatchTaskRepository;

    public VolunteerController(UserRepository userRepository, DispatchTaskRepository dispatchTaskRepository) {
        this.userRepository = userRepository;
        this.dispatchTaskRepository = dispatchTaskRepository;
    }

    @GetMapping
    public ResponseEntity<List<VolunteerResponse>> getAllVolunteers(
            @RequestParam(required = false) VolunteerStatus status) {

        List<User> volunteers = userRepository.findByRole(Role.VOLUNTEER);

        List<VolunteerResponse> response = volunteers.stream()
                .filter(v -> status == null || v.getVolunteerStatus() == status)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VolunteerResponse> updateVolunteerStatus(
            @PathVariable Long id,
            @Valid @RequestBody VolunteerStatusUpdateRequest request) {

        User volunteer = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + id));

        volunteer.setVolunteerStatus(request.getStatus());
        User updated = userRepository.save(volunteer);

        return ResponseEntity.ok(mapToResponse(updated));
    }

    private VolunteerResponse mapToResponse(User volunteer) {
        int activeTasksCount = dispatchTaskRepository.countByVolunteerAndStatusNot(volunteer, TaskStatus.DELIVERED);

        return VolunteerResponse.builder()
                .id(volunteer.getId())
                .name(volunteer.getName())
                .email(volunteer.getEmail())
                .phone(volunteer.getPhone())
                .status(volunteer.getVolunteerStatus() != null ? volunteer.getVolunteerStatus() : VolunteerStatus.AVAILABLE)
                .zone(volunteer.getZone() != null ? volunteer.getZone() : "General Relief Zone")
                .activeTasksCount(activeTasksCount)
                .build();
    }
}
