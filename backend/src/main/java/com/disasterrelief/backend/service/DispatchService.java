package com.disasterrelief.backend.service;

import com.disasterrelief.backend.dto.request.DispatchRequest;
import com.disasterrelief.backend.dto.request.DispatchStatusUpdateRequest;
import com.disasterrelief.backend.dto.response.DispatchResponse;
import com.disasterrelief.backend.exception.BusinessRuleException;
import com.disasterrelief.backend.exception.ResourceNotFoundException;
import com.disasterrelief.backend.model.*;
import com.disasterrelief.backend.repository.DispatchTaskRepository;
import com.disasterrelief.backend.repository.SosRequestRepository;
import com.disasterrelief.backend.repository.TaskStatusLogRepository;
import com.disasterrelief.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DispatchService {

    private final DispatchTaskRepository dispatchTaskRepository;
    private final SosRequestRepository sosRequestRepository;
    private final UserRepository userRepository;
    private final TaskStatusLogRepository taskStatusLogRepository;
    private final InventoryService inventoryService;

    public DispatchService(DispatchTaskRepository dispatchTaskRepository,
                           SosRequestRepository sosRequestRepository,
                           UserRepository userRepository,
                           TaskStatusLogRepository taskStatusLogRepository,
                           InventoryService inventoryService) {
        this.dispatchTaskRepository = dispatchTaskRepository;
        this.sosRequestRepository = sosRequestRepository;
        this.userRepository = userRepository;
        this.taskStatusLogRepository = taskStatusLogRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional
    public DispatchResponse createDispatchTask(DispatchRequest request, User admin) {
        SosRequest sosRequest = sosRequestRepository.findById(request.getSosRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("SOS Request not found with id: " + request.getSosRequestId()));

        if (dispatchTaskRepository.existsBySosRequestId(sosRequest.getId())) {
            throw new BusinessRuleException("A dispatch task has already been created for this SOS Request");
        }

        if (sosRequest.getStatus() == RequestStatus.CLOSED || sosRequest.getStatus() == RequestStatus.DELIVERED) {
            throw new BusinessRuleException("Cannot assign volunteer to a CLOSED or DELIVERED SOS Request");
        }

        User volunteer = userRepository.findById(request.getVolunteerId())
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer user not found with id: " + request.getVolunteerId()));

        if (volunteer.getRole() != Role.VOLUNTEER) {
            throw new BusinessRuleException("User with id " + request.getVolunteerId() + " does not have the VOLUNTEER role");
        }

        // Deduct inventory if specified
        if (request.getInventoryItemId() != null && request.getQuantityDeducted() != null && request.getQuantityDeducted() > 0) {
            inventoryService.deductStock(request.getInventoryItemId(), request.getQuantityDeducted());
        }

        String cleanNotes = request.getNotes() != null ? request.getNotes().trim() : null;

        DispatchTask task = DispatchTask.builder()
                .sosRequest(sosRequest)
                .volunteer(volunteer)
                .status(TaskStatus.ASSIGNED)
                .notes(cleanNotes)
                .build();

        // Update volunteer status to BUSY
        volunteer.setVolunteerStatus(VolunteerStatus.BUSY);
        userRepository.save(volunteer);

        DispatchTask savedTask = dispatchTaskRepository.save(task);

        // Update SOS request status
        sosRequest.setStatus(RequestStatus.ASSIGNED);
        sosRequestRepository.save(sosRequest);

        // Audit Log
        TaskStatusLog statusLog = TaskStatusLog.builder()
                .dispatchTask(savedTask)
                .oldStatus(null)
                .newStatus(TaskStatus.ASSIGNED)
                .changedBy(admin)
                .build();
        taskStatusLogRepository.save(statusLog);

        return mapToResponse(savedTask);
    }

    @Transactional
    public DispatchResponse updateTaskStatus(Long taskId, User actor, DispatchStatusUpdateRequest request) {
        DispatchTask task = dispatchTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch task not found with id: " + taskId));

        TaskStatus currentStatus = task.getStatus();
        TaskStatus targetStatus = request.getStatus();

        // Enforce sequential status progression: ASSIGNED -> EN_ROUTE -> DELIVERED
        validateSequentialStatus(currentStatus, targetStatus);

        task.setStatus(targetStatus);
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            task.setNotes(request.getNotes().trim());
        }

        if (targetStatus == TaskStatus.DELIVERED) {
            task.setDeliveredAt(LocalDateTime.now());
            task.getSosRequest().setStatus(RequestStatus.DELIVERED);
            if (task.getVolunteer() != null) {
                task.getVolunteer().setVolunteerStatus(VolunteerStatus.AVAILABLE);
                userRepository.save(task.getVolunteer());
            }
        } else if (targetStatus == TaskStatus.EN_ROUTE) {
            task.setEnRouteAt(LocalDateTime.now());
            task.getSosRequest().setStatus(RequestStatus.EN_ROUTE);
        }

        sosRequestRepository.save(task.getSosRequest());
        DispatchTask updatedTask = dispatchTaskRepository.save(task);

        // Audit Log
        TaskStatusLog statusLog = TaskStatusLog.builder()
                .dispatchTask(updatedTask)
                .oldStatus(currentStatus)
                .newStatus(targetStatus)
                .changedBy(actor)
                .build();
        taskStatusLogRepository.save(statusLog);

        return mapToResponse(updatedTask);
    }

    @Transactional(readOnly = true)
    public Page<DispatchResponse> getAllDispatchTasks(TaskStatus status, Pageable pageable) {
        Page<DispatchTask> page;
        if (status != null) {
            page = dispatchTaskRepository.findByStatus(status, pageable);
        } else {
            page = dispatchTaskRepository.findAll(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<DispatchResponse> getVolunteerDispatchTasks(User volunteer, TaskStatus status, Pageable pageable) {
        Page<DispatchTask> page;
        if (status != null) {
            page = dispatchTaskRepository.findByVolunteerAndStatus(volunteer, status, pageable);
        } else {
            page = dispatchTaskRepository.findByVolunteer(volunteer, pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public DispatchResponse getDispatchTaskById(Long taskId) {
        DispatchTask task = dispatchTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch task not found with id: " + taskId));
        return mapToResponse(task);
    }

    private void validateSequentialStatus(TaskStatus current, TaskStatus target) {
        if (current == TaskStatus.ASSIGNED && target != TaskStatus.EN_ROUTE) {
            throw new BusinessRuleException("Illegal status transition from ASSIGNED to " + target + ". Must transition to EN_ROUTE next.");
        }
        if (current == TaskStatus.EN_ROUTE && target != TaskStatus.DELIVERED) {
            throw new BusinessRuleException("Illegal status transition from EN_ROUTE to " + target + ". Must transition to DELIVERED next.");
        }
        if (current == TaskStatus.DELIVERED) {
            throw new BusinessRuleException("Dispatch task is already DELIVERED and cannot change status.");
        }
    }

    private DispatchResponse mapToResponse(DispatchTask task) {
        SosRequest sos = task.getSosRequest();
        User citizen = sos != null ? sos.getCitizen() : null;
        User volunteer = task.getVolunteer();

        // Resolve citizen phone: prefer SOS-level citizenPhone, fall back to user profile phone
        String citizenPhone = (sos != null && sos.getCitizenPhone() != null)
                ? sos.getCitizenPhone()
                : (citizen != null ? citizen.getPhone() : null);

        List<TaskStatusLog> history = taskStatusLogRepository.findByDispatchTaskOrderByChangedAtDesc(task);

        return DispatchResponse.builder()
                .id(task.getId())
                .sosId(sos != null ? sos.getId() : null)
                .citizenName(citizen != null ? citizen.getName() : "SMS Requester")
                .citizenPhone(citizenPhone)
                .locationName(sos != null ? sos.getLocationName() : null)
                .urgencyLevel(sos != null ? sos.getUrgencyLevel() : null)
                .requiredSupplies(sos != null ? sos.getRequiredSupplies() : new java.util.ArrayList<>())
                .volunteerId(volunteer != null ? volunteer.getId() : null)
                .volunteerName(volunteer != null ? volunteer.getName() : null)
                .volunteerPhone(volunteer != null ? volunteer.getPhone() : null)
                .status(task.getStatus())
                .notes(task.getNotes())
                .assignedAt(task.getAssignedAt())
                .enRouteAt(task.getEnRouteAt())
                .deliveredAt(task.getDeliveredAt())
                .history(history)
                .build();
    }
}