package com.disasterrelief.backend.service;

import com.disasterrelief.backend.dto.request.UserCreateRequestDTO;
import com.disasterrelief.backend.dto.request.UserUpdateRequestDTO;
import com.disasterrelief.backend.dto.response.UserResponseDTO;
import com.disasterrelief.backend.exception.BusinessRuleException;
import com.disasterrelief.backend.exception.ResourceNotFoundException;
import com.disasterrelief.backend.model.Role;
import com.disasterrelief.backend.model.User;
import com.disasterrelief.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserManagementService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getAllUsers(Role role, Pageable pageable) {
        Page<User> users;
        if (role != null) {
            users = userRepository.findByRole(role, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(this::mapToResponse);
    }

    @Transactional
    public UserResponseDTO createUser(UserCreateRequestDTO request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessRuleException("Email is already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .zone(request.getZone())
                .isActive(true)
                .build();

        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponseDTO updateUser(Long id, UserUpdateRequestDTO request, User currentAdmin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getId().equals(currentAdmin.getId()) && !request.getIsActive()) {
            throw new BusinessRuleException("You cannot deactivate your own account");
        }

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setZone(request.getZone());
        user.setIsActive(request.getIsActive());

        return mapToResponse(userRepository.save(user));
    }

    private UserResponseDTO mapToResponse(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .volunteerStatus(user.getVolunteerStatus())
                .zone(user.getZone())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
