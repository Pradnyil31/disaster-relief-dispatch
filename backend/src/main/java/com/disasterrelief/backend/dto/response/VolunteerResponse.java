package com.disasterrelief.backend.dto.response;

import com.disasterrelief.backend.model.VolunteerStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VolunteerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private VolunteerStatus status;
    private String zone;
    private int activeTasksCount;
}
