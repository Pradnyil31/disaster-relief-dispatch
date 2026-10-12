package com.disasterrelief.backend.dto.response;

import com.disasterrelief.backend.model.Role;
import com.disasterrelief.backend.model.VolunteerStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private VolunteerStatus volunteerStatus;
    private String zone;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
