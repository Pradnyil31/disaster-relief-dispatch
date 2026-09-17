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
        SosRequest sosRequest = SosRequest.builder()
                .citizen(citizen)
                .urgencyLevel(request.getUrgencyLevel())
                .status(RequestStatus.PENDING)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .locationAddress(request.getLocationAddress())
                .suppliesNeeded(request.getSuppliesNeeded())
                .source(RequestSource.WEB)
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : citizen.getPhone())
                .build();

        SosRequest saved = sosRequestRepository.save(sosRequest);
        return mapToResponse(saved);
    }

    @Transactional
    public SosResponse processSmsWebhook(String fromPhone, String bodyText) {
        UrgencyLevel urgencyLevel = smsParserService.parseUrgency(bodyText);

        SosRequest sosRequest = SosRequest.builder()
                .citizen(null)
                .urgencyLevel(urgencyLevel)
                .status(RequestStatus.PENDING)
                .locationAddress("Extracted from SMS: " + bodyText)
                .suppliesNeeded(bodyText)
                .source(RequestSource.SMS)
                .phoneNumber(fromPhone)
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
    public List<SosResponse> getCitizenSosRequests(User citizen) {
        return sosRequestRepository.findByCitizenOrderByCreatedAtDesc(citizen).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
        return SosResponse.builder()
                .id(sosRequest.getId())
                .citizenId(sosRequest.getCitizen() != null ? sosRequest.getCitizen().getId() : null)
                .citizenName(sosRequest.getCitizen() != null ? sosRequest.getCitizen().getName() : "SMS Requester")
                .urgencyLevel(sosRequest.getUrgencyLevel())
                .status(sosRequest.getStatus())
                .latitude(sosRequest.getLatitude())
                .longitude(sosRequest.getLongitude())
                .locationAddress(sosRequest.getLocationAddress())
                .suppliesNeeded(sosRequest.getSuppliesNeeded())
                .source(sosRequest.getSource())
                .phoneNumber(sosRequest.getPhoneNumber())
                .createdAt(sosRequest.getCreatedAt())
                .updatedAt(sosRequest.getUpdatedAt())
                .build();
    }
}