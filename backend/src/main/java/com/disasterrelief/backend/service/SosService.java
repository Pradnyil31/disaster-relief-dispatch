package com.disasterrelief.backend.service;

import com.disasterrelief.backend.dto.request.SosSubmitRequest;
import com.disasterrelief.backend.dto.response.SosResponse;
import com.disasterrelief.backend.exception.ResourceNotFoundException;
import com.disasterrelief.backend.model.*;
import com.disasterrelief.backend.repository.SosRequestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SosService {

    private final SosRequestRepository sosRequestRepository;
    private final SmsParserService smsParserService;

    public SosService(SosRequestRepository sosRequestRepository, SmsParserService smsParserService) {
        this.sosRequestRepository = sosRequestRepository;
        this.smsParserService = smsParserService;
    }

    @Transactional
    public SosResponse submitSosRequest(User citizen, SosSubmitRequest request) {
        String phone = request.getCitizenPhone() != null && !request.getCitizenPhone().isBlank()
                ? request.getCitizenPhone().trim()
                : citizen.getPhone();

        SosRequest sosRequest = SosRequest.builder()
                .citizen(citizen)
                .urgencyLevel(request.getUrgencyLevel())
                .status(RequestStatus.PENDING)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .locationName(request.getLocationName() != null ? request.getLocationName().trim() : null)
                .requiredSupplies(request.getRequiredSupplies() != null ? request.getRequiredSupplies() : new java.util.ArrayList<>())
                .source(RequestSource.WEB)
                .citizenPhone(phone)
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .build();

        SosRequest saved = sosRequestRepository.save(sosRequest);
        return mapToResponse(saved);
    }

    @Transactional
    public SosResponse processSmsWebhook(String fromPhone, String bodyText) {
        String cleanBody = bodyText != null ? bodyText.trim() : "";
        String cleanPhone = fromPhone != null ? fromPhone.trim() : "";
        UrgencyLevel urgencyLevel = smsParserService.parseUrgency(cleanBody);

        SosRequest sosRequest = SosRequest.builder()
                .citizen(null)
                .urgencyLevel(urgencyLevel)
                .status(RequestStatus.PENDING)
                .locationName("Extracted from SMS: " + cleanBody)
                .requiredSupplies(new java.util.ArrayList<>())
                .source(RequestSource.SMS)
                .citizenPhone(cleanPhone)
                .build();

        SosRequest saved = sosRequestRepository.save(sosRequest);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<SosResponse> getAllSosRequests(UrgencyLevel urgency, RequestStatus status, Pageable pageable) {
        Page<SosRequest> page;
        if (urgency != null && status != null) {
            page = sosRequestRepository.findByUrgencyLevelAndStatus(urgency, status, pageable);
        } else if (urgency != null) {
            page = sosRequestRepository.findByUrgencyLevel(urgency, pageable);
        } else if (status != null) {
            page = sosRequestRepository.findByStatus(status, pageable);
        } else {
            page = sosRequestRepository.findAll(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<SosResponse> getCitizenSosRequests(User citizen, UrgencyLevel urgency, RequestStatus status, Pageable pageable) {
        Page<SosRequest> page;
        if (urgency != null && status != null) {
            page = sosRequestRepository.findByCitizenAndUrgencyLevelAndStatus(citizen, urgency, status, pageable);
        } else if (urgency != null) {
            page = sosRequestRepository.findByCitizenAndUrgencyLevel(citizen, urgency, pageable);
        } else if (status != null) {
            page = sosRequestRepository.findByCitizenAndStatus(citizen, status, pageable);
        } else {
            page = sosRequestRepository.findByCitizen(citizen, pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public SosResponse getSosRequestById(Long id) {
        SosRequest sosRequest = sosRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SOS Request not found with id: " + id));
        return mapToResponse(sosRequest);
    }

    @Transactional
    public SosResponse updateSosStatus(Long id, RequestStatus newStatus) {
        SosRequest sosRequest = sosRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SOS Request not found with id: " + id));

        sosRequest.setStatus(newStatus);
        SosRequest updated = sosRequestRepository.save(sosRequest);
        return mapToResponse(updated);
    }

    private SosResponse mapToResponse(SosRequest sosRequest) {
        User citizen = sosRequest.getCitizen();
        String phone = sosRequest.getCitizenPhone() != null
                ? sosRequest.getCitizenPhone()
                : (citizen != null ? citizen.getPhone() : null);
        return SosResponse.builder()
                .id(sosRequest.getId())
                .citizenId(citizen != null ? citizen.getId() : null)
                .citizenName(citizen != null ? citizen.getName() : "SMS Requester")
                .urgencyLevel(sosRequest.getUrgencyLevel())
                .status(sosRequest.getStatus())
                .latitude(sosRequest.getLatitude())
                .longitude(sosRequest.getLongitude())
                .locationName(sosRequest.getLocationName())
                .requiredSupplies(sosRequest.getRequiredSupplies())
                .source(sosRequest.getSource())
                .citizenPhone(phone)
                .notes(sosRequest.getNotes())
                .createdAt(sosRequest.getCreatedAt())
                .updatedAt(sosRequest.getUpdatedAt())
                .build();
    }
}