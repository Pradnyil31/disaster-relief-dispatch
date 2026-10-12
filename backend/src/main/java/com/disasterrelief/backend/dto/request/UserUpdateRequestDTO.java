package com.disasterrelief.backend.dto.request;

import com.disasterrelief.backend.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserUpdateRequestDTO {
    @NotBlank(message = "Name is required")
    private String name;

    private String phone;

    @NotNull(message = "Role is required")
    private Role role;
    
    private String zone;

    @NotNull(message = "Active status is required")
    private Boolean isActive;
}
