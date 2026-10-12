package com.disasterrelief.backend.controller;

import com.disasterrelief.backend.dto.request.UserCreateRequestDTO;
import com.disasterrelief.backend.dto.request.UserUpdateRequestDTO;
import com.disasterrelief.backend.dto.response.UserResponseDTO;
import com.disasterrelief.backend.model.Role;
import com.disasterrelief.backend.model.User;
import com.disasterrelief.backend.repository.UserRepository;
import com.disasterrelief.backend.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class UserManagementController {

    private final UserManagementService userManagementService;
    private final UserRepository userRepository;

    public UserManagementController(UserManagementService userManagementService, UserRepository userRepository) {
        this.userManagementService = userManagementService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(userManagementService.getAllUsers(role, pageable));
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserCreateRequestDTO request) {
        return new ResponseEntity<>(userManagementService.createUser(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequestDTO request,
            Authentication authentication) {
        User currentAdmin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current admin not found"));
        return ResponseEntity.ok(userManagementService.updateUser(id, request, currentAdmin));
    }
}
